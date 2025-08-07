import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import TransportModeSelector from "./TransportModeSelector";

describe("TransportModeSelector", () => {
  const defaultProps = {
    selectedProfile: "foot-hiking",
    activeRoutes: [],
    onProfileChange: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders all transport mode buttons", () => {
    render(<TransportModeSelector {...defaultProps} />);

    expect(screen.getByTitle("Vélo classique")).toBeInTheDocument();
    expect(screen.getByTitle("VTT")).toBeInTheDocument();
    expect(screen.getByTitle("Vélo électrique")).toBeInTheDocument();
    expect(screen.getByTitle("Randonnée")).toBeInTheDocument();
  });

  it("shows active routes with colored background", () => {
    render(
      <TransportModeSelector
        {...defaultProps}
        activeRoutes={["foot-hiking", "cycling-regular"]}
      />
    );

    const hikingButton = screen.getByTitle("Randonnée");
    const cyclingButton = screen.getByTitle("Vélo classique");

    // Les boutons actifs ont un style différent (RGB au lieu de white)
    expect(hikingButton).toHaveStyle({ color: "rgb(255, 255, 255)" });
    expect(cyclingButton).toHaveStyle({ color: "rgb(255, 255, 255)" });
  });

  it("calls onProfileChange when button is clicked", async () => {
    const user = userEvent.setup();
    const onProfileChange = vi.fn();

    render(
      <TransportModeSelector
        {...defaultProps}
        onProfileChange={onProfileChange}
      />
    );

    await user.click(screen.getByTitle("Vélo classique"));
    expect(onProfileChange).toHaveBeenCalledWith("cycling-regular");
  });

  it("shows inactive routes with white background", () => {
    render(<TransportModeSelector {...defaultProps} activeRoutes={[]} />);

    const hikingButton = screen.getByTitle("Randonnée");
    // Vérifier que le bouton a bien le style CSS appliqué
    expect(hikingButton).toHaveClass("bg-white");
  });
});
