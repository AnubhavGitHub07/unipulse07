# Fix "Failed to Fetch" Login Error

## ✅ Good News:
1. ✅ Backend is running (health check works)
2. ✅ Login API works (curl test successful)
3. ✅ CORS is configured correctly
4. ✅ Admin account exists

## The Problem:
"Failed to fetch" usually means the browser can't reach the backend or there's a JavaScript error.

## Solution Steps:

### Step 1: Restart Backend Server (Important!)

The backend needs to be restarted to pick up the password verification fix:

1. **Stop the backend** (in the terminal where it's running):
   - Press `Ctrl + C`

2. **Start it again:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2: Check Browser Console

1. Open http://localhost:3000
2. Press `F12` (Developer Tools)
3. Go to **Console** tab
4. Try logging in
5. Look for any red error messages

### Step 3: Check Network Tab

1. In Developer Tools, go to **Network** tab
2. Try logging in
3. Look for the request to `/api/auth/login`
4. Check:
   - Status code (should be 200)
   - If it says "Failed" or "CORS error"

### Step 4: Verify API URL

Make sure `frontend/js/api.js` has:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

### Step 5: Hard Refresh Browser

- **Windows**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### Step 6: Test Login Directly

Open browser console and run:
```javascript
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({student_id: 'admin', password: 'admin123'})
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

Should return: `{access_token: "...", token_type: "bearer", user: {...}}`

## Common Issues:

### Issue 1: Backend Not Running
- Check: `curl http://localhost:8000/health`
- Should return: `{"status":"healthy"}`

### Issue 2: Wrong Port
- Frontend running on port 3000?
- Backend running on port 8000?
- Check both terminals

### Issue 3: CORS Error
- Backend CORS should allow `http://localhost:3000`
- Check backend logs when you try to login

### Issue 4: JavaScript Error
- Check browser console for errors
- Make sure all JS files are loading

## Quick Fix Checklist:

- [ ] Backend server restarted after password fix
- [ ] Frontend server running on port 3000
- [ ] Backend server running on port 8000
- [ ] Browser console checked for errors
- [ ] Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] API URL is `http://localhost:8000` in `api.js`

## Still Not Working?

Check backend terminal logs - you should see the request coming in when you try to login. If you don't see anything, the request isn't reaching the backend.

