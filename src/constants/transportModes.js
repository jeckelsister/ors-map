import { FaBicycle, FaBolt, FaHiking, FaMountain } from "react-icons/fa";

export const TRANSPORT_MODES = [
  {
    id: "cycling-regular",
    icon: FaBicycle,
    label: "Vélo classique",
    color: "#2563eb", // blue-600
  },
  {
    id: "cycling-mountain",
    icon: FaMountain,
    label: "VTT",
    color: "#7c3aed", // violet-600
  },
  {
    id: "cycling-electric",
    icon: FaBolt,
    label: "Vélo électrique",
    color: "#ea580c", // orange-600
  },
  {
    id: "foot-hiking",
    icon: FaHiking,
    label: "Randonnée",
    color: "#16a34a", // green-600
  },
];
