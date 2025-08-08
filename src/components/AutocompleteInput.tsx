import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import type { LocationSuggestion } from '@/types/profile';

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: LocationSuggestion[];
  onSuggestionClick: (suggestion: LocationSuggestion) => void;
  setSuggestions?: (suggestions: LocationSuggestion[]) => void;
  placeholder?: string;
}

interface LocationSuggestionWithKey extends LocationSuggestion {
  _uniqueKey: string;
}

const AutocompleteInput = ({
  label,
  value,
  onChange,
  suggestions,
  onSuggestionClick,
  placeholder = 'Nom du lieu',
}: AutocompleteInputProps): React.JSX.Element => (
  <Autocomplete<LocationSuggestionWithKey, false, false, true>
    freeSolo
    options={suggestions.map((s, i) => ({
      ...s,
      _uniqueKey: `${s.place_id || s.display_name}-${i}`,
    }))}
    getOptionLabel={option =>
      typeof option === 'string' ? option : option.display_name || ''
    }
    inputValue={value}
    onInputChange={(_, newInputValue) =>
      onChange({
        target: { value: newInputValue } as HTMLInputElement,
      } as React.ChangeEvent<HTMLInputElement>)
    }
    onChange={(_, newValue) => {
      if (newValue && typeof newValue !== 'string') {
        onSuggestionClick(newValue);
      }
    }}
    renderOption={(props, option) => (
      <li {...props} key={option._uniqueKey}>
        {option.display_name}
      </li>
    )}
    renderInput={params => (
      <TextField
        {...params}
        label={label}
        placeholder={placeholder}
        variant="outlined"
        className="mb-4"
        InputLabelProps={{ className: 'text-black' }}
        InputProps={{
          ...params.InputProps,
          className: 'text-black',
        }}
      />
    )}
  />
);

export default AutocompleteInput;
