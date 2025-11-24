#!/bin/bash

# UniPulse Setup Script

echo "🚀 UniPulse Setup Script"
echo "========================"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.9+"
    exit 1
fi

# Check MongoDB (optional - can use Atlas)
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found locally. You can use MongoDB Atlas or install MongoDB locally."
fi

echo ""
echo "📦 Setting up backend..."

# Create virtual environment
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your MongoDB URI and JWT secret."
fi

# Create uploads directory
mkdir -p uploads/pyq uploads/results

cd ..

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your MongoDB URI and JWT secret"
echo "2. Start MongoDB (if using local): mongod"
echo "3. Start backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "4. Start frontend: cd frontend && python3 -m http.server 3000"
echo ""
echo "🐳 Or use Docker: docker-compose up --build"
echo ""

