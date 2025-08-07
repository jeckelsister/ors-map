export default function Button({
  children,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
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
