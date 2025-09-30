'use client';

/**
 * ItemElaboration Component
 * 
 * This component solves a common problem with receipt splitting: unclear or abbreviated item names.
 * Many receipts show items like "ORGS", "BREAD WHL", or "MILK 2%" which can be confusing.
 * 
 * Our solution uses AI to provide contextual explanations by:
 * 1. Analyzing the item name and price
 * 2. Using the store name for context (e.g., Whole Foods vs. convenience store)
 * 3. Leveraging the full receipt text for additional context
 * 4. Generating helpful 2-3 sentence explanations
 * 
 * This makes receipt splitting more transparent and helps users understand what they're actually paying for.
 */

import { useState } from 'react';
import { HelpCircle, X, Sparkles } from 'lucide-react';

interface ItemElaborationProps {
  itemName: string;
  itemPrice: number;
  receiptText?: string;
  storeName?: string;
}

export default function ItemElaboration({ itemName, itemPrice, receiptText, storeName }: ItemElaborationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [elaboration, setElaboration] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const generateElaboration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/elaborate-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName,
          itemPrice,
          receiptText,
          storeName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate elaboration');
      }

      const data = await response.json();
      setElaboration(data.elaboration);
    } catch (error) {
      console.error('Error generating elaboration:', error);
      setElaboration('Sorry, I couldn\'t generate an elaboration for this item at the moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!elaboration) {
      generateElaboration();
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-black rounded text-xs transition-colors font-semibold"
        title="Get more details about this item"
      >
        <HelpCircle className="w-3 h-3" />
        <span>Info</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-black">
                Item Details
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-black hover:text-gray-800 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="p-3 sm:p-4">
              {/* Item Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-black mb-1">{itemName}</h4>
                <p className="text-sm text-black font-semibold">Price: ${itemPrice.toFixed(2)}</p>
                {storeName && (
                  <p className="text-sm text-black font-semibold">Store: {storeName}</p>
                )}
              </div>

              {/* Elaboration */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-black">What is this item?</h4>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center gap-2 text-black">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm font-semibold">Analyzing item...</span>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-black leading-relaxed font-medium">
                      {elaboration || 'Click the button to generate item details.'}
                    </p>
                  </div>
                )}

                <button
                  onClick={generateElaboration}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {isLoading ? 'Generating...' : 'Generate Details'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
