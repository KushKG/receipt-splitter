#!/bin/bash

echo "🤖 Setting up OpenAI Vision API for Receipt OCR"
echo "==============================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "✅ Created .env.local file"
    echo ""
    echo "🔑 Please add your OpenAI API key to .env.local:"
    echo "   1. Get your API key from: https://platform.openai.com/api-keys"
    echo "   2. Edit .env.local and replace 'your_openai_api_key_here' with your actual key"
    echo "   3. Save the file"
    echo ""
    read -p "Press Enter after you've added your API key..."
fi

# Check if API key is configured
if grep -q "your_openai_api_key_here" .env.local 2>/dev/null; then
    echo "⚠️  OpenAI API key not configured yet!"
    echo "   Please edit .env.local and add your API key"
    echo "   Get your key from: https://platform.openai.com/api-keys"
    exit 1
fi

echo "✅ OpenAI API key configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev"
echo ""
echo "📱 Then open: http://localhost:3000"
echo ""
echo "💡 Features:"
echo "   ✅ OpenAI GPT-4 Vision for receipt OCR"
echo "   ✅ HEIC support"
echo "   ✅ All image formats (JPG, PNG, GIF, HEIC)"
echo "   ✅ Smart receipt parsing"
echo "   ✅ Fallback mode if API is unavailable"
