'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Eye, Download } from 'lucide-react';

interface ImageViewerProps {
  imageUrl: string;
  fileName: string;
}

export default function ImageViewer({ imageUrl, fileName }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* View Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
      >
        <Eye className="w-4 h-4" />
        View Receipt
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-black">
                {fileName}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="p-4 overflow-auto max-h-[80vh] flex justify-center items-center">
              <div className="relative max-w-full max-h-[70vh]">
                <Image
                  src={imageUrl}
                  alt="Receipt"
                  width={800}
                  height={600}
                  className="rounded-lg shadow-lg"
                  style={{ maxHeight: '70vh', width: 'auto', height: 'auto' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Click outside the image or press Escape to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
