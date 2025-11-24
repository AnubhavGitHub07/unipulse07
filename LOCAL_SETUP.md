# Running UniPulse on Localhost

Follow these steps to run UniPulse on your local machine.

## Prerequisites

1. **Python 3.9+** installed
2. **MongoDB** installed and running (or use MongoDB Atlas free tier)

## Step-by-Step Setup

### Step 1: Install MongoDB (if not installed)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
- Download MongoDB from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Or use MongoDB Atlas (Cloud - Free):**
- Go to https://www.mongodb.com/atlas
- Create free account and cluster
- Get connection string (we'll use it in Step 3)

---

### Step 2: Setup Backend

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python3 -m venv venv
```

3. **Activate virtual environment:**

   **macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```

   **Windows:**
   ```bash
   venv\Scripts\activate
   ```

4. **Install dependencies:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

5. **Create .env file:**
```bash
# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=unipulse
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["*"]
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
EOF
```

   **Or if using MongoDB Atlas**, edit `.env` and change:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/unipulse?retryWrites=true&w=majority
   ```

6. **Create uploads directory:**
```bash
mkdir -p uploads/pyq uploads/results
```

7. **Start the backend server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Connected to MongoDB
INFO:     Application startup complete.
```

**Keep this terminal open!** The backend is now running on `http://localhost:8000`

---

### Step 3: Setup Frontend

1. **Open a NEW terminal window** (keep backend running)

2. **Navigate to frontend directory:**
```bash
cd frontend
```

3. **Start a simple HTTP server:**

   **Option A: Python (Recommended)**
   ```bash
   python3 -m http.server 3000
   ```

   **Option B: Node.js (if you have it)**
   ```bash
   npx http-server -p 3000
   ```

   **Option C: PHP (if you have it)**
   ```bash
   php -S localhost:3000
   ```

You should see:
```
Serving HTTP on 0.0.0.0 port 3000 ...
```

**Keep this terminal open too!** Frontend is now running on `http://localhost:3000`

---

### Step 4: Access the Website

1. **Open your web browser**
2. **Navigate to:** `http://localhost:3000`

You should see the UniPulse login page!

---

### Step 5: Create Admin Account

1. **Option A: Using Swagger UI (Easiest)**
   - Go to: `http://localhost:8000/docs`
   - Find the `/api/auth/register` endpoint
   - Click "Try it out"
   - Enter this JSON:
   ```json
   {
     "student_id": "admin",
     "name": "Admin User",
     "password": "admin123",
     "role": "admin"
   }
   ```
   - Click "Execute"
   - You should see a success response

2. **Option B: Using curl**
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

---

### Step 6: Login and Test

1. **Go to:** `http://localhost:3000`
2. **Login with:**
   - Student ID: `admin`
   - Password: `admin123`
3. You should be redirected to the Admin Dashboard!

---

## Quick Test Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Can access login page
- [ ] Created admin account
- [ ] Can login as admin
- [ ] Can see admin dashboard
- [ ] API docs accessible at http://localhost:8000/docs

---

## Troubleshooting

### Backend won't start

**Error: `ModuleNotFoundError: No module named 'fastapi'`**
```bash
cd backend
source venv/bin/activate  # Make sure venv is activated
pip install -r requirements.txt
```

**Error: `MongoDB connection failed`**
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- For local: `mongodb://localhost:27017`
- Test connection: `mongosh` or `mongo`

**Error: `Address already in use`**
- Port 8000 is already in use
- Kill the process: `lsof -ti:8000 | xargs kill` (macOS/Linux)
- Or change port: `uvicorn app.main:app --reload --port 8001`

### Frontend won't start

**Error: `Address already in use`**
- Port 3000 is already in use
- Change port: `python3 -m http.server 3001`

**Error: `CORS error` in browser console**
- Make sure backend is running
- Check `CORS_ORIGINS` in backend/.env
- Should be: `CORS_ORIGINS=["*"]` for development

### Can't connect frontend to backend

1. **Check API URL:**
   - Open `frontend/js/api.js`
   - Verify `API_BASE_URL = 'http://localhost:8000'`

2. **Check backend is running:**
   - Visit `http://localhost:8000/docs`
   - Should see Swagger UI

3. **Check browser console for errors:**
   - Press F12 (Developer Tools)
   - Look for CORS or network errors

---

## Next Steps

1. **Create student accounts** (use `/api/auth/register` endpoint)
2. **Upload attendance CSV** (use `sample_attendance.csv` from root)
3. **Upload PYQ** (in admin dashboard)
4. **Set up timetable** (in admin dashboard)

---

## Stopping the Servers

**To stop backend:**
- Go to backend terminal
- Press `Ctrl + C`

**To stop frontend:**
- Go to frontend terminal
- Press `Ctrl + C`

---

## Using Docker (Alternative)

If you prefer Docker:

```bash
# From project root
docker-compose up --build
```

This starts:
- MongoDB on port 27017
- Backend on port 8000
- Frontend on port 3000

---

Happy coding! 🚀

