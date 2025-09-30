'use client';

import { useState } from 'react';
import { Download, Copy, Check, Share2 } from 'lucide-react';
import { SplitResult } from '@/types';

interface SplitResultsProps {
  results: SplitResult[];
}

export default function SplitResults({ results }: SplitResultsProps) {
  const [copied, setCopied] = useState(false);

  const getItemShareCount = (itemName: string) => {
    // Count how many people have this item assigned to them
    return results.filter(result => 
      result.items.some(item => item.itemName === itemName)
    ).length;
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Person', 'Item', 'Item Price', 'Split Price', 'Total'],
      ...results.flatMap(result => 
        result.items.map(item => [
          result.personName,
          item.itemName,
          `$${item.itemPrice.toFixed(2)}`,
          `$${item.splitPrice.toFixed(2)}`,
          `$${result.total.toFixed(2)}`
        ])
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipt-split.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const text = results.map(result => 
      `${result.personName}: $${result.total.toFixed(2)}\n` +
      result.items.map(item => 
        `  - ${item.itemName}: $${item.splitPrice.toFixed(2)}`
      ).join('\n')
    ).join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy to clipboard');
    }
  };

  const shareResults = async () => {
    const text = `Bill Split Results:\n\n` + results.map(result => 
      `${result.personName}: $${result.total.toFixed(2)}\n` +
      result.items.map(item => 
        `  - ${item.itemName}: $${item.splitPrice.toFixed(2)}`
      ).join('\n')
    ).join('\n\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bill Split Results',
          text: text
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      copyToClipboard();
    }
  };

  const getGrandTotal = () => {
    return results.reduce((sum, result) => sum + result.total, 0);
  };

  const getTotalItems = () => {
    // Get unique items across all people
    const allItems = results.flatMap(result => result.items);
    const uniqueItems = new Set(allItems.map(item => item.itemName));
    return uniqueItems.size;
  };

  return (
    <div className="bg-white border-2 border-black shadow-2xl max-w-md mx-auto">
      {/* Receipt Header */}
      <div className="border-b-4 border-dashed border-black p-4 text-center">
        <h1 className="text-xl font-black text-black uppercase tracking-wider mb-1">
          RECEIPT SPLITTER
        </h1>
        <p className="text-xs text-black font-mono font-bold">
          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </p>
        <div className="text-xs text-black mt-2 font-mono">
          ================================
        </div>
      </div>

      {/* Receipt Summary */}
      <div className="px-4 py-2 text-xs font-mono text-black border-b-2 border-black">
        <div className="flex justify-between font-bold">
          <span>Total Items:</span>
          <span>{getTotalItems()}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>People:</span>
          <span>{results.length}</span>
        </div>
        <div className="flex justify-between font-black text-lg">
          <span>TOTAL:</span>
          <span>${getGrandTotal().toFixed(2)}</span>
        </div>
      </div>


      {/* Receipt Items */}
      <div className="px-4 py-2">
             {results.map((result) => (
          <div key={result.personId} className="mb-4">
            {/* Person Header */}
            <div className="text-center mb-2">
              <div className="text-xs text-black font-mono">
                ================================
              </div>
              <h3 className="text-sm font-black text-black uppercase tracking-wide mt-1 mb-1">
                {result.personName}
              </h3>
              <div className="text-xs text-black font-mono">
                ================================
              </div>
            </div>
            
            {/* Items List */}
            {result.items.length > 0 ? (
              <div className="space-y-1 mb-2">
                {result.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="text-xs font-mono">
                    <div className="flex justify-between items-start">
                      <span className="flex-1 pr-2 leading-tight font-bold text-black">
                        {item.itemName}
                      </span>
                      <span className="text-right">
                        <div className="text-black font-bold">
                          ${item.itemPrice.toFixed(2)} ÷ {getItemShareCount(item.itemName)}
                        </div>
                        <div className="font-black text-black text-sm">
                          ${item.splitPrice.toFixed(2)}
                        </div>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-black font-bold">
                NO ITEMS ASSIGNED
              </div>
            )}
            
            {/* Person Total */}
            <div className="border-t-2 border-dashed border-black pt-2 text-xs font-mono">
              <div className="flex justify-between font-black text-black text-sm">
                <span>TOTAL FOR {result.personName.toUpperCase()}:</span>
                <span>${result.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Receipt Footer */}
      <div className="border-t-4 border-dashed border-black p-4 text-center">
        <div className="text-xs text-black font-mono mb-2">
          ================================
        </div>
        <div className="text-lg font-black text-black uppercase tracking-wider">
          GRAND TOTAL: ${getGrandTotal().toFixed(2)}
        </div>
        <div className="text-xs text-black font-mono mt-2">
          ================================
        </div>
        <p className="text-xs text-black font-bold mt-3 mb-2">
          THANK YOU FOR USING RECEIPT SPLITTER!
        </p>
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1 px-3 py-1.5 bg-black text-white rounded text-xs hover:bg-gray-800 transition-colors border border-black"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
          <button
            onClick={copyToClipboard}
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs transition-colors border border-black ${
              copied 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'COPIED!' : 'COPY'}
          </button>
          <button
            onClick={shareResults}
            className="flex items-center gap-1 px-3 py-1.5 bg-white text-black rounded text-xs hover:bg-gray-100 transition-colors border border-black"
          >
            <Share2 className="w-3 h-3" />
            SHARE
          </button>
        </div>
      </div>
    </div>
  );
}