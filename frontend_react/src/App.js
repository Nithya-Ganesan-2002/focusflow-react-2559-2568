import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import TimerDisplay from "./components/TimerDisplay";
import SessionControls from "./components/SessionControls";
import ThemeToggle from "./components/ThemeToggle";
import HistoryPanel from "./components/HistoryPanel";

// Accent, primary, and secondary colors
const ACCENT = "#ff7043";
const PRIMARY = "#1976d2";
const SECONDARY = "#ffffff";

// Default Pomodoro config (in minutes)
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

const MODE_WORK = "Work";
const MODE_SHORT = "Short Break";
const MODE_LONG = "Long Break";

// PUBLIC_INTERFACE
function App() {
  // Theme management
  const [theme, setTheme] = useState("light");

  // Pomodoro configuration
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

  // Timer completion logic
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
    // eslint-disable-next-line
  }, [timeLeft]); 

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // PUBLIC_INTERFACE
  const handleStart = () => setIsRunning(true);

  // PUBLIC_INTERFACE
  const handlePause = () => setIsRunning(false);

  // PUBLIC_INTERFACE
  const handleReset = () => {
    setIsRunning(false);
    if (mode === MODE_WORK) setTimeLeft(config.work * 60);
    if (mode === MODE_SHORT) setTimeLeft(config.shortBreak * 60);
    if (mode === MODE_LONG) setTimeLeft(config.longBreak * 60);
  };

  // PUBLIC_INTERFACE
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    let v = Number(value);
    if (isNaN(v) || v < 1 || v > 120) return;
    setConfig((prev) => ({ ...prev, [name]: v }));
  };

  // Update timer if config changes and not running
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
  const handleSkip = () => {
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
  };

  // PUBLIC_INTERFACE
  const openSettings = () => {
    setShowSettings(true);
    setIsRunning(false);
  };
  // PUBLIC_INTERFACE
  const closeSettings = () => setShowSettings(false);
  // PUBLIC_INTERFACE
  const openHistory = () => {
    setShowHistory(true);
    setIsRunning(false);
  };
  // PUBLIC_INTERFACE
  const closeHistory = () => setShowHistory(false);

  // Stats for today
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
        {/* Theme Toggle Button */}
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
        {/* Stats quick view button */}
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
          <span style={{
            background: ACCENT,
            color: "#fff",
            borderRadius: "6px",
            padding: "2px 8px",
            marginLeft: "3px",
            fontWeight: 700
          }}>
            {pomodorosToday}
          </span>
          &nbsp;Today
        </button>
      </header>

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
        {/* Modular TimerDisplay */}
        <TimerDisplay
          mode={mode}
          timeLeft={timeLeft}
          theme={theme}
          formatTime={formatTime}
        />
        {/* Session Controls */}
        <SessionControls
          isRunning={isRunning}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onSkip={handleSkip}
          onSettings={openSettings}
        />
        {/* Config quickbar */}
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

      {/* Settings Drawer/Modal inlined - keep modal here for now */}
      {showSettings && (
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
          onClick={closeSettings}
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
              onClick={closeSettings}
              aria-label="Close settings modal"
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
            <h2 style={{ marginTop: 0, color: ACCENT, fontSize: "1.3em", letterSpacing: "0.03em" }}>
              Pomodoro Settings
            </h2>
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
                <span style={{
                  marginBottom: "0.1em",
                  fontWeight: 400,
                  fontSize: "1em",
                  color: PRIMARY,
                  display: "block"
                }}>Work duration (minutes)</span>
                <input
                  type="number"
                  min="1"
                  max="120"
                  name="work"
                  value={config.work}
                  onChange={handleConfigChange}
                  style={{
                    marginTop: "6px",
                    minWidth: "80px",
                    fontSize: "1.07em",
                    padding: "5px 13px",
                    border: `2px solid ${ACCENT}`,
                    borderRadius: "8px",
                    outline: "none",
                  }}
                />
              </label>
              <label>
                <span style={{
                  marginBottom: "0.1em",
                  fontWeight: 400,
                  fontSize: "1em",
                  color: PRIMARY,
                  display: "block"
                }}>Short break (minutes)</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  name="shortBreak"
                  value={config.shortBreak}
                  onChange={handleConfigChange}
                  style={{
                    marginTop: "6px",
                    minWidth: "80px",
                    fontSize: "1.07em",
                    padding: "5px 13px",
                    border: `2px solid ${ACCENT}`,
                    borderRadius: "8px",
                    outline: "none",
                  }}
                />
              </label>
              <label>
                <span style={{
                  marginBottom: "0.1em",
                  fontWeight: 400,
                  fontSize: "1em",
                  color: PRIMARY,
                  display: "block"
                }}>Long break (minutes)</span>
                <input
                  type="number"
                  min="1"
                  max="90"
                  name="longBreak"
                  value={config.longBreak}
                  onChange={handleConfigChange}
                  style={{
                    marginTop: "6px",
                    minWidth: "80px",
                    fontSize: "1.07em",
                    padding: "5px 13px",
                    border: `2px solid ${ACCENT}`,
                    borderRadius: "8px",
                    outline: "none",
                  }}
                />
              </label>
              <label>
                <span style={{
                  marginBottom: "0.1em",
                  fontWeight: 400,
                  fontSize: "1em",
                  color: PRIMARY,
                  display: "block"
                }}>Sessions before long break</span>
                <input
                  type="number"
                  min="1"
                  max="12"
                  name="cyclesPerLongBreak"
                  value={config.cyclesPerLongBreak}
                  onChange={handleConfigChange}
                  style={{
                    marginTop: "6px",
                    minWidth: "80px",
                    fontSize: "1.07em",
                    padding: "5px 13px",
                    border: `2px solid ${ACCENT}`,
                    borderRadius: "8px",
                    outline: "none",
                  }}
                />
              </label>
              <button
                type="submit"
                style={{
                  background: ACCENT,
                  color: "#fff",
                  border: "none",
                  padding: "0.7em 1.4em",
                  borderRadius: "13px",
                  fontWeight: 700,
                  fontSize: "1.15em",
                  cursor: "pointer",
                  marginTop: "0.6em",
                  width: "100%",
                  transition: "all 0.13s"
                }}
              >
                Save & Close
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Session History/Stats Modal, modular */}
      <HistoryPanel
        open={showHistory}
        onClose={closeHistory}
        history={history}
        clearHistory={clearHistory}
      />

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

// PUBLIC_INTERFACE
export default App;
