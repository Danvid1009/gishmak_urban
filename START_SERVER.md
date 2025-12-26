# How to Start the Dictionary

## Quick Start

1. **Start the server:**
   ```bash
   npm start
   ```
   Or:
   ```bash
   node server.js
   ```

2. **Open your browser:**
   Go to `http://localhost:3000`

## What Changed

I've created a simple Node.js proxy server that:
- Serves your HTML/CSS/JS files
- Proxies requests to Google Apps Script (bypassing CORS issues)
- Runs on port 3000

## Why This Works

Google Apps Script sometimes has CORS issues when accessed directly from the browser. The proxy server runs on your local machine and forwards requests to Google Apps Script, adding the necessary CORS headers. This completely bypasses the CORS problem!

## Updating the Google Apps Script URL

If you need to change the Google Apps Script URL, edit `server.js` and update this line:
```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_SCRIPT_URL_HERE';
```

Then restart the server.

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

