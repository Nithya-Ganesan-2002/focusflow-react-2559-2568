import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Accent, primary, and secondary color palette
const ACCENT = "#ff7043";
const PRIMARY = "#1976d2";
const SECONDARY = "#ffffff";

// Initial default Pomodoro config (in minutes)
const DEFAULTS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  cyclesPerLongBreak: 4,
};

const LOCALSTORAGE_KEY = "focusflow-pomodoro-history";
const LOCALSTORAGE_CONFIG = "focusflow-pomodoro-config";

// Notification sound (simple beep, can replace with file if desired)
const BEEP_SRC =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYQAAABnZmZmZmZmZmZmZkAAAGZmZmZmZmZmZmZmQAAAGZmZmZmZmZmZmZmQAAAGZmZmZmZmZmZmZmQAAAGZmZmZmZmZmZmZmQAAAGZmZmZmZmZmZmZmQAAAGZmZmZmZmYA";

// Pomodoro states
const MODE_WORK = "Work";
const MODE_SHORT = "Short Break";
const MODE_LONG = "Long Break";

// PUBLIC_INTERFACE
function App() {
  // Theme management
  const [theme, setTheme] = useState("light");

  // Configurable times, loaded from localStorage if present
  const [config, setConfig] = useState(() =>
    JSON.parse(localStorage.getItem(LOCALSTORAGE_CONFIG)) || DEFAULTS
  );

  // Timer state
  const [mode, setMode] = useState(MODE_WORK);
  const [timeLeft, setTimeLeft] = useState(config.work * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Session state
  const [cycle, setCycle] = useState(0); // Work/break cycle progress
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || []
  );
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Audio ref for notification
  const audioRef = useRef(null);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Save config changes
  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_CONFIG, JSON.stringify(config));
  }, [config]);

  // Timer countdown logic
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Timer transition + logging
  useEffect(() => {
    if (timeLeft >= 0) return;
    audioRef.current && audioRef.current.play();
    if (mode === MODE_WORK) {
      logSession("COMPLETED");
      if ((cycle + 1) % config.cyclesPerLongBreak === 0) {
        setMode(MODE_LONG);
        setTimeLeft(config.longBreak * 60);
      } else {
        setMode(MODE_SHORT);
        setTimeLeft(config.shortBreak * 60);
      }
      setCycle((c) => c + 1);
    } else {
      setMode(MODE_WORK);
      setTimeLeft(config.work * 60);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // PUBLIC_INTERFACE
  const handleStart = () => {
    setIsRunning(true);
  };
  // PUBLIC_INTERFACE
  const handlePause = () => {
    setIsRunning(false);
  };
  // PUBLIC_INTERFACE
  const handleReset = () => {
    setIsRunning(false);
    if (mode === MODE_WORK) setTimeLeft(config.work * 60);
    if (mode === MODE_SHORT) setTimeLeft(config.shortBreak * 60);
    if (mode === MODE_LONG) setTimeLeft(config.longBreak * 60);
  };

  // PUBLIC_INTERFACE
  function handleConfigChange(e) {
    const { name, value } = e.target;
    let v = Number(value);
    if (isNaN(v) || v < 1 || v > 120) return;
    setConfig((prev) => ({ ...prev, [name]: v }));
  }

  // When config changes and mode matches, update the timer default time
  useEffect(() => {
    if (!isRunning) {
      if (mode === MODE_WORK) setTimeLeft(config.work * 60);
      else if (mode === MODE_SHORT) setTimeLeft(config.shortBreak * 60);
      else if (mode === MODE_LONG) setTimeLeft(config.longBreak * 60);
    }
    // eslint-disable-next-line
  }, [config]);

  // PUBLIC_INTERFACE
  function formatTime(secs) {
    const abs = Math.max(0, secs);
    const m = String(Math.floor(abs / 60)).padStart(2, "0");
    const s = String(abs % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  // PUBLIC_INTERFACE
  function logSession(status) {
    // Only log completed work sessions for history
    if (mode !== MODE_WORK) return;
    const entry = {
      timestamp: new Date().toISOString(),
      duration: config.work,
      status,
    };
    const updated = [entry, ...history].slice(0, 30);
    setHistory(updated);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updated));
  }

  // PUBLIC_INTERFACE
  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(LOCALSTORAGE_KEY);
  }

  // PUBLIC_INTERFACE
  function handleSkip() {
    setIsRunning(false);
    audioRef.current && audioRef.current.play();
    if (mode === MODE_WORK) {
      logSession("SKIPPED");
      if ((cycle + 1) % config.cyclesPerLongBreak === 0) {
        setMode(MODE_LONG);
        setTimeLeft(config.longBreak * 60);
      } else {
        setMode(MODE_SHORT);
        setTimeLeft(config.shortBreak * 60);
      }
      setCycle((c) => c + 1);
    } else {
      setMode(MODE_WORK);
      setTimeLeft(config.work * 60);
    }
  }

  // PUBLIC_INTERFACE
  function openSettings() {
    setShowSettings(true);
    setIsRunning(false);
  }
  // PUBLIC_INTERFACE
  function closeSettings() {
    setShowSettings(false);
  }
  // PUBLIC_INTERFACE
  function openHistory() {
    setShowHistory(true);
    setIsRunning(false);
  }
  // PUBLIC_INTERFACE
  function closeHistory() {
    setShowHistory(false);
  }

  // Quick stats for completed pomodoros
  const pomodorosToday = history.filter((h) => {
    const d = new Date(h.timestamp);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear() &&
      h.status === "COMPLETED"
    );
  }).length;

  // Minimal distraction-free UI
  return (
    <div className="App" style={{ minHeight: "100vh" }}>
      <header className="App-header" style={{ background: "var(--bg-secondary)" }}>
        {/* Theme Toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          style={{ border: "none" }}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <h1
          style={{
            margin: 0,
            fontWeight: 700,
            color: ACCENT,
            letterSpacing: "0.1em",
            fontSize: "2.2rem",
          }}
        >
          FocusFlow
        </h1>
        <p
          style={{
            margin: "0.5em 0",
            color: "var(--text-primary)",
            fontWeight: 400,
            opacity: 0.6,
            fontSize: "1.1rem",
          }}
        >
          Pomodoro Timer
        </p>
        {/* Stats quick view */}
        <button
          style={{
            background: PRIMARY,
            color: SECONDARY,
            padding: "7px 16px",
            borderRadius: "8px",
            border: "none",
            margin: "0.5em",
            fontWeight: 600,
            fontSize: "15px",
            letterSpacing: "0.04em",
            cursor: "pointer",
          }}
          onClick={openHistory}
        >
          📈 History&nbsp;
          <span style={{ background: ACCENT, color: "#fff", borderRadius: "6px", padding: "2px 8px", marginLeft: "3px", fontWeight: 700 }}>
            {pomodorosToday}
          </span>
          &nbsp;Today
        </button>
      </header>

      {/* Timer Centerpiece */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(60vh)",
          marginTop: "-80px",
        }}
      >
        <div
          style={{
            background: theme === "light" ? "#fff" : "#222",
            border: `3px solid ${ACCENT}`,
            borderRadius: "2.1em",
            boxShadow: "0px 2px 20px rgba(30,30,40,0.07)",
            padding: "2.1em 2.8em",
            margin: "1.5em 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: "275px",
            position: "relative",
          }}
        >
          {/* Mode Label */}
          <span
            style={{
              position: "absolute",
              top: "-30px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "0.98em",
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: PRIMARY,
              opacity: "0.9",
            }}
          >
            {mode}
          </span>
          {/* Timer display */}
          <div
            style={{
              fontSize: "4.8rem",
              letterSpacing: "0.05em",
              fontWeight: 700,
              color: ACCENT,
              marginBottom: "0.4em",
              fontFamily: "monospace",
              textShadow: theme === "dark" ? "0px 2px 18px #0002" : "none",
              userSelect: "none",
            }}
          >
            {formatTime(timeLeft)}
          </div>
          {/* Timer controls */}
          <div style={{ display: "flex", gap: "1.2em" }}>
            {isRunning ? (
              <button
                style={btnSecondary}
                onClick={handlePause}
                aria-label="Pause timer"
              >
                ⏸ Pause
              </button>
            ) : (
              <button
                style={btnEmph}
                onClick={handleStart}
                aria-label="Start timer"
              >
                ▶ Start
              </button>
            )}
            <button style={btnPlain} onClick={handleReset} aria-label="Reset timer">
              ⟳ Reset
            </button>
            <button style={btnPlain} onClick={handleSkip} aria-label="Skip session">
              ⏭ Skip
            </button>
            <button
              style={btnPlain}
              onClick={openSettings}
              aria-label="Open timer settings"
            >
              ⚙️
            </button>
          </div>
        </div>
        {/* Config summary quickbar */}
        <div
          style={{
            display: "flex",
            gap: "2.5em",
            margin: "0.8em 0 1.4em",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.05em",
            color: "var(--text-primary)",
            opacity: 0.78,
          }}
        >
          <span>Work: <strong>{config.work}m</strong></span>
          <span>Short Break: <strong>{config.shortBreak}m</strong></span>
          <span>Long Break: <strong>{config.longBreak}m</strong></span>
          <span>Cycle: <strong>{(cycle % config.cyclesPerLongBreak) + 1}/{config.cyclesPerLongBreak}</strong></span>
        </div>
      </main>

      {/* Settings Drawer */}
      {showSettings && (
        <Modal onClose={closeSettings} title="Pomodoro Settings">
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.4em",
              marginTop: "0.4em",
            }}
            onSubmit={e => {
              e.preventDefault();
              closeSettings();
            }}
          >
            <label>
              <span style={labelStyle}>Work duration (minutes)</span>
              <input
                type="number"
                min="1"
                max="120"
                name="work"
                value={config.work}
                onChange={handleConfigChange}
                style={inputStyle}
              />
            </label>
            <label>
              <span style={labelStyle}>Short break (minutes)</span>
              <input
                type="number"
                min="1"
                max="60"
                name="shortBreak"
                value={config.shortBreak}
                onChange={handleConfigChange}
                style={inputStyle}
              />
            </label>
            <label>
              <span style={labelStyle}>Long break (minutes)</span>
              <input
                type="number"
                min="1"
                max="90"
                name="longBreak"
                value={config.longBreak}
                onChange={handleConfigChange}
                style={inputStyle}
              />
            </label>
            <label>
              <span style={labelStyle}>Sessions before long break</span>
              <input
                type="number"
                min="1"
                max="12"
                name="cyclesPerLongBreak"
                value={config.cyclesPerLongBreak}
                onChange={handleConfigChange}
                style={inputStyle}
              />
            </label>
            <button
              type="submit"
              style={{
                ...btnEmph,
                marginTop: "0.6em",
                fontSize: "1.15em",
                width: "100%",
              }}
            >
              Save & Close
            </button>
          </form>
        </Modal>
      )}

      {/* History/Stats Drawer */}
      {showHistory && (
        <Modal onClose={closeHistory} title="Pomodoro History">
          <div style={{ maxHeight: "350px", overflow: "auto", marginBottom: "1.1em" }}>
            {history.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No pomodoro history yet!</p>
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
                            color:
                              h.status === "COMPLETED"
                                ? ACCENT
                                : h.status === "SKIPPED"
                                ? "# adadad"
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
              ...btnPlain,
              color: "#e53935",
              borderColor: "#e57373",
              marginBottom: "0.4em",
            }}
            onClick={clearHistory}
          >
            Clear history
          </button>
        </Modal>
      )}

      {/* Hidden audio for beep */}
      <audio ref={audioRef} src={BEEP_SRC} preload="auto" />

      {/* Footer */}
      <footer
        style={{
          width: "100%",
          padding: "1.6em 0 1.2em",
          textAlign: "center",
          fontSize: "0.98em",
          color: "var(--text-secondary)",
          background: "transparent",
          letterSpacing: "0.04em",
          userSelect: "none",
        }}
      >
        <span>
          FocusFlow &copy; {new Date().getFullYear()} —&nbsp;
          <a
            href="https://www.florinpop.com/blog/2019/05/the-pomodoro-technique/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: PRIMARY, textDecoration: "none" }}
          >Pomodoro method</a>
        </span>
      </footer>
    </div>
  );
}

// Minimalist Modal component
function Modal({ onClose, title, children }) {
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
    >
      <div
        style={{
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          borderRadius: "17px",
          minWidth: "320px",
          maxWidth: "90vw",
          boxShadow: "0 6px 32px #1112",
          padding: "2.2em 2.3em 1.4em",
          position: "relative",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            right: "23px",
            top: "21px",
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
        <h2 style={{ marginTop: 0, color: "#ff7043", fontSize: "1.3em", letterSpacing: "0.03em" }}>
          {title}
        </h2>
        <div>{children}</div>
      </div>
    </div>
  );
}

// Minimal button style objects (inline for minimalistic code)
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
const labelStyle = {
  marginBottom: "0.1em",
  fontWeight: 400,
  fontSize: "1em",
  color: PRIMARY,
  letterSpacing: "0",
  display: "block",
};
const inputStyle = {
  marginTop: "6px",
  minWidth: "80px",
  fontSize: "1.07em",
  padding: "5px 13px",
  border: `2px solid ${ACCENT}`,
  borderRadius: "8px",
  outline: "none",
};

// PUBLIC_INTERFACE
export default App;
