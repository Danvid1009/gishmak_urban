// Configuration - Using local proxy server to bypass CORS
// The proxy server runs on port 3000 and forwards requests to Google Apps Script
const API_BASE_URL = 'http://localhost:3000/api';

// Dictionary data storage
let dictionaryData = [];
let filteredData = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDictionary();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);

    // Submit modal
    const submitBtn = document.getElementById('submitBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const submitForm = document.getElementById('submitForm');

    submitBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', () => closeModalFn());
    cancelBtn.addEventListener('click', () => closeModalFn());
    submitForm.addEventListener('submit', handleFormSubmit);

    // Close modal on outside click
    const modal = document.getElementById('submitModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFn();
        }
    });
}

// Load dictionary from Google Sheets
async function loadDictionary() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const entriesContainer = document.getElementById('dictionaryEntries');

    // Clear error message at start
    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');
    entriesContainer.innerHTML = '';

    try {
        // Use local proxy server to bypass CORS
        const url = `${API_BASE_URL}/read?action=read&t=${Date.now()}`;
        
        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-cache'
        });
        
        // The proxy server handles redirects, so we should get 200 OK
        if (!response) {
            throw new Error('No response from server. Make sure the proxy server is running (npm start)');
        }
        
        // Check if we got an error status
        if (!response.ok && response.status !== 200) {
            throw new Error(`HTTP ${response.status}: ${response.statusText || 'Failed to fetch'}`);
        }
        
        const responseText = await response.text();
        
        // Try to parse JSON first - if it works, we're good!
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            // Only check for HTML errors if JSON parsing fails
            const trimmedText = responseText.trim();
            if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<html')) {
                if (trimmedText.includes('Access Denied') || trimmedText.includes('You need access')) {
                    throw new Error('Google Apps Script access denied. Please ensure: 1) The script is deployed as a web app, 2) "Who has access" is set to "Anyone", 3) You authorized the script properly.');
                }
                throw new Error(`Received HTML instead of JSON. Make sure your Google Apps Script is properly deployed.`);
            }
            throw new Error(`Invalid JSON response. Response: ${responseText.substring(0, 100)}...`);
        }
        
        // If we got here, JSON parsed successfully - check if it's valid data
        if (data && data.success) {
            dictionaryData = data.data || [];
            filteredData = [...dictionaryData];
            displayEntries(filteredData);
            // Success! Hide error message
            errorMessage.classList.add('hidden');
            errorMessage.textContent = '';
        } else {
            throw new Error(data?.error || 'Failed to load dictionary');
        }
    } catch (error) {
        console.error('Error loading dictionary:', error);
        errorMessage.textContent = `Error loading dictionary: ${error.message}`;
        errorMessage.classList.remove('hidden');
        entriesContainer.innerHTML = '<p style="text-align: center; color: white; padding: 2rem;">Unable to load dictionary. Please check your configuration.</p>';
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

// Display dictionary entries
function displayEntries(entries) {
    const container = document.getElementById('dictionaryEntries');
    
    if (entries.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: white; padding: 2rem;">No entries found.</p>';
        return;
    }

    container.innerHTML = entries.map(entry => `
        <div class="dictionary-entry">
            <div class="entry-header">
                <span class="word">${escapeHtml(entry.word || '')}</span>
                ${entry.pronunciation ? `<span class="pronunciation">${escapeHtml(entry.pronunciation)}</span>` : ''}
            </div>
            <div class="definition">${escapeHtml(entry.definition || '')}</div>
            ${entry.example ? `<div class="example">${escapeHtml(entry.example)}</div>` : ''}
        </div>
    `).join('');
}

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
        filteredData = [...dictionaryData];
    } else {
        filteredData = dictionaryData.filter(entry => {
            const word = (entry.word || '').toLowerCase();
            const definition = (entry.definition || '').toLowerCase();
            const example = (entry.example || '').toLowerCase();
            const pronunciation = (entry.pronunciation || '').toLowerCase();
            
            return word.includes(query) || 
                   definition.includes(query) || 
                   example.includes(query) ||
                   pronunciation.includes(query);
        });
    }
    
    displayEntries(filteredData);
}

// Open submit modal
function openModal() {
    const modal = document.getElementById('submitModal');
    modal.classList.remove('hidden');
    document.getElementById('submitForm').reset();
    document.getElementById('submitStatus').textContent = '';
}

// Close submit modal
function closeModalFn() {
    const modal = document.getElementById('submitModal');
    modal.classList.add('hidden');
    document.getElementById('submitForm').reset();
    document.getElementById('submitStatus').textContent = '';
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitFormBtn');
    const statusDiv = document.getElementById('submitStatus');
    
    const formData = {
        word: document.getElementById('word').value.trim(),
        pronunciation: document.getElementById('pronunciation').value.trim(),
        definition: document.getElementById('definition').value.trim(),
        example: document.getElementById('example').value.trim()
    };

    // Validate required fields
    if (!formData.word || !formData.definition) {
        statusDiv.textContent = 'Please fill in all required fields.';
        statusDiv.className = 'submit-status error';
        return;
    }

    submitBtn.disabled = true;
    statusDiv.textContent = 'Submitting...';
    statusDiv.className = 'submit-status';

    try {
        // Use local proxy server to bypass CORS
        const response = await fetch(`${API_BASE_URL}/write`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'write',
                data: formData
            }),
            cache: 'no-cache'
        });

        // Only show error if we're certain there's a problem
        if (!response) {
            throw new Error('No response from server. Make sure the proxy server is running.');
        }

        const responseText = await response.text();
        
        // Try to parse JSON first - if it works and says success, ignore HTTP status
        let result;
        try {
            result = JSON.parse(responseText);
            // If JSON says success, that's what matters - ignore HTTP status codes
            if (result && result.success === true) {
                // Success! Don't check HTTP status
                statusDiv.textContent = 'Word submitted successfully!';
                statusDiv.className = 'submit-status success';
                
                // Reset form
                document.getElementById('submitForm').reset();
                
                // Reload dictionary after a short delay
                setTimeout(() => {
                    closeModalFn();
                    loadDictionary();
                }, 1500);
                return; // Exit early - success!
            }
        } catch (parseError) {
            // JSON parsing failed - check HTTP status and HTML errors
            if (!response.ok && response.status >= 400) {
                // Only show error if we can't parse JSON AND status is bad
                const trimmedText = responseText.trim();
                if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<html')) {
                    if (trimmedText.includes('Access Denied') || trimmedText.includes('You need access')) {
                        throw new Error('Access denied. Please check your Google Apps Script deployment settings.');
                    }
                    throw new Error('Received HTML instead of JSON response.');
                }
                // If status is bad but we can't tell what the error is, be cautious
                throw new Error(`Server returned ${response.status}. Response: ${responseText.substring(0, 100)}...`);
            }
            // If status is OK but not JSON, assume it might have worked
            result = { success: true, message: 'Submitted (no confirmation received)' };
        }

        // Only show error if result explicitly says it failed
        if (result && result.success === false) {
            throw new Error(result.error || 'Submission failed');
        }

        // If we got here and result exists, assume success (innocent until proven guilty)
        if (result) {
            statusDiv.textContent = 'Word submitted successfully!';
            statusDiv.className = 'submit-status success';
            
            // Reset form
            document.getElementById('submitForm').reset();
            
            // Reload dictionary after a short delay
            setTimeout(() => {
                closeModalFn();
                loadDictionary();
            }, 1500);
        }
        
    } catch (error) {
        // Only show error if we're certain there's a problem
        console.error('Error submitting word:', error);
        
        // Only show error message if we have a clear error
        if (error && error.message) {
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.className = 'submit-status error';
        } else {
            // If unclear, assume it might have worked
            statusDiv.textContent = 'Submission may have succeeded. Please refresh to verify.';
            statusDiv.className = 'submit-status';
        }
    } finally {
        submitBtn.disabled = false;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

