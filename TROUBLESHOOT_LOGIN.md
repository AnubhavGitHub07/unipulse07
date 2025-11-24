# Troubleshooting Login Issues

## Issue: Stuck at Login Page

If you're entering student ID and password but nothing happens, follow these steps:

### 1. Check Backend is Running

Open Terminal and check:
```bash
curl http://localhost:8000/health
```

Should return: `{"status":"healthy"}`

If not, start backend:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Check Frontend is Running

In another terminal:
```bash
cd frontend
python3 -m http.server 3000
```

Visit: http://localhost:3000

### 3. Check Browser Console for Errors

1. Open browser (Chrome/Firefox)
2. Press `F12` to open Developer Tools
3. Go to "Console" tab
4. Try logging in
5. Look for any red error messages

Common errors:
- **CORS error**: Backend CORS not configured properly
- **Network error**: Backend not running or wrong URL
- **404 error**: API endpoint not found

### 4. Verify API URL

Check `frontend/js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

Make sure it matches your backend URL.

### 5. Create Admin Account First

Before logging in, create an account:

**Using Swagger UI:**
1. Go to: http://localhost:8000/docs
2. Find `/api/auth/register`
3. Click "Try it out"
4. Enter:
```json
{
  "student_id": "admin",
  "name": "Admin User",
  "password": "admin123",
  "role": "admin"
}
```
5. Click "Execute"

**Using curl:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "admin",
    "name": "Admin User",
    "password": "admin123",
    "role": "admin"
  }'
```

### 6. Try Login

1. Go to http://localhost:3000
2. Enter:
   - Student ID: `admin`
   - Password: `admin123`
3. Click "Login"

### 7. Check Auto-Registration

The login page should auto-register accounts on first login if they don't exist (for demo). Check:
- Browser console for any errors
- Network tab in Developer Tools to see if API calls are being made

### 8. Test API Directly

Test login API directly:
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "admin",
    "password": "admin123"
  }'
```

Should return:
```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": {...}
}
```

### 9. Common Fixes

**Fix 1: Missing api.js**
- Make sure `index.html` includes: `<script src="js/api.js"></script>`
- Should be BEFORE `auth.js`

**Fix 2: CORS Error**
- Check `backend/.env` has: `CORS_ORIGINS=["*"]`
- Restart backend server

**Fix 3: MongoDB Not Running**
- Check: `brew services list | grep mongodb`
- Start: `brew services start mongodb-community`

**Fix 4: JavaScript Errors**
- Check browser console
- Make sure all JS files are loading (Network tab)
- Check for 404 errors on JS files

### 10. Debug Steps

1. Open browser Developer Tools (F12)
2. Go to "Network" tab
3. Filter by "Fetch/XHR"
4. Try logging in
5. Look for:
   - POST request to `/api/auth/login`
   - Check status code (200 = success, 401 = wrong credentials, 404 = not found)
   - Check response body

### Still Not Working?

1. **Check all files are loaded:**
   - Open: http://localhost:3000/js/api.js
   - Open: http://localhost:3000/js/auth.js
   - Should see JavaScript code, not 404

2. **Verify backend logs:**
   - Check terminal where backend is running
   - Should see request logs when you try to login

3. **Clear browser cache:**
   - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear cache in browser settings

