// components/Toast.jsx
import React from "react";

export function Toast({ msg, show }) {
  return (
    <div className={`toast${show ? " show" : ""}`}>{msg}</div>
  );
}

// components/BackToTop.jsx
export function BackToTop({ visible }) {
  return (
    <div
      className={`back-top${visible ? " visible" : ""}`}
      title="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </div>
  );
}

// components/ScrollProgress.jsx
export function ScrollProgress({ progress }) {
  return (
    <div
      id="scroll-progress"
      style={{
        position: "fixed",
        top: 0, left: 0,
        height: 3,
        width: progress + "%",
        background: "linear-gradient(90deg, var(--red) 0%, var(--orange) 42%, var(--purple) 100%)",
        zIndex: 9999,
        transition: "width .07s linear",
        pointerEvents: "none",
      }}
    />
  );
}