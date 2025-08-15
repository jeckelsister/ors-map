import { memo, ReactNode } from 'react';
import AutocompleteInput from '../components/map/AutocompleteInput';
import type { LocationSuggestion } from '@/types/profile';

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: LocationSuggestion[];
  onSuggestionClick: (suggestion: LocationSuggestion) => void;
  setSuggestions: (suggestions: LocationSuggestion[]) => void;
  placeholder: string;
  actions?: ReactNode[];
}

/**
 * Composant d'entrée de localisation réutilisable
 * Combine AutocompleteInput avec des boutons d'action
 */
const LocationInput = memo<LocationInputProps>(({
  label,
  value,
  onChange,
  suggestions,
  onSuggestionClick,
  setSuggestions,
  placeholder,
  actions = []
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <AutocompleteInput
        label={label}
        value={value}
        onChange={onChange}
        suggestions={suggestions}
        onSuggestionClick={onSuggestionClick}
        setSuggestions={setSuggestions}
        placeholder={placeholder}
      />
      {actions.map((action, index) => (
        <div key={index}>{action}</div>
      ))}
    </div>
  </div>
));

LocationInput.displayName = 'LocationInput';

export default LocationInput;
