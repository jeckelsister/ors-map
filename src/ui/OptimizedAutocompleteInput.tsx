import { useVirtualList } from '@/hooks/shared/useVirtualList';
import type { LocationSuggestion } from '@/types/profile';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import VirtualList from './VirtualList';

interface OptimizedAutocompleteInputProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: LocationSuggestion[];
  onSuggestionClick: (suggestion: LocationSuggestion) => void;
  placeholder?: string;
  className?: string;
  maxVisibleSuggestions?: number;
  suggestionHeight?: number;
}

/**
 * Optimized Autocomplete component with VirtualList for many suggestions
 * Uses virtual scrolling when more than 10 suggestions
 */
export default function OptimizedAutocompleteInput({
  label,
  value,
  onChange,
  suggestions,
  onSuggestionClick,
  placeholder = 'Nom du lieu',
  className = '',
  maxVisibleSuggestions = 6,
  suggestionHeight = 60,
}: OptimizedAutocompleteInputProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `autocomplete-input-${Math.random().toString(36).substr(2, 9)}`;

  const { scrollElementRef, scrollToIndex } = useVirtualList(suggestions);

  const containerHeight = useMemo(() => {
    return (
      Math.min(suggestions.length, maxVisibleSuggestions) * suggestionHeight
    );
  }, [suggestions.length, maxVisibleSuggestions, suggestionHeight]);

  const useVirtualScrolling = suggestions.length > 10;

  useEffect(() => {
    setIsOpen(suggestions.length > 0 && value.length > 0);
    setFocusedIndex(-1);
  }, [suggestions, value]);

  useEffect(() => {
    if (focusedIndex >= 0 && useVirtualScrolling) {
      scrollToIndex(focusedIndex);
    }
  }, [focusedIndex, scrollToIndex, useVirtualScrolling]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
    },
    [isOpen, suggestions, focusedIndex, onSuggestionClick]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: LocationSuggestion) => {
      onSuggestionClick(suggestion);
      setIsOpen(false);
      setFocusedIndex(-1);
    },
    [onSuggestionClick]
  );

  const renderSuggestion = useCallback(
    (suggestion: LocationSuggestion, index: number) => (
      <div
        onClick={() => handleSuggestionClick(suggestion)}
        className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
          index === focusedIndex ? 'bg-blue-100' : ''
        }`}
        role="option"
        aria-selected={index === focusedIndex}
      >
        <div className="font-medium text-gray-900 truncate">
          {suggestion.display_name}
        </div>
        {suggestion.type && (
          <div className="text-xs text-gray-500 truncate">
            {suggestion.type}
          </div>
        )}
      </div>
    ),
    [focusedIndex, handleSuggestionClick]
  );

  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
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
          setTimeout(() => setIsOpen(false), 150);
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-autocomplete="list"
      />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
          {useVirtualScrolling ? (
            <VirtualList<LocationSuggestion>
              ref={scrollElementRef}
              items={suggestions}
              itemHeight={suggestionHeight}
              containerHeight={containerHeight}
              renderItem={renderSuggestion}
              getItemKey={(suggestion, index) =>
                suggestion.place_id || `${suggestion.display_name}-${index}`
              }
              className="max-h-60"
            />
          ) : (
            <ul className="max-h-60 overflow-auto" role="listbox">
              {suggestions.map((suggestion, index) => (
                <li
                  key={
                    suggestion.place_id || `${suggestion.display_name}-${index}`
                  }
                  role="option"
                  aria-selected={index === focusedIndex}
                >
                  {renderSuggestion(suggestion, index)}
                </li>
              ))}
            </ul>
          )}

          {/* Performance indicator in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="px-2 py-1 text-xs text-gray-500 border-t bg-gray-50">
              {suggestions.length} suggestions •{' '}
              {useVirtualScrolling ? 'Virtual' : 'Standard'} rendering
            </div>
          )}
        </div>
      )}
    </div>
  );
}
