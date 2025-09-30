'use client';

import { useState } from 'react';
import { ReceiptItem } from '@/types';

interface OCRProcessorProps {
  onOCRComplete: (text: string, items: ReceiptItem[]) => void;
  onError: (error: string) => void;
}

export default function OCRProcessor({ onOCRComplete, onError }: OCRProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Validate file first
      const isValidImage = file.type.startsWith('image/') || 
                          file.name.toLowerCase().endsWith('.heic');
      
      if (!file || !isValidImage) {
        throw new Error('Invalid file type. Please select an image file (JPG, PNG, GIF, HEIC).');
      }

      console.log('Processing file with CRAFT API:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      setProgress(20);

      // Create form data for API call
      const formData = new FormData();
      formData.append('image', file);

      setProgress(40);

      // Call our API route which proxies to CRAFT backend
      const response = await fetch('/api/process-receipt', {
        method: 'POST',
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }

      const result = await response.json();
      setProgress(100);

      if (!result.items || result.items.length === 0) {
        onError('No items found in receipt. Please ensure the receipt is clear and contains itemized prices.');
        return;
      }

      console.log('CRAFT processing completed:', {
        method: result.method,
        itemsCount: result.items.length
      });

      onOCRComplete(result.text, result.items);

    } catch (error) {
      console.error('OCR Error:', error);
      let errorMessage = 'Failed to process image. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid file type')) {
          errorMessage = error.message;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('API error')) {
          errorMessage = 'OCR service temporarily unavailable. Please try again in a moment.';
        } else if (error.message.includes('File size')) {
          errorMessage = 'Image too large. Please try a smaller image (max 10MB).';
        } else {
          errorMessage = `Processing error: ${error.message}`;
        }
      }
      
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };


  return {
    processImage,
    isProcessing,
    progress
  };
}