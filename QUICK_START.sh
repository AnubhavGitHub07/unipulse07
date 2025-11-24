#!/bin/bash

echo "🚀 UniPulse Quick Start"
echo "======================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.9+"
    exit 1
fi

echo "📦 Setting up backend..."
cd backend

# Create venv if doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Install dependencies
pip install --upgrade pip -q
pip install -r requirements.txt -q

# Create .env if doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << 'ENVEOF'
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=unipulse
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["*"]
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760
ENVEOF
    echo "✅ Created .env file"
fi

# Create uploads directory
mkdir -p uploads/pyq uploads/results

cd ..

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "🌐 Starting servers..."
echo ""
echo "📝 Terminal 1 - Starting Backend..."
echo "   Run: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "📝 Terminal 2 - Starting Frontend..."
echo "   Run: cd frontend && python3 -m http.server 3000"
echo ""
echo "🌍 Then open: http://localhost:3000"
echo ""
echo "📚 API Docs: http://localhost:8000/docs"
echo ""

# Ask if user wants to start servers now
read -p "Start backend server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend
    source venv/bin/activate
    echo "🚀 Starting backend on http://localhost:8000"
    echo "   Press Ctrl+C to stop"
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
fi

