import { create } from "@storybook/theming/create";

export default create({
  base: "light",
  brandTitle: "ORS Map",
  brandUrl: "https://maps.openrouteservice.org",
  brandTarget: "_self",

  // Typography
  fontBase: '"Inter", sans-serif',
  fontCode: "monospace",

  // Colors
  colorPrimary: "#3B82F6", // blue-500
  colorSecondary: "#2563EB", // blue-600

  // UI
  appBg: "#F3F4F6", // gray-100
  appContentBg: "#FFFFFF", // white
  appBorderColor: "#E5E7EB", // gray-200
  appBorderRadius: 8,

  // Text colors
  textColor: "#1F2937", // gray-800
  textInverseColor: "#FFFFFF", // white

  // Toolbar default and active colors
  barTextColor: "#4B5563", // gray-600
  barSelectedColor: "#3B82F6", // blue-500
  barBg: "#FFFFFF", // white

  // Form colors
  inputBg: "#FFFFFF", // white
  inputBorder: "#D1D5DB", // gray-300
  inputTextColor: "#1F2937", // gray-800
  inputBorderRadius: 6,
});
