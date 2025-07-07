import React from "react";

/**
 * SessionControls Component
 * Renders timer control buttons: Start, Pause, Reset, Skip, Open Settings.
 *
 * Props:
 *   - isRunning: boolean
 *   - onStart: function
 *   - onPause: function
 *   - onReset: function
 *   - onSkip: function
 *   - onSettings: function
 */
 // PUBLIC_INTERFACE
function SessionControls({ isRunning, onStart, onPause, onReset, onSkip, onSettings }) {
  const ACCENT = "#ff7043";
  const PRIMARY = "#1976d2";
  const btnEmph = {
    background: ACCENT,
    color: "#fff",
    border: "none",
    padding: "0.7em 1.4em",
    borderRadius: "13px",
    fontWeight: 700,
    fontSize: "1.2em",
    cursor: "pointer",
    transition: "all 0.13s",
    boxShadow: "0 3px 14px #2221",
  };
  const btnSecondary = {
    background: PRIMARY,
    color: "#fff",
    border: "none",
    padding: "0.7em 1.1em",
    borderRadius: "13px",
    fontWeight: 700,
    fontSize: "1.08em",
    cursor: "pointer",
    transition: "all 0.13s",
    boxShadow: "0 1px 6px #2221",
  };
  const btnPlain = {
    background: "transparent",
    color: ACCENT,
    border: `2px solid ${ACCENT}`,
    padding: "0.51em 1em",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "1em",
    cursor: "pointer",
    transition: "all 0.1s",
  };

  return (
    <div style={{ display: "flex", gap: "1.2em" }}>
      {isRunning ? (
        <button
          style={btnSecondary}
          onClick={onPause}
          aria-label="Pause timer"
        >
          ⏸ Pause
        </button>
      ) : (
        <button
          style={btnEmph}
          onClick={onStart}
          aria-label="Start timer"
        >
          ▶ Start
        </button>
      )}
      <button style={btnPlain} onClick={onReset} aria-label="Reset timer">
        ⟳ Reset
      </button>
      <button style={btnPlain} onClick={onSkip} aria-label="Skip session">
        ⏭ Skip
      </button>
      <button
        style={btnPlain}
        onClick={onSettings}
        aria-label="Open timer settings"
      >
        ⚙️
      </button>
    </div>
  );
}

export default SessionControls;
