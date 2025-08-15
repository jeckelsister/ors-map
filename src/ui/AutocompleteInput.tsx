import React, { useState, useRef, useEffect } from 'react';
import type { LocationSuggestion } from '@/types/profile';

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: LocationSuggestion[];
  onSuggestionClick: (suggestion: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export default function AutocompleteInput({
  label,
  value,
  onChange,
  suggestions,
  onSuggestionClick,
  placeholder = 'Nom du lieu',
  className = '',
}: AutocompleteInputProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputId = `autocomplete-input-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    setIsOpen(suggestions.length > 0 && value.length > 0);
    setFocusedIndex(-1);
  }, [suggestions, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onSuggestionClick(suggestions[focusedIndex]);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    onSuggestionClick(suggestion);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(suggestions.length > 0 && value.length > 0)}
        onBlur={() => {
          // Delay closing to allow suggestion clicks
          setTimeout(() => setIsOpen(false), 150);
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
      
      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.place_id || suggestion.display_name}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 transition-colors ${
                index === focusedIndex ? 'bg-blue-100' : ''
              }`}
            >
              <div className="font-medium text-gray-900">
                {suggestion.display_name}
              </div>
              {suggestion.type && (
                <div className="text-xs text-gray-500">
                  {suggestion.type}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
