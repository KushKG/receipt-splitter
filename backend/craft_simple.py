"""
Simplified CRAFT implementation for receipt OCR
This is a basic implementation focusing on receipt text detection
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import cv2
import numpy as np
from typing import List, Tuple, Dict, Any

class CRAFT(nn.Module):
    """Simplified CRAFT model for text detection"""
    
    def __init__(self):
        super(CRAFT, self).__init__()
        # Simplified architecture for demo purposes
        self.backbone = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 64, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(128, 128, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            
            nn.Conv2d(128, 256, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(256, 256, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
        )
        
        self.head = nn.Sequential(
            nn.Conv2d(256, 128, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(128, 64, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 2, 1)  # 2 channels: text and link
        )
    
    def forward(self, x):
        features = self.backbone(x)
        output = self.head(features)
        return output, features

def resize_aspect_ratio(img, square_size, interpolation=cv2.INTER_LINEAR, mag_ratio=1.):
    """Resize image while maintaining aspect ratio"""
    height, width, channel = img.shape
    
    # magnify image size
    target_size = mag_ratio * max(height, width)
    
    # set original image size
    if target_size > square_size:
        target_size = square_size
    
    ratio = target_size / max(height, width)
    
    target_h, target_w = int(height * ratio), int(width * ratio)
    proc = cv2.resize(img, (target_w, target_h), interpolation=interpolation)
    
    # make canvas and paste image
    target_h32, target_w32 = target_h, target_w
    if target_h % 32 != 0:
        target_h32 = target_h + (32 - target_h % 32)
    if target_w % 32 != 0:
        target_w32 = target_w + (32 - target_w % 32)
    
    resized = np.zeros((target_h32, target_w32, channel), dtype=np.float32)
    resized[0:target_h, 0:target_w] = proc
    
    target_h, target_w = target_h32, target_w32
    
    size_heatmap = (int(target_w/2), int(target_h/2))
    
    return resized, ratio, size_heatmap

def normalizeMeanVariance(in_img, mean=(0.485, 0.456, 0.406), variance=(0.229, 0.224, 0.225)):
    """Normalize image with mean and variance"""
    img = in_img.copy().astype(np.float32)
    img -= np.array([mean[0] * 255.0, mean[1] * 255.0, mean[2] * 255.0], dtype=np.float32)
    img /= np.array([variance[0] * 255.0, variance[1] * 255.0, variance[2] * 255.0], dtype=np.float32)
    return img

def getDetBoxes(textmap, linkmap, text_threshold, link_threshold, low_text):
    """Get detection boxes from text and link maps"""
    # Simplified box detection
    # In a real implementation, this would be much more sophisticated
    boxes = []
    polys = []
    
    # For demo purposes, return some mock boxes
    height, width = textmap.shape
    mock_boxes = [
        [[100, 100], [200, 100], [200, 150], [100, 150]],  # Item 1
        [[100, 200], [200, 200], [200, 250], [100, 250]],  # Item 2
        [[100, 300], [200, 300], [200, 350], [100, 350]],  # Item 3
    ]
    
    for box in mock_boxes:
        if len(box) == 4:
            boxes.append(box)
            polys.append(box)
    
    return boxes, polys

def adjustResultCoordinates(boxes, ratio_w, ratio_h):
    """Adjust box coordinates back to original image size"""
    adjusted_boxes = []
    for box in boxes:
        adjusted_box = []
        for point in box:
            adjusted_box.append([point[0] / ratio_w, point[1] / ratio_h])
        adjusted_boxes.append(adjusted_box)
    return adjusted_boxes

# Export functions for the API
__all__ = ['CRAFT', 'resize_aspect_ratio', 'normalizeMeanVariance', 'getDetBoxes', 'adjustResultCoordinates']
