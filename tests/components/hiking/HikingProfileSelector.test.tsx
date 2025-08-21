import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import HikingProfileSelector from '../../../src/components/hiking/HikingProfileSelector';
import { HIKING_PROFILES } from '../../../src/constants/hiking';

describe('HikingProfileSelector', () => {
  const mockOnProfileChange = vi.fn();

  beforeEach(() => {
    mockOnProfileChange.mockClear();
  });

  it('renders all hiking profiles', () => {
    render(
      <HikingProfileSelector
        selectedProfile={null}
        onProfileChange={mockOnProfileChange}
      />
    );

    expect(screen.getByText('Type de sentiers')).toBeDefined();

    HIKING_PROFILES.forEach(profile => {
      expect(screen.getByText(profile.name)).toBeDefined();
      expect(screen.getByText(profile.description)).toBeDefined();
    });
  });

  it('highlights selected profile', () => {
    const selectedProfile = HIKING_PROFILES[0];

    render(
      <HikingProfileSelector
        selectedProfile={selectedProfile.id}
        onProfileChange={mockOnProfileChange}
      />
    );

    const profileButton = screen
      .getByText(selectedProfile.name)
      .closest('button');
    expect(profileButton?.className).toContain('border-blue-500');
  });

  it('calls onProfileChange when profile is selected', () => {
    render(
      <HikingProfileSelector
        selectedProfile={null}
        onProfileChange={mockOnProfileChange}
      />
    );

    const firstProfile = HIKING_PROFILES[0];
    const profileButton = screen.getByText(firstProfile.name);

    fireEvent.click(profileButton);

    expect(mockOnProfileChange).toHaveBeenCalledWith(firstProfile);
  });

  it('shows preferences for selected profile', () => {
    const selectedProfile = HIKING_PROFILES[0]; // "Sentiers officiels"

    render(
      <HikingProfileSelector
        selectedProfile={selectedProfile.id}
        onProfileChange={mockOnProfileChange}
      />
    );

    expect(screen.getByText('Préférences :')).toBeDefined();
    expect(
      screen.getByText('• Privilégie les sentiers officiels (GR, HRP, etc.)')
    ).toBeDefined();
  });
});
