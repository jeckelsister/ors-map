// Location interfaces
export interface Location {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  type: string;
  importance: number;
}
