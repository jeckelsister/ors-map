import logoSvg from "@/assets/logo.svg";
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <img
      src={logoSvg}
      alt="WayMaker Logo"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;
