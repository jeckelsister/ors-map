import { useState } from 'react';

interface HikingFormData {
  startLocation: string;
  endLocation: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  duration: number;
  equipment: string[];
}

export function useHikingForm() {
  const [formData, setFormData] = useState<HikingFormData>({
    startLocation: '',
    endLocation: '',
    difficulty: 'moderate',
    duration: 1,
    equipment: [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof HikingFormData, string>>
  >({});

  const updateField = <K extends keyof HikingFormData>(
    field: K,
    value: HikingFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof HikingFormData, string>> = {};

    if (!formData.startLocation.trim()) {
      newErrors.startLocation = 'Point de départ requis';
    }

    if (!formData.endLocation.trim()) {
      newErrors.endLocation = "Point d'arrivée requis";
    }

    if (formData.duration < 1) {
      newErrors.duration = "Durée doit être d'au moins 1 jour";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      startLocation: '',
      endLocation: '',
      difficulty: 'moderate',
      duration: 1,
      equipment: [],
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0,
  };
}
