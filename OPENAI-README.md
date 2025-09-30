# OpenAI Vision Receipt OCR

This receipt splitter now uses **OpenAI's GPT-4 Vision API** for superior receipt text recognition and parsing. Much simpler and more accurate than traditional OCR libraries!

## 🚀 Quick Start

### 1. Setup
```bash
./setup-openai.sh
```

### 2. Add Your API Key
1. Get your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Edit `.env.local` and add your key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

### 3. Start the App
```bash
npm run dev
```

## 🎯 Features

- ✅ **GPT-4 Vision**: State-of-the-art image understanding
- ✅ **HEIC Support**: Native support for Apple's HEIC format
- ✅ **All Image Formats**: JPG, PNG, GIF, HEIC, WebP
- ✅ **Smart Parsing**: Understands receipt structure and extracts items intelligently
- ✅ **Fallback Mode**: Works even if API is temporarily unavailable
- ✅ **High Accuracy**: Much better than traditional OCR for receipts

## 🏗️ How It Works

```
User Upload → Next.js API → OpenAI GPT-4 Vision → Structured Receipt Data
```

1. **Image Upload**: User uploads receipt (any format)
2. **API Processing**: Next.js converts image to base64
3. **OpenAI Vision**: GPT-4 analyzes image and extracts receipt items
4. **Smart Parsing**: Returns structured data with item names and prices
5. **Frontend Display**: Receipt items ready for bill splitting

## 📊 Comparison

| Feature | Tesseract.js | CRAFT | OpenAI Vision |
|---------|--------------|-------|---------------|
| Setup Complexity | Medium | High | Low |
| Accuracy | Good | Excellent | Outstanding |
| HEIC Support | ❌ | ✅ | ✅ |
| Receipt Understanding | Basic | Good | Excellent |
| Maintenance | High | High | Low |
| Cost | Free | Free | Pay-per-use |

## 💰 Pricing

OpenAI Vision API pricing (as of 2024):
- **Input**: $0.01 per 1K tokens
- **Output**: $0.03 per 1K tokens
- **Typical receipt**: ~$0.01-0.05 per image

Very affordable for personal use!

## 🔧 Configuration

### Environment Variables
```bash
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o                    # Optional: default model
OPENAI_MAX_TOKENS=2000                 # Optional: max response length
```

### API Response Format
```json
{
  "text": "Raw receipt text",
  "items": [
    {
      "id": "item-1",
      "name": "Coffee",
      "price": 4.50,
      "assignedTo": []
    }
  ],
  "method": "openai-vision"
}
```

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env.local
# Edit .env.local with your API key

# Start development server
npm run dev
```

### Testing
```bash
# Test with a receipt image
curl -X POST http://localhost:3000/api/process-receipt \
  -F "image=@receipt.jpg"
```

## 🔒 Security

- API key is stored in environment variables (never in code)
- Images are sent directly to OpenAI (not stored locally)
- Fallback mode works without API key (using mock data)

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Add environment variable in Vercel dashboard
OPENAI_API_KEY=sk-your-key-here

# Deploy
vercel
```

### Other Platforms
- Ensure `OPENAI_API_KEY` is set in your environment
- Deploy as normal Next.js app

## 🔧 Troubleshooting

### "OpenAI API key not configured"
- Make sure `.env.local` exists with your API key
- Restart the development server after adding the key

### "No items found in receipt"
- Try a clearer image
- Ensure the receipt has itemized prices
- Check if the receipt is in a supported format

### API Rate Limits
- OpenAI has rate limits based on your account
- Upgrade your OpenAI plan for higher limits
- Fallback mode will work if you hit limits

## 📱 Usage Tips

1. **Image Quality**: Higher quality images work better
2. **Receipt Types**: Works with any receipt format (restaurant, store, etc.)
3. **Multiple Items**: Best with itemized receipts showing individual prices
4. **HEIC Files**: iPhone photos work perfectly (no conversion needed)

## 🎉 Benefits

- **No Complex Setup**: Just add your API key and go
- **Superior Accuracy**: GPT-4 understands context and receipt structure
- **Universal Format Support**: Works with any image format
- **Smart Parsing**: Automatically filters out totals, taxes, tips
- **Reliable**: Fallback mode ensures the app always works

Perfect for splitting bills with friends! 🍕💸
