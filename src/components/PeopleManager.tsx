'use client';

import { useState } from 'react';
import { Plus, X, User, Sparkles } from 'lucide-react';
import { Person } from '@/types';

interface PeopleManagerProps {
  people: Person[];
  onPeopleChange: (people: Person[]) => void;
}

export default function PeopleManager({ people, onPeopleChange }: PeopleManagerProps) {
  const [newPersonName, setNewPersonName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addPerson = () => {
    if (newPersonName.trim() && !people.some(p => p.name.toLowerCase() === newPersonName.toLowerCase())) {
      const newPerson: Person = {
        id: `person-${Date.now()}`,
        name: newPersonName.trim(),
        color: generateRandomColor()
      };
      onPeopleChange([...people, newPerson]);
      setNewPersonName('');
      setIsAdding(false);
    }
  };

  const removePerson = (personId: string) => {
    onPeopleChange(people.filter(p => p.id !== personId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addPerson();
    } else if (e.key === 'Escape') {
      setNewPersonName('');
      setIsAdding(false);
    }
  };

  const generateRandomColor = () => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
      '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-black mb-2">
          People
        </h2>
        <p className="text-sm sm:text-base text-black font-semibold">
          Add people to split the bill
        </p>
      </div>

      <div className="space-y-3">
        {/* Add new person */}
        <div className="relative">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-400 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <Plus className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">
                Add Person
              </span>
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={() => {
                  if (!newPersonName.trim()) setIsAdding(false);
                }}
                placeholder="Enter person's name"
                className="text-black flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                autoFocus
              />
              <button
                onClick={addPerson}
                disabled={!newPersonName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                <Sparkles className="w-4 h-4" />
                Add
              </button>
            </div>
          )}
        </div>

        {/* People list */}
        {people.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {people.map((person) => (
              <div
                key={person.id}
                className="group relative p-3 sm:p-2 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md"
                      style={{ backgroundColor: person.color || '#3B82F6' }}
                    >
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-black font-medium text-sm truncate">
                      {person.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removePerson(person.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {people.length === 0 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-black mb-1">
              No people added yet
            </h3>
            <p className="text-gray-700 mb-3 text-sm">
              Add people to start splitting the bill
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
            >
              <Plus className="w-3 h-3" />
              Add First Person
            </button>
          </div>
        )}
      </div>
    </div>
  );
}