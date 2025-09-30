'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ReceiptTable from '@/components/ReceiptTable';
import PeopleManager from '@/components/PeopleManager';
import SplitResults from '@/components/SplitResults';
import OCRProcessor from '@/components/OCRProcessor';
import ImageViewer from '@/components/ImageViewer';
import { ReceiptItem, Person, SplitResult } from '@/types';

/**
 * Receipt Splitter - Main Application
 * 
 * This application solves a common real-world problem: splitting restaurant and grocery bills
 * among friends and roommates. The inspiration came from the frustration of manually calculating
 * who owes what, especially when items are shared or split unevenly.
 * 
 * Key Innovations:
 * 1. AI-powered receipt OCR using OpenAI Vision API for superior accuracy
 * 2. Intelligent item clarification system that explains unclear receipt items
 * 3. Clean, accessible interface with high-contrast design
 * 4. Receipt-style output for familiar, professional appearance
 * 
 * The app demonstrates how modern AI can solve everyday problems with elegant,
 * user-friendly solutions that are both powerful and accessible.
 */

export default function Home() {
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [, setOcrProgress] = useState(0);
  const [receiptText, setReceiptText] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');

  // Extract store name from receipt text
  const extractStoreName = (text: string): string => {
    if (!text) return '';
    
    // Common patterns for store names in receipts
    const patterns = [
      /^([A-Z][A-Z\s&]+)/m,  // All caps at start
      /([A-Z][a-z]+ [A-Z][a-z]+)/,  // Title case words
      /([A-Z][a-z]+)/,  // First capitalized word
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const store = match[1].trim();
        // Filter out common non-store words
        if (!['TOTAL', 'SUBTOTAL', 'TAX', 'DATE', 'TIME', 'RECEIPT'].includes(store.toUpperCase())) {
          return store;
        }
      }
    }
    
    return 'Store';
  };

  // Initialize OCR processor
  const { processImage, progress } = OCRProcessor({
    onOCRComplete: (text, items) => {
      setReceiptItems(items);
      setReceiptText(text);
      setStoreName(extractStoreName(text));
      setSuccessMessage(`Successfully parsed ${items.length} items from receipt!`);
      setIsProcessing(false);
      setOcrProgress(0);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (errorMessage) => {
      setError(errorMessage);
      setIsProcessing(false);
      setOcrProgress(0);
    }
  });

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);
    setOcrProgress(0);

    // Create image URL for viewing
    const imageUrl = URL.createObjectURL(file);
    setUploadedImageUrl(imageUrl);
    setUploadedFileName(file.name);

    // Use client-side OCR processing
    await processImage(file);
  };

  const calculateSplit = (): SplitResult[] => {
    const results: SplitResult[] = people.map(person => ({
      personId: person.id,
      personName: person.name,
      total: 0,
      items: []
    }));

    receiptItems.forEach(item => {
      if (item.assignedTo.length > 0) {
        const splitPrice = item.price / item.assignedTo.length;
        
        item.assignedTo.forEach(personId => {
          const personResult = results.find(r => r.personId === personId);
          if (personResult) {
            personResult.total += splitPrice;
            personResult.items.push({
              itemName: item.name,
              itemPrice: item.price,
              splitPrice
            });
          }
        });
      }
    });

    return results;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Receipt Splitter
          </h1>
          <p className="text-gray-600">
            Upload a receipt and split the bill among friends
          </p>
        </div>

        <div className="space-y-4">
          {/* File Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-black">
                Upload Receipt
              </h2>
              {uploadedImageUrl && (
                <ImageViewer imageUrl={uploadedImageUrl} fileName={uploadedFileName} />
              )}
            </div>
            <FileUpload onFileSelect={handleFileUpload} isLoading={isProcessing} progress={progress} />
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            {successMessage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
            )}
          </div>

          {/* Receipt Items Table */}
          {receiptItems.length > 0 && (
            <ReceiptTable 
              items={receiptItems} 
              people={people}
              onItemsChange={setReceiptItems}
              receiptText={receiptText}
              storeName={storeName}
            />
          )}

          {/* People Management */}
          {receiptItems.length > 0 && (
            <PeopleManager 
              people={people} 
              onPeopleChange={setPeople}
            />
          )}

          {/* Split Results */}
          {receiptItems.length > 0 && people.length > 0 && (
            <SplitResults results={calculateSplit()} />
          )}
        </div>
      </div>
    </div>
  );
}
