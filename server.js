// Simple Node.js proxy server to bypass CORS issues with Google Apps Script
const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs');

const PORT = 3000;
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzvxQzwYF0iF-8Ebj4lSYAspCNRjzzlbl1KaAUKgEHi3ykTMF80zWBTk6Mvka9q8As/exec';

// Serve static files
function serveStaticFile(filePath, res) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// Proxy request to Google Apps Script
function proxyToGoogleScript(req, res, method, data) {
    const parsedUrl = url.parse(req.url, true);
    let requestUrl = GOOGLE_SCRIPT_URL;
    
    // Add query parameters for GET requests
    if (method === 'GET' && parsedUrl.query) {
        const queryString = new URLSearchParams(parsedUrl.query).toString();
        requestUrl = `${GOOGLE_SCRIPT_URL}?${queryString}`;
    }

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        maxRedirects: 5, // Follow redirects
        followRedirect: true
    };

    const makeRequest = (urlToUse, redirectCount = 0) => {
        if (redirectCount > 5) {
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ success: false, error: 'Too many redirects' }));
            return;
        }

        const parsedUrl = require('url').parse(urlToUse);
        const isHttps = parsedUrl.protocol === 'https:';
        const httpModule = isHttps ? https : http;

        const requestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: parsedUrl.path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const proxyReq = httpModule.request(requestOptions, (proxyRes) => {
            // Handle redirects (302, 301, etc.)
            if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
                let redirectUrl = proxyRes.headers.location;
                // Handle relative redirects
                if (!redirectUrl.startsWith('http')) {
                    redirectUrl = `${parsedUrl.protocol}//${parsedUrl.host}${redirectUrl}`;
                }
                console.log(`Following redirect ${redirectCount + 1} to: ${redirectUrl}`);
                makeRequest(redirectUrl, redirectCount + 1);
                return;
            }

            // Set CORS headers
            res.writeHead(proxyRes.statusCode, {
                'Content-Type': proxyRes.headers['content-type'] || 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            });

            proxyRes.pipe(res);
        });

        proxyReq.on('error', (error) => {
            console.error('Proxy error:', error);
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ success: false, error: error.message }));
        });

        if (method === 'POST' && data) {
            proxyReq.write(JSON.stringify(data));
        }

        proxyReq.end();
    };

    makeRequest(requestUrl);
}

const server = http.createServer((req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // API endpoints
    if (pathname === '/api/read') {
        proxyToGoogleScript(req, res, 'GET');
        return;
    }

    if (pathname === '/api/write' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                proxyToGoogleScript(req, res, 'POST', data);
            } catch (error) {
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = '.' + pathname;
    if (filePath === './') {
        filePath = './index.html';
    }

    serveStaticFile(filePath, res);
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Proxy to Google Apps Script: ${GOOGLE_SCRIPT_URL}`);
});

