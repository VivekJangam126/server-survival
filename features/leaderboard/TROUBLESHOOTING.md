# Leaderboard Navigation Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Navigation from Challenges to Leaderboard Fails

**Symptoms:**
- Error when clicking Leaderboard from challenges page
- "Failed to load page" or similar error messages
- Blank page or loading state that never completes

**Root Cause:**
Navigation path resolution issues when moving between subdirectories.

**Solution Applied:**
Updated `shared/navbar.js` with improved path resolution that converts relative URLs to absolute URLs from the root.

### Issue 2: ES6 Module Import Errors

**Symptoms:**
- "Failed to load module" errors in console
- Import/export syntax errors
- Components not loading

**Potential Causes:**
1. Server not configured to serve `.js` files with correct MIME type
2. Browser doesn't support ES6 modules
3. Relative import paths not resolving correctly

**Solutions:**

#### Option 1: Use Debug Page
Navigate to `leaderboard/debug-leaderboard.html` to test functionality without ES6 modules.

#### Option 2: Check Server Configuration
Ensure your web server serves `.js` files with `Content-Type: application/javascript` or `text/javascript`.

#### Option 3: Use Simple Test
Navigate to `leaderboard/simple-test.html` to generate test data and verify basic functionality.

### Issue 3: No Leaderboard Data

**Symptoms:**
- "No attempts yet for this challenge" message
- Empty leaderboard tables
- Challenge selector shows no options

**Solution:**
1. Navigate to `leaderboard/simple-test.html`
2. Click "Generate Test Data"
3. Navigate back to main leaderboard page
4. Select a challenge from the dropdown

### Issue 4: Profile Card Not Showing

**Symptoms:**
- Profile icon visible but hover card doesn't appear
- Profile data not loading

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify localStorage access is working
3. Test profile functionality on `test-profile-navbar.html`

## Testing Steps

### Step 1: Basic Functionality Test
1. Open `leaderboard/simple-test.html`
2. Click "Test Basic Functionality"
3. Verify all tests pass

### Step 2: Generate Test Data
1. On the same page, click "Generate Test Data"
2. Verify success message appears

### Step 3: Test Navigation
1. Navigate to `challenges/challenges.html`
2. Click "Leaderboard" in navbar
3. Verify successful navigation

### Step 4: Test Leaderboard
1. On leaderboard page, select "Cloud Computing Fundamentals" from dropdown
2. Verify leaderboard table appears with test data
3. Check that rankings are correct (highest percentage first)

### Step 5: Test Profile
1. Hover over profile icon in navbar
2. Verify profile card appears
3. Click profile icon to navigate to profile page

## Debug Information

### Check Browser Console
Open browser developer tools (F12) and check for:
- Network errors (failed to load resources)
- JavaScript errors (import/export issues)
- CORS errors (cross-origin issues)

### Verify File Paths
Ensure these files exist:
- `shared/navbar.html`
- `shared/navbar.js`
- `leaderboard/leaderboard.html`
- `leaderboard/LeaderboardPageController.js`
- `leaderboard/components/MCQLeaderboardTable.js`
- `src/challenges/mcq.data.js`
- `src/challenges/mcq.attempts.js`

### Check localStorage
In browser console, run:
```javascript
// Check for MCQ attempts
console.log(localStorage.getItem('mcq_attempts'));

// Check for profile data
console.log(localStorage.getItem('userProfile'));
```

## Quick Fixes

### Fix 1: Clear Browser Cache
Hard refresh the page (Ctrl+F5 or Cmd+Shift+R) to clear cached resources.

### Fix 2: Use Absolute URLs
If navigation still fails, manually navigate using full URLs:
- `http://localhost:port/leaderboard/leaderboard.html`
- `http://localhost:port/challenges/challenges.html`

### Fix 3: Disable ES6 Modules Temporarily
Use the debug pages that don't rely on ES6 modules:
- `leaderboard/debug-leaderboard.html`
- `leaderboard/simple-test.html`

## Contact Information

If issues persist:
1. Check browser console for specific error messages
2. Verify web server is running and serving files correctly
3. Test with different browsers
4. Ensure all files are present and have correct permissions

## File Structure Reference

```
project-root/
├── shared/
│   ├── navbar.html
│   └── navbar.js
├── leaderboard/
│   ├── leaderboard.html
│   ├── LeaderboardPageController.js
│   ├── mcqLeaderboard.logic.js
│   ├── mcqLeaderboard.datasource.js
│   ├── leaderboard.constants.js
│   ├── debug-leaderboard.html
│   ├── simple-test.html
│   └── components/
│       ├── MCQLeaderboardTable.js
│       ├── LeaderboardTabs.js
│       └── ComingSoon.js
├── challenges/
│   └── challenges.html
└── src/
    └── challenges/
        ├── mcq.data.js
        └── mcq.attempts.js
```