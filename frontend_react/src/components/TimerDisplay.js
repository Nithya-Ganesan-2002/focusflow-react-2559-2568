import React from "react";

/**
 * TimerDisplay Component
 * Displays the formatted time remaining and mode (Work, Short Break, Long Break).
 *
 * Props:
 *   - mode: string ("Work"|"Short Break"|"Long Break")
 *   - timeLeft: number (seconds)
 *   - theme: string ("light"|"dark")
 *   - formatTime: function (seconds) -> "MM:SS"
 */
 // PUBLIC_INTERFACE
function TimerDisplay({ mode, timeLeft, theme, formatTime }) {
  return (
    <div
      style={{
        background: theme === "light" ? "#fff" : "#222",
        border: `3px solid #ff7043`,
        borderRadius: "2.1em",
        boxShadow: "0px 2px 20px rgba(30,30,40,0.07)",
        padding: "2.1em 2.8em",
        margin: "1.5em 0",
        minWidth: "275px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "-30px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "0.98em",
          fontWeight: 500,
          letterSpacing: "0.04em",
          color: "#1976d2",
          opacity: "0.9",
        }}
      >
        {mode}
      </span>
      <div
        style={{
          fontSize: "4.8rem",
          letterSpacing: "0.05em",
          fontWeight: 700,
          color: "#ff7043",
          marginBottom: "0.4em",
          fontFamily: "monospace",
          userSelect: "none",
        }}
        data-testid="timer-value"
      >
        {formatTime(timeLeft)}
      </div>
    </div>
  );
}

export default TimerDisplay;
