'use client';

import { ReceiptItem, Person } from '@/types';
import { Check, Users, Zap } from 'lucide-react';
import ItemElaboration from './ItemElaboration';

interface ReceiptTableProps {
  items: ReceiptItem[];
  people: Person[];
  onItemsChange: (items: ReceiptItem[]) => void;
  receiptText?: string;
  storeName?: string;
}

export default function ReceiptTable({ items, people, onItemsChange, receiptText, storeName }: ReceiptTableProps) {
  const handleAssignmentChange = (itemId: string, personId: string, checked: boolean) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        if (checked) {
          return {
            ...item,
            assignedTo: [...item.assignedTo, personId]
          };
        } else {
          return {
            ...item,
            assignedTo: item.assignedTo.filter(id => id !== personId)
          };
        }
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const getAssignedTotal = () => {
    return items
      .filter(item => item.assignedTo.length > 0)
      .reduce((sum, item) => sum + item.price, 0);
  };

  const getUnassignedTotal = () => {
    return items
      .filter(item => item.assignedTo.length === 0)
      .reduce((sum, item) => sum + item.price, 0);
  };

  const splitEvenly = () => {
    if (people.length === 0) return;
    
    const updatedItems = items.map(item => ({
      ...item,
      assignedTo: people.map(person => person.id)
    }));
    onItemsChange(updatedItems);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-black">
            Receipt Items
          </h2>
          <p className="text-sm sm:text-base text-black font-semibold">
            Assign items to people for bill splitting
          </p>
        </div>
        {people.length > 0 && (
          <button
            onClick={splitEvenly}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium w-full sm:w-auto"
          >
            <Zap className="w-4 h-4" />
            Split Evenly
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-black font-semibold">Total</p>
          <p className="text-base sm:text-lg font-bold text-black">
            ${getTotalPrice().toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs sm:text-sm text-black font-semibold">Assigned</p>
          <p className="text-base sm:text-lg font-bold text-green-700">
            ${getAssignedTotal().toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs sm:text-sm text-black font-semibold">Unassigned</p>
          <p className="text-base sm:text-lg font-bold text-orange-700">
            ${getUnassignedTotal().toFixed(2)}
          </p>
        </div>
      </div>

      {/* Unassigned Items Warning */}
      {getUnassignedTotal() > 0 && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-100 border-2 border-orange-500 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs sm:text-sm font-bold">!</span>
            </div>
            <p className="text-orange-900 text-sm sm:text-base font-bold">
              {items.filter(item => item.assignedTo.length === 0).length} unassigned item{items.filter(item => item.assignedTo.length === 0).length !== 1 ? 's' : ''} totaling ${getUnassignedTotal().toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {people.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Add people first
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You need to add people before assigning items
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 bg-white rounded-lg border-2 transition-all duration-200 ${
                item.assignedTo.length === 0
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Item Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                    item.assignedTo.length === 0
                      ? 'bg-orange-600'
                      : 'bg-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-black">
                        {item.name}
                      </h3>
                      <ItemElaboration
                        itemName={item.name}
                        itemPrice={item.price}
                        receiptText={receiptText}
                        storeName={storeName}
                      />
                    </div>
                    <p className="text-sm text-gray-700">
                      ${item.price.toFixed(2)}
                      {item.assignedTo.length > 0 && (
                        <span className="text-green-700 font-medium ml-2">
                          ÷ {item.assignedTo.length} = ${(item.price / item.assignedTo.length).toFixed(2)} each
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {/* {item.assignedTo.length === 0 && (
                  <div className="text-orange-800 font-bold text-sm">
                    UNASSIGNED
                  </div>
                )} */}
              </div>

              {/* People Assignment */}
              <div className="flex flex-wrap gap-2">
                {people.map((person) => {
                  const isAssigned = item.assignedTo.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      onClick={() => handleAssignmentChange(item.id, person.id, !isAssigned)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                        isAssigned
                          ? 'border-blue-500 bg-blue-100 text-blue-900'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: person.color || '#3B82F6' }}
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{person.name}</span>
                      {isAssigned && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}