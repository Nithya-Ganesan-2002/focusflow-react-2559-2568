import React from "react";

/**
 * ThemeToggle Component
 * Renders a theme toggle button for light/dark mode.
 *
 * Props:
 *   - theme: string ("light"|"dark")
 *   - onToggle: function
 */
 // PUBLIC_INTERFACE
function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      style={{ border: "none" }}
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

export default ThemeToggle;
