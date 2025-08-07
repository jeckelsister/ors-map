import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const AutocompleteInput = ({
  label,
  value,
  onChange,
  suggestions,
  onSuggestionClick,
  placeholder = "Nom du lieu",
}) => (
  <Autocomplete
    freeSolo
    options={suggestions.map((s, i) => ({
      ...s,
      _uniqueKey: `${s.place_id || s.display_name}-${i}`,
    }))}
    getOptionLabel={(option) => option.display_name || ""}
    inputValue={value}
    onInputChange={(_, newInputValue) =>
      onChange({ target: { value: newInputValue } })
    }
    onChange={(_, newValue) => {
      if (newValue) onSuggestionClick(newValue);
    }}
    renderOption={(props, option) => (
      <li {...props} key={option._uniqueKey}>
        {option.display_name}
      </li>
    )}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        placeholder={placeholder}
        variant="outlined"
        className="mb-4"
        InputLabelProps={{ className: "text-black" }}
        InputProps={{
          ...params.InputProps,
          className: "text-black",
        }}
      />
    )}
  />
);

export default AutocompleteInput;
