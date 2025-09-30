#!/bin/bash

echo "🚀 Starting CRAFT-based Receipt OCR System"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install docker-compose."
    exit 1
fi

echo "✅ docker-compose is available"

# Create backend directory if it doesn't exist
mkdir -p backend

# Download CRAFT model if it doesn't exist
if [ ! -f "backend/craft_mlt_25k.pth" ]; then
    echo "📥 CRAFT model not found. Please download it manually:"
    echo "   1. Go to: https://drive.google.com/open?id=1Jk4eGD7crsqCCg9C9VjCLkMN3ze8kutZ"
    echo "   2. Download the file"
    echo "   3. Save it as: backend/craft_mlt_25k.pth"
    echo ""
    echo "⚠️  The system will use fallback mode without the model."
    echo "   You can start the system now and download the model later."
    echo ""
    read -p "Press Enter to continue with fallback mode..."
fi

# Start the services
echo "🐳 Starting Docker services..."
docker-compose up --build

echo ""
echo "🎉 System is starting up!"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Note: The first startup may take a few minutes to build the containers."
echo "   Subsequent starts will be much faster."
