import React from "react";

/**
 * HistoryPanel Component
 * Renders a list/table of previous Pomodoro sessions.
 *
 * Props:
 *   - open: boolean
 *   - onClose: function
 *   - history: array of { timestamp, duration, status }
 *   - clearHistory: function
 */
 // PUBLIC_INTERFACE
function HistoryPanel({ open, onClose, history, clearHistory }) {
  if (!open) return null;
  const PRIMARY = "#1976d2";
  const ACCENT = "#ff7043";
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 1000,
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(30,30,40,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          borderRadius: "17px",
          minWidth: "320px",
          maxWidth: "95vw",
          boxShadow: "0 6px 32px #1112",
          padding: "2.2em 2.3em 1.4em",
          position: "relative",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close history modal"
          style={{
            position: "absolute",
            right: 23,
            top: 21,
            background: "transparent",
            fontSize: "1.4em",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ✖
        </button>
        <h2 style={{ marginTop: 0, color: ACCENT, fontSize: "1.3em", letterSpacing: "0.03em" }}>
          Pomodoro History
        </h2>
        <div style={{ maxHeight: "350px", overflow: "auto", marginBottom: "1.1em" }}>
          {history.length === 0 ? (
            <p style={{ opacity: 0.6, margin: "2em 0" }}>No pomodoro history yet!</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "1.05em",
              }}
            >
              <thead>
                <tr style={{ borderBottom: `2px solid ${PRIMARY}` }}>
                  <th align="left">Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                    <td>
                      {new Date(h.timestamp).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td align="center">{h.duration} min</td>
                    <td align="center">
                      <span
                        style={{
                          color: h.status === "COMPLETED"
                            ? ACCENT
                            : h.status === "SKIPPED"
                            ? "#adadad"
                            : "#666",
                          fontWeight: 500,
                        }}
                      >
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <button
          style={{
            background: "transparent",
            color: "#e53935",
            border: `2px solid #e57373`,
            padding: "0.51em 1em",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "1em",
            cursor: "pointer",
            transition: "all 0.1s",
            marginBottom: "0.4em",
          }}
          onClick={clearHistory}
        >
          Clear history
        </button>
      </div>
    </div>
  );
}

export default HistoryPanel;
