#!/bin/bash

# Start UniPulse Servers

echo "🚀 Starting UniPulse..."
echo ""

# Check if MongoDB is running
if ! pgrep -x mongod > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "Starting MongoDB..."
    brew services start mongodb-community
    sleep 3
fi

echo "✅ MongoDB is running"
echo ""

# Function to start backend
start_backend() {
    echo "📦 Starting Backend Server..."
    cd "$(dirname "$0")/backend"
    source venv/bin/activate
    echo "🚀 Backend starting on http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo "   Press Ctrl+C to stop"
    echo ""
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

# Function to start frontend
start_frontend() {
    echo "🌐 Starting Frontend Server..."
    cd "$(dirname "$0")/frontend"
    echo "🚀 Frontend starting on http://localhost:3000"
    echo "   Press Ctrl+C to stop"
    echo ""
    python3 -m http.server 3000
}

# Ask what to start
echo "What would you like to start?"
echo "1) Backend only (port 8000)"
echo "2) Frontend only (port 3000)"
echo "3) Both (requires 2 terminal windows)"
echo ""
read -p "Enter choice (1/2/3): " choice

case $choice in
    1)
        start_backend
        ;;
    2)
        start_frontend
        ;;
    3)
        echo ""
        echo "📝 Open 2 terminal windows:"
        echo ""
        echo "Terminal 1 - Backend:"
        echo "  cd \"$(dirname "$0")\" && bash START_SERVERS.sh (choose option 1)"
        echo ""
        echo "Terminal 2 - Frontend:"
        echo "  cd \"$(dirname "$0")\" && bash START_SERVERS.sh (choose option 2)"
        echo ""
        echo "Or run manually:"
        echo ""
        echo "Terminal 1:"
        echo "  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
        echo ""
        echo "Terminal 2:"
        echo "  cd frontend && python3 -m http.server 3000"
        ;;
    *)
        echo "Invalid choice"
        ;;
esac

