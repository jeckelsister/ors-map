import { FaBicycle, FaBolt, FaHiking, FaMountain } from "react-icons/fa";
import type { TransportMode } from "@/types/profile";
import type { IconType } from "react-icons";

interface TransportModeWithIcon extends Omit<TransportMode, 'icon'> {
  icon: IconType;
  label: string;
}

export const TRANSPORT_MODES: TransportModeWithIcon[] = [
  {
    id: "cycling-regular",
    name: "cycling-regular",
    icon: FaBicycle,
    label: "Vélo classique",
    color: "#2563eb", // blue-600
  },
  {
    id: "cycling-mountain",
    name: "cycling-mountain",
    icon: FaMountain,
    label: "VTT",
    color: "#7c3aed", // violet-600
  },
  {
    id: "cycling-electric",
    name: "cycling-electric",
    icon: FaBolt,
    label: "Vélo électrique",
    color: "#ea580c", // orange-600
  },
  {
    id: "foot-hiking",
    name: "foot-hiking",
    icon: FaHiking,
    label: "Randonnée",
    color: "#16a34a", // green-600
  },
];
