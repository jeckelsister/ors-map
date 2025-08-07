import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  className = "",
  type = "button",
  onClick,
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button
      type={type}
      className={
        "px-3 py-2 rounded-lg border font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 " +
        className
      }
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
