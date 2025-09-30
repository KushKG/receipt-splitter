# CRAFT-based Receipt OCR System

This system now uses **CRAFT (Character-Region Awareness For Text Detection)** instead of Tesseract.js for much better text detection accuracy, especially for complex receipt layouts and various image formats including HEIC.

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)
```bash
./start-craft.sh
```

### Option 2: Manual Setup

1. **Start the Python Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python craft_api.py
   ```

2. **Start the Frontend:**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js API    │    │  Python Backend │
│   (React/Next)  │───▶│   Route          │───▶│  (CRAFT + FastAPI)│
│                 │    │   (/api/process) │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔧 Features

- **Advanced Text Detection**: Uses CRAFT for superior text region detection
- **HEIC Support**: Native support for Apple's HEIC format
- **Multiple Image Formats**: JPG, PNG, GIF, HEIC
- **Fallback Mode**: Works even without the CRAFT model (uses mock data)
- **Docker Support**: Easy deployment with Docker Compose
- **Real-time Processing**: Fast API responses with progress tracking

## 📁 File Structure

```
├── backend/
│   ├── craft_api.py          # FastAPI server with CRAFT integration
│   ├── craft_simple.py       # Simplified CRAFT implementation
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile           # Backend Docker configuration
├── src/
│   ├── app/api/process-receipt/
│   │   └── route.ts         # Next.js API route (proxies to backend)
│   └── components/
│       └── OCRProcessor.tsx  # Updated to use API instead of Tesseract.js
├── docker-compose.yml        # Multi-service Docker setup
└── start-craft.sh           # Easy startup script
```

## 🎯 CRAFT Model

The system uses the CRAFT model from [clovaai/CRAFT-pytorch](https://github.com/clovaai/CRAFT-pytorch):

- **Model**: `craft_mlt_25k.pth` (General purpose model)
- **Download**: [Google Drive Link](https://drive.google.com/open?id=1Jk4eGD7crsqCCg9C9VjCLkMN3ze8kutZ)
- **Place**: Save as `backend/craft_mlt_25k.pth`

## 🔄 How It Works

1. **Image Upload**: User uploads receipt image (any supported format)
2. **API Proxy**: Next.js API route receives the image
3. **CRAFT Processing**: Python backend processes with CRAFT text detection
4. **Text Extraction**: Detected text regions are parsed into receipt items
5. **Response**: Structured data returned to frontend

## 🛠️ Configuration

### Environment Variables
- `CRAFT_API_URL`: Backend API URL (default: `http://localhost:8000`)

### Docker Services
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8000`
- **API Docs**: `http://localhost:8000/docs`

## 📊 Performance Comparison

| Feature | Tesseract.js | CRAFT |
|---------|--------------|-------|
| Text Detection | Basic | Advanced |
| HEIC Support | ❌ | ✅ |
| Complex Layouts | Limited | Excellent |
| Accuracy | Good | Excellent |
| Setup Complexity | Simple | Medium |

## 🔧 Troubleshooting

### Backend Not Starting
```bash
# Check if port 8000 is available
lsof -i :8000

# Check Docker logs
docker-compose logs backend
```

### Model Not Found
- Download the CRAFT model manually
- Place it in `backend/craft_mlt_25k.pth`
- The system will use fallback mode without the model

### HEIC Conversion Issues
- CRAFT backend handles HEIC files natively
- No client-side conversion needed
- Supports all modern image formats

## 🚀 Deployment

### Production Setup
1. Use a proper CRAFT model (download from official source)
2. Set up proper error handling and logging
3. Configure reverse proxy (nginx) for production
4. Use GPU acceleration for better performance

### Scaling
- The Python backend can be scaled horizontally
- Use Redis for session management if needed
- Consider using a proper OCR service for production

## 📚 References

- [CRAFT Paper](https://arxiv.org/abs/1904.01941)
- [CRAFT GitHub](https://github.com/clovaai/CRAFT-pytorch)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
