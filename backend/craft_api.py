import os
import cv2
import torch
import numpy as np
from PIL import Image
import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import aiofiles
import tempfile
from typing import List, Dict, Any
import json

# Import CRAFT modules (we'll need to add the CRAFT implementation)
try:
    from craft import CRAFT
    from craft_utils import getDetBoxes, adjustResultCoordinates
    from imgproc import resize_aspect_ratio, normalizeMeanVariance
except ImportError:
    print("CRAFT modules not found. Please ensure CRAFT-pytorch is properly installed.")
    CRAFT = None

app = FastAPI(title="Receipt OCR API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model
craft_net = None
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def load_craft_model():
    """Load the CRAFT model"""
    global craft_net
    if craft_net is None and CRAFT is not None:
        # Download model if not exists
        model_path = "craft_mlt_25k.pth"
        if not os.path.exists(model_path):
            print(f"Please download the CRAFT model to {model_path}")
            print("Download from: https://drive.google.com/open?id=1Jk4eGD7crsqCCg9C9VjCLkMN3ze8kutZ")
            return False
        
        # Load model
        craft_net = CRAFT()
        craft_net.load_state_dict(torch.load(model_path, map_location=device))
        craft_net = craft_net.to(device)
        craft_net.eval()
        print("CRAFT model loaded successfully")
    return craft_net is not None

def preprocess_image(image):
    """Preprocess image for CRAFT"""
    # Convert PIL to OpenCV format
    img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    
    # Resize image
    img_resized, target_ratio, size_heatmap = resize_aspect_ratio(img, 1280, interpolation=cv2.INTER_LINEAR, mag_ratio=1.5)
    ratio_h = ratio_w = 1 / target_ratio
    
    # Normalize
    x = normalizeMeanVariance(img_resized)
    x = torch.from_numpy(x).permute(2, 0, 1)  # [h, w, c] to [c, h, w]
    x = torch.unsqueeze(x, 0)  # [c, h, w] to [b, c, h, w]
    x = x.to(device)
    
    return x, ratio_h, ratio_w

def postprocess_results(score_text, score_link, ratio_h, ratio_w):
    """Post-process CRAFT results"""
    # Get text boxes
    boxes, polys = getDetBoxes(score_text, score_link, 0.7, 0.4, 0.4)
    
    # Adjust coordinates
    boxes = adjustResultCoordinates(boxes, ratio_w, ratio_h)
    polys = adjustResultCoordinates(polys, ratio_w, ratio_h)
    
    return boxes, polys

def extract_text_from_boxes(image, boxes):
    """Extract text from detected boxes using basic OCR"""
    # For now, we'll use a simple approach
    # In production, you might want to use EasyOCR or PaddleOCR here
    texts = []
    
    for box in boxes:
        # Convert box to rectangle
        x_coords = [point[0] for point in box]
        y_coords = [point[1] for point in box]
        x_min, x_max = min(x_coords), max(x_coords)
        y_min, y_max = min(y_coords), max(y_coords)
        
        # Extract region
        roi = image[y_min:y_max, x_min:x_max]
        
        # For now, just add placeholder text
        # In production, integrate with a proper OCR engine
        texts.append({
            "text": f"Item {len(texts) + 1}",
            "confidence": 0.9,
            "bbox": [x_min, y_min, x_max, y_max]
        })
    
    return texts

def parse_receipt_items(texts):
    """Parse detected texts into receipt items"""
    items = []
    
    for i, text_data in enumerate(texts):
        # Simple parsing logic - in production, use more sophisticated NLP
        if i < 5:  # Limit to 5 items for demo
            items.append({
                "id": f"item-{i + 1}",
                "name": text_data["text"],
                "price": round(10.0 + (i * 2.5), 2),  # Mock prices
                "assignedTo": []
            })
    
    return items

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    print("Starting up CRAFT OCR API...")
    load_craft_model()

@app.get("/")
async def root():
    return {"message": "CRAFT OCR API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": craft_net is not None}

@app.post("/process-receipt")
async def process_receipt(file: UploadFile = File(...)):
    """Process receipt image using CRAFT"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        if craft_net is None:
            # Fallback: return mock data if CRAFT is not available
            mock_items = [
                {"id": "item-1", "name": "Coffee", "price": 4.50, "assignedTo": []},
                {"id": "item-2", "name": "Sandwich", "price": 8.99, "assignedTo": []},
                {"id": "item-3", "name": "Cookie", "price": 2.25, "assignedTo": []}
            ]
            return {
                "text": "Mock OCR text - Coffee $4.50\nSandwich $8.99\nCookie $2.25\nTotal: $15.74",
                "items": mock_items,
                "method": "mock_fallback"
            }
        
        # Preprocess image
        x, ratio_h, ratio_w = preprocess_image(image)
        
        # Run CRAFT detection
        with torch.no_grad():
            y, feature = craft_net(x)
        
        # Post-process results
        score_text = y[0, :, :, 0].cpu().data.numpy()
        score_link = y[0, :, :, 1].cpu().data.numpy()
        
        boxes, polys = postprocess_results(score_text, score_link, ratio_h, ratio_w)
        
        # Extract text (simplified for now)
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        texts = extract_text_from_boxes(cv_image, boxes)
        
        # Parse into receipt items
        items = parse_receipt_items(texts)
        
        return {
            "text": f"Detected {len(texts)} text regions",
            "items": items,
            "method": "craft_detection",
            "detected_regions": len(boxes)
        }
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
