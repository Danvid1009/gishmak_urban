/**
 * Google Apps Script for Gishmak Dictionary
 * 
 * Instructions:
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Name it "Gishmak Dictionary" (or any name you prefer)
 * 3. In the first row, add these headers: Word, Pronunciation, Definition, Example
 * 4. Go to Extensions > Apps Script
 * 5. Delete the default code and paste this entire file
 * 6. Replace 'YOUR_SHEET_NAME' with the name of your sheet (usually "Sheet1")
 * 7. Save the script (File > Save)
 * 8. Click "Deploy" > "New deployment"
 * 9. Click the gear icon and select "Web app"
 * 10. Set "Execute as" to "Me"
 * 11. Set "Who has access" to "Anyone"
 * 12. Click "Deploy" and copy the Web App URL
 * 13. Paste that URL into script.js in the GOOGLE_SCRIPT_URL constant
 */

// Configuration: Replace with your sheet name (usually "Sheet1")
const SHEET_NAME = 'Sheet1';

/**
 * Handle GET requests (read dictionary)
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: `Sheet "${SHEET_NAME}" not found. Please check your sheet name.`
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    
    // Skip header row and convert to objects
    const entries = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row[0] || row[0].toString().trim() === '') {
        continue;
      }
      
      entries.push({
        word: row[0] ? row[0].toString().trim() : '',
        pronunciation: row[1] ? row[1].toString().trim() : '',
        definition: row[2] ? row[2].toString().trim() : '',
        example: row[3] ? row[3].toString().trim() : ''
      });
    }

    const output = ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        data: entries
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
    // Add CORS headers
    return output;
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests (write new entry)
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: `Sheet "${SHEET_NAME}" not found. Please check your sheet name.`
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Parse the request data
    const requestData = JSON.parse(e.postData.contents);
    
    if (requestData.action !== 'write') {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: 'Invalid action'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const entryData = requestData.data;
    
    // Validate required fields
    if (!entryData.word || !entryData.definition) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: 'Word and Definition are required fields'
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Append the new row to the sheet
    sheet.appendRow([
      entryData.word.trim(),
      entryData.pronunciation ? entryData.pronunciation.trim() : '',
      entryData.definition.trim(),
      entryData.example ? entryData.example.trim() : ''
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: 'Entry added successfully'
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

