import React from 'react';
import AutocompleteInput from '@/ui/AutocompleteInput';
import type { LocationSuggestion } from '@/types/profile';

interface AutocompleteInputWrapperProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: LocationSuggestion[];
  onSuggestionClick: (suggestion: LocationSuggestion) => void;
  setSuggestions?: (suggestions: LocationSuggestion[]) => void;
  placeholder?: string;
}

// Simple wrapper to maintain compatibility with existing code
export default function AutocompleteInputWrapper(props: AutocompleteInputWrapperProps): React.JSX.Element {
  return <AutocompleteInput {...props} className="mb-4" />;
}
