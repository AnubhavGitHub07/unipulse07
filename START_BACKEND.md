# Start Backend Server - Quick Guide

## Option 1: Use MongoDB Atlas (Recommended - Fastest ⚡)

1. **Go to:** https://www.mongodb.com/atlas
2. **Sign up for free** (or log in)
3. **Create a free cluster** (M0 Free tier)
4. **Create database user:**
   - Username: `unipulse`
   - Password: Choose a password
5. **Whitelist IP:** Click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
6. **Get connection string:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/...`)

7. **Update .env file:**
```bash
cd "/Users/anubhavdwivedi/Documents/Mini Project ( UniPulse )/backend"
nano .env
```

Replace `MONGODB_URI` with your Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/unipulse?retryWrites=true&w=majority
```

Save and exit (Ctrl+X, then Y, then Enter)

---

## Option 2: Install MongoDB Locally

**macOS (using Homebrew):**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Verify MongoDB is running:**
```bash
brew services list | grep mongodb
```

---

## Once MongoDB is Ready - Start Backend

Run these commands in Terminal:

```bash
# Navigate to backend
cd "/Users/anubhavdwivedi/Documents/Mini Project ( UniPulse )/backend"

# Activate virtual environment
source venv/bin/activate

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

**✅ Backend is now running on http://localhost:8000**

---

## Test the Backend

Open a NEW terminal window and run:
```bash
curl http://localhost:8000/health
```

Should return: `{"status":"healthy"}`

Or visit: http://localhost:8000/docs (Swagger UI)

---

## Quick Command Summary

```bash
# Start backend (keep this terminal open)
cd "/Users/anubhavdwivedi/Documents/Mini Project ( UniPulse )/backend"
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

