import { FaBicycle, FaBolt, FaHiking, FaMountain } from "react-icons/fa";

export const TRANSPORT_MODES = [
  {
    id: "cycling-regular",
    icon: FaBicycle,
    label: "Vélo classique",
  },
  {
    id: "cycling-mountain",
    icon: FaMountain,
    label: "VTT",
  },
  {
    id: "cycling-electric",
    icon: FaBolt,
    label: "Vélo électrique",
  },
  {
    id: "foot-hiking",
    icon: FaHiking,
    label: "Randonnée",
  },
];
