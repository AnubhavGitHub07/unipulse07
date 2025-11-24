# UniPulse - Smart Campus Platform

A centralized smart campus platform for students and admins, providing attendance tracking, timetable viewing, PYQ access, results viewing, and comprehensive analytics.

## 🏗️ Architecture

```
UniPulse/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── auth/
│   │   ├── database.py
│   │   └── utils/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/         # Static HTML/CSS/JS
│   ├── index.html
│   ├── student.html
│   ├── admin.html
│   ├── css/
│   ├── js/
│   └── assets/
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🚀 Features

- **Student Portal**: Login, view attendance, timetable, PYQs, and results
- **Admin Dashboard**: Upload attendance CSV, PYQs, manage data, view analytics
- **Analytics**: Attendance percentage, graphs, statistics
- **Scalable Architecture**: Modular design for any college

## 🛠️ Tech Stack

### Backend
- Python FastAPI (Async)
- MongoDB with Motor (Async ODM)
- JWT Authentication
- Pandas for CSV parsing
- AWS S3 / MinIO for file storage

### Frontend
- HTML, CSS, Vanilla JavaScript
- TailwindCSS CDN
- Chart.js for graphs

### Deployment
- Docker + Docker Compose
- Render/Railway for backend
- Vercel/Netlify for frontend

## 📦 Quick Start

### Prerequisites
- Python 3.9+
- MongoDB (local or Atlas)
- Docker & Docker Compose (optional)

### Local Development

1. **Clone and setup backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. **Run backend:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. **Serve frontend:**
```bash
cd frontend
python -m http.server 3000
# Or use any static server
```

5. **Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Docker Deployment

```bash
docker-compose up --build
```

## 📚 API Documentation

Visit `/docs` for interactive Swagger UI or `/redoc` for ReDoc.

## 🔐 Authentication

- **Students**: Login with student ID and password
- **Admins**: Login with admin credentials
- JWT tokens required for protected routes

## 📝 Environment Variables

See `.env.example` for required variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_ALGORITHM`
- `AWS_ACCESS_KEY_ID` (optional, for S3)
- `AWS_SECRET_ACCESS_KEY` (optional)
- `S3_BUCKET_NAME` (optional)

## 🚀 Deployment Guide

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📄 License

MIT License

