# UniPulse Deployment Guide

This guide covers deploying UniPulse to production using various platforms.

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended for VPS/Server)

#### Prerequisites
- Docker and Docker Compose installed
- Domain name (optional, for HTTPS)

#### Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd unipulse
```

2. **Configure environment**
```bash
cp .env.example backend/.env
# Edit backend/.env with your MongoDB Atlas URI and JWT secret
```

3. **Update MongoDB URI**
   - For local MongoDB: `mongodb://mongodb:27017`
   - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/unipulse`

4. **Update frontend API URL**
   - Edit `frontend/js/api.js`
   - Change `API_BASE_URL` to your backend URL

5. **Build and start**
```bash
docker-compose up -d --build
```

6. **Access**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

7. **HTTPS with Let's Encrypt (using Nginx reverse proxy)**
   - Use certbot with nginx
   - Configure SSL certificates
   - Update CORS_ORIGINS in backend/.env

---

### Option 2: Render (Backend) + Vercel/Netlify (Frontend)

#### Backend on Render

1. **Create Render account** and new Web Service

2. **Connect your repository**

3. **Configure**
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     ```
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=your-secret-key
     CORS_ORIGINS=["https://your-frontend-domain.com"]
     ```

4. **MongoDB Atlas Setup**
   - Create free cluster at mongodb.com/atlas
   - Get connection string
   - Add your IP to whitelist

5. **Get backend URL** (e.g., `https://unipulse-backend.onrender.com`)

#### Frontend on Vercel/Netlify

1. **Update API URL**
   - Edit `frontend/js/api.js`
   - Set `API_BASE_URL` to your Render backend URL

2. **Deploy to Vercel**
   ```bash
   npm i -g vercel
   cd frontend
   vercel
   ```

   Or use Netlify:
   - Drag and drop `frontend` folder to Netlify
   - Or connect GitHub repository

3. **Configure CORS**
   - Update `CORS_ORIGINS` in backend to include frontend domain

---

### Option 3: Railway (Full Stack)

1. **Create Railway account**

2. **Deploy MongoDB**
   - Add MongoDB service
   - Get connection string

3. **Deploy Backend**
   - Add new service from GitHub
   - Set root directory: `backend`
   - Add environment variables:
     ```
     MONGODB_URI=<railway-mongodb-uri>
     JWT_SECRET=<your-secret>
     PORT=8000
     ```
   - Railway auto-detects Python and runs FastAPI

4. **Deploy Frontend**
   - Add new service
   - Set root directory: `frontend`
   - Use static site preset
   - Update `frontend/js/api.js` with backend URL

5. **Get public URLs** and update CORS

---

### Option 4: AWS EC2 (Full Control)

1. **Launch EC2 instance** (Ubuntu 22.04)

2. **SSH into instance**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install dependencies**
```bash
sudo apt update
sudo apt install -y docker.io docker-compose git nginx certbot python3-certbot-nginx
sudo systemctl start docker
sudo systemctl enable docker
```

4. **Clone and setup**
```bash
git clone <your-repo>
cd unipulse
cp .env.example backend/.env
# Edit backend/.env
```

5. **Update API URL in frontend**
```bash
nano frontend/js/api.js
# Change API_BASE_URL to http://your-ec2-ip:8000 or domain
```

6. **Start services**
```bash
docker-compose up -d --build
```

7. **Configure Nginx (if using domain)**
```bash
sudo nano /etc/nginx/sites-available/unipulse
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

8. **Enable and restart**
```bash
sudo ln -s /etc/nginx/sites-available/unipulse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Setup HTTPS**
```bash
sudo certbot --nginx -d your-domain.com
```

---

## 📋 Environment Variables Checklist

### Backend (.env)
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Strong random secret (min 32 chars)
- [ ] `JWT_ALGORITHM` - HS256 (default)
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiry (default: 1440)
- [ ] `CORS_ORIGINS` - Array of allowed origins
- [ ] `AWS_ACCESS_KEY_ID` - (Optional) For S3 file storage
- [ ] `AWS_SECRET_ACCESS_KEY` - (Optional)
- [ ] `S3_BUCKET_NAME` - (Optional)

### Frontend (api.js)
- [ ] `API_BASE_URL` - Backend API URL

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Set CORS_ORIGINS to specific domains (not "*")
- [ ] Use HTTPS in production
- [ ] Enable MongoDB authentication
- [ ] Use environment variables (never commit .env)
- [ ] Set up firewall rules (only allow necessary ports)
- [ ] Regular backups of MongoDB
- [ ] Enable rate limiting (add middleware in FastAPI)
- [ ] Use strong passwords for admin accounts

---

## 📊 Database Setup

### MongoDB Atlas (Free Tier)

1. Create account at mongodb.com/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for development, specific IPs for production)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/unipulse?retryWrites=true&w=majority`

### Local MongoDB

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          # Add your deployment commands
```

---

## 📝 Post-Deployment

1. **Create admin account**
   - Use `/api/auth/register` endpoint
   - Set `role: "admin"`

2. **Test all features**
   - Login as student
   - Login as admin
   - Upload attendance CSV
   - Upload PYQ
   - View analytics

3. **Monitor logs**
   - Render: Dashboard > Logs
   - Railway: Service > Logs
   - Docker: `docker-compose logs -f`

---

## 🆘 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify environment variables
- Check logs: `docker-compose logs backend`

### CORS errors
- Update `CORS_ORIGINS` in backend/.env
- Include exact frontend URL (with https://)

### File uploads not working
- Check uploads directory permissions
- For S3: verify AWS credentials
- Check MAX_UPLOAD_SIZE setting

### Frontend can't connect to API
- Verify API_BASE_URL in frontend/js/api.js
- Check CORS configuration
- Verify backend is accessible

---

## 📞 Support

For issues or questions:
- Check logs first
- Review API docs at `/docs`
- Verify environment variables
- Check MongoDB connection

