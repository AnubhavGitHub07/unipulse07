# UniPulse Quick Start Guide

Get UniPulse running in 5 minutes!

## 🚀 Option 1: Docker (Easiest)

### Prerequisites
- Docker and Docker Compose installed

### Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd unipulse
```

2. **Configure environment**
```bash
cp .env.example backend/.env
# Edit backend/.env:
# - Set MONGODB_URI (use mongodb://mongodb:27017 for local Docker MongoDB)
# - Set a strong JWT_SECRET
```

3. **Update frontend API URL** (if needed)
```bash
# Edit frontend/js/api.js
# Change API_BASE_URL if your backend will be on a different port/domain
```

4. **Start everything**
```bash
docker-compose up --build
```

5. **Access**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

6. **Create admin account**
- Use the register endpoint: POST http://localhost:8000/api/auth/register
- Body: `{"student_id": "admin", "name": "Admin", "password": "admin123", "role": "admin"}`
- Or use the Swagger UI at /docs

---

## 🚀 Option 2: Local Development

### Prerequisites
- Python 3.9+
- MongoDB (local or Atlas)

### Steps

1. **Run setup script**
```bash
chmod +x setup.sh
./setup.sh
```

2. **Configure environment**
```bash
cd backend
# Edit .env file with your MongoDB URI
nano .env
```

3. **Start MongoDB** (if using local)
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services
```

4. **Start backend**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. **Start frontend** (new terminal)
```bash
cd frontend
python3 -m http.server 3000
```

6. **Access**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📝 First Steps After Setup

### 1. Create Admin Account

**Using Swagger UI:**
- Visit http://localhost:8000/docs
- Go to `/api/auth/register` endpoint
- Click "Try it out"
- Enter:
```json
{
  "student_id": "admin",
  "name": "Admin User",
  "password": "admin123",
  "role": "admin"
}
```
- Click "Execute"

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

### 2. Login as Admin

- Go to http://localhost:3000
- Login with:
  - Student ID: `admin`
  - Password: `admin123`

### 3. Create Student Accounts

In the admin dashboard:
- You can use the register endpoint (via API) or
- Create accounts programmatically

**Example student:**
```json
{
  "student_id": "STU001",
  "name": "John Doe",
  "password": "student123",
  "role": "student"
}
```

### 4. Upload Attendance CSV

1. Use the sample file: `sample_attendance.csv`
2. Go to Admin Dashboard > Attendance
3. Upload the CSV file
4. Records will be imported

### 5. Upload PYQ

1. Go to Admin Dashboard > PYQs
2. Fill in the form:
   - Subject: "Mathematics"
   - Semester: 1
   - Year: 2023
   - Exam Type: "final"
3. Upload a PDF file
4. Click "Upload PYQ"

### 6. Set Up Timetable

1. Go to Admin Dashboard > Timetable
2. Select a day (e.g., Monday)
3. Add time slots:
   - Start Time: 09:00
   - End Time: 10:00
   - Subject: "Mathematics"
   - Faculty: "Dr. Smith" (optional)
4. Add more slots or click "Save Timetable"

---

## 🧪 Testing

### Test Student Login
1. Create a student account
2. Logout as admin
3. Login with student credentials
4. View attendance, timetable, PYQs, results

### Test Features
- ✅ Login/Logout
- ✅ View attendance
- ✅ View timetable
- ✅ View PYQs
- ✅ Upload attendance CSV (admin)
- ✅ Upload PYQ (admin)
- ✅ View analytics

---

## 🔧 Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Check port 8000 is not in use

### Frontend can't connect
- Verify API_BASE_URL in frontend/js/api.js
- Check CORS settings in backend/.env
- Make sure backend is running

### MongoDB connection error
- Verify MongoDB is running
- Check connection string format
- For Atlas: whitelist your IP address

---

## 📚 Next Steps

1. **Production Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
2. **API Documentation**: Visit http://localhost:8000/docs
3. **Customize**: Update colors, branding, features

---

## 💡 Tips

- Use MongoDB Atlas for production (free tier available)
- Change JWT_SECRET in production
- Set CORS_ORIGINS to your domain in production
- Enable HTTPS in production
- Regular backups of MongoDB

---

## 🆘 Need Help?

- Check logs: `docker-compose logs -f`
- Review API docs: http://localhost:8000/docs
- Check environment variables
- Verify MongoDB connection

Happy coding! 🎉

