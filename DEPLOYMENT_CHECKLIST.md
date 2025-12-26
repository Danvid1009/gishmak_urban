# Google Apps Script Deployment Checklist

## ⚠️ "Failed to fetch" Error Fix

If you're getting "Failed to fetch", follow these steps **exactly**:

### Step 1: Verify Your Google Sheet
- [ ] Open your Google Sheet
- [ ] Check the tab name at the bottom (usually "Sheet1")
- [ ] Make sure you have headers in Row 1: Word, Pronunciation, Definition, Example
- [ ] Make sure you have at least one data row

### Step 2: Check Apps Script Code
- [ ] Open **Extensions** > **Apps Script** in your Google Sheet
- [ ] Verify the code from `google-apps-script.js` is pasted
- [ ] **CRITICAL**: Check line 14 - make sure `SHEET_NAME` matches your tab name
  ```javascript
  const SHEET_NAME = 'Sheet1';  // Change this if your tab has a different name
  ```
- [ ] Click **Save** (File > Save or Ctrl+S / Cmd+S)

### Step 3: Deploy as Web App (MOST IMPORTANT)
- [ ] Click **Deploy** > **New deployment** (or **Manage deployments** if one exists)
- [ ] Click the **gear icon** ⚙️ and select **Web app**
- [ ] Set these EXACT settings:
  - **Description**: (optional, can leave blank)
  - **Execute as**: **Me** (your email)
  - **Who has access**: **Anyone** ⚠️ THIS IS CRITICAL!
- [ ] Click **Deploy**
- [ ] If prompted, click **Authorize access**
- [ ] Choose your Google account
- [ ] Click **Advanced** > **Go to [Project Name] (unsafe)**
- [ ] Click **Allow**
- [ ] **Copy the Web App URL** (starts with `https://script.google.com/macros/s/...`)
- [ ] Click **Done**

### Step 4: Update Your Script
- [ ] Open `script.js` in your project
- [ ] Replace the URL on line 2 with your NEW Web App URL
- [ ] Save the file

### Step 5: Test Directly
- [ ] Open the Web App URL directly in your browser
- [ ] Add `?action=read` to the end: `https://script.google.com/macros/s/.../exec?action=read`
- [ ] You should see JSON like: `{"success":true,"data":[...]}`
- [ ] If you see "Access Denied" or HTML, go back to Step 3

### Step 6: If Still Not Working

**Option A: Redeploy**
- [ ] Go to **Deploy** > **Manage deployments**
- [ ] Click the **pencil icon** (edit)
- [ ] Make sure "Who has access" is **Anyone**
- [ ] Click **Deploy** (this creates a new version)
- [ ] Copy the NEW URL
- [ ] Update `script.js` with the new URL

**Option B: Check Browser Console**
- [ ] Open your browser's Developer Tools (F12)
- [ ] Go to the **Console** tab
- [ ] Look for detailed error messages
- [ ] Share those errors if you need help

## Common Issues

### "Access Denied"
- The script isn't deployed as a web app, OR
- "Who has access" is not set to "Anyone"

### "Failed to fetch"
- CORS issue - usually means deployment permissions are wrong
- Try redeploying with "Anyone" access

### Empty data or wrong data
- Check that `SHEET_NAME` in the Apps Script matches your tab name
- Make sure your data starts in Row 2 (Row 1 is headers)

## Quick Test

Paste this in your browser's address bar (replace with your URL):
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=read
```

You should see JSON, not HTML.

