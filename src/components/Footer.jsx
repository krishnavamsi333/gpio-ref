// components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6, fontFamily: "'Syne',sans-serif", fontSize: 14 }}>
            Raspberry Pi 4 GPIO Reference
          </div>
          <div>Based on BCM2711 datasheet RP-008341-DS Release 1.1, March 2024 · © Raspberry Pi (Trading) Ltd.</div>
          <div style={{ marginTop: 4 }}>Light/dark mode · GPIO planner · Search · JSON export · Interactive calculators.</div>
        </div>
        <div className="footer-links">
          <a href="https://datasheets.raspberrypi.com/rpi4/raspberry-pi-4-datasheet.pdf" target="_blank" rel="noreferrer">BCM2711 Datasheet</a>
          <a href="https://www.raspberrypi.com/documentation/computers/raspberry-pi.html" target="_blank" rel="noreferrer">RPi Docs</a>
          <a href="https://pinout.xyz" target="_blank" rel="noreferrer">pinout.xyz</a>
        </div>
      </div>
    </footer>
  );
}