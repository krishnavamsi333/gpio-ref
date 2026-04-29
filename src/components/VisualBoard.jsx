// components/VisualBoard.jsx
import React, { useState } from "react";
import { PINS, TYPES } from "../data/pins";
import { useSectionFade } from "../hooks/useSectionFade";

const DOT_COLORS = {
  PWR33: "#ef4444", PWR5: "#f97316", GND: "#3a4450",
  GPIO: "#3b82f6",  I2C: "#22c55e",  SPI: "#f97316",
  UART: "#eab308",  PWM: "#a855f7",  ID: "#94a3b8",
  ONEWIRE: "#22d3ee",
};

export default function VisualBoard({ onPinSelect }) {
  const [tooltip, setTooltip] = useState(null);
  const ref = useSectionFade();

  const oddPins  = PINS.filter(p => p[0] % 2 === 1);
  const evenPins = PINS.filter(p => p[0] % 2 === 0);

  function handleClick(p, i) {
    document.getElementById("pinmap")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => onPinSelect(i), 350);
  }

  return (
    <div id="visual" className="section" ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">Board Visualization</div>
          <h2 className="section-title">Visual GPIO Board</h2>
          <p className="section-sub">Hover pins to preview · Click to jump to detail · Coloured by function type</p>
        </div>

        <div className="grid2" style={{ alignItems: "start" }}>
          {/* Board */}
          <div className="visual-pinout">
            <div className="pinout-board">
              {/* Odd column */}
              <div>
                <div className="pinout-hdr-label">ODD 1,3,5…</div>
                <div className="pinout-row">
                  {oddPins.map((p, i) => {
                    const idx = PINS.indexOf(p);
                    return (
                      <div
                        key={p[0]}
                        className="pinout-dot"
                        style={{ background: DOT_COLORS[p[3]] }}
                        title={`Pin ${p[0]}: ${p[2]}`}
                        onMouseEnter={() => setTooltip(p)}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => handleClick(p, idx)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="pinout-center"><span>GPIO</span></div>

              {/* Even column */}
              <div>
                <div className="pinout-hdr-label">EVEN 2,4,6…</div>
                <div className="pinout-row">
                  {evenPins.map(p => {
                    const idx = PINS.indexOf(p);
                    return (
                      <div
                        key={p[0]}
                        className="pinout-dot"
                        style={{ background: DOT_COLORS[p[3]] }}
                        title={`Pin ${p[0]}: ${p[2]}`}
                        onMouseEnter={() => setTooltip(p)}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => handleClick(p, idx)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tooltip */}
            <div className="visual-tooltip">
              {tooltip ? (
                <>
                  <strong style={{ color: "var(--text)" }}>Pin {tooltip[0]} · {tooltip[2]}</strong>
                  <span style={{ color: "var(--text3)", fontSize: 10 }}>
                    {" "}{tooltip[3]}{tooltip[1] !== null ? " · BCM" + tooltip[1] : ""}
                  </span>
                  <br />
                  <span style={{ fontSize: 10 }}>{tooltip[4]}</span>
                </>
              ) : (
                "Hover a pin dot to see its function"
              )}
            </div>
          </div>

          {/* Legend + warnings */}
          <div>
            <div className="visual-legend">
              {Object.entries(TYPES).map(([t, { n, dot }]) => (
                <div className="vl-row" key={t}>
                  <div className="vl-dot" style={{ background: dot }} />
                  {n}
                </div>
              ))}
            </div>
            <div className="warn-box" style={{ marginTop: 16 }}>
              ⚠️ <strong>Never connect 5V to a GPIO pin.</strong> Use a level-shifter (BSS138, TXS0108E) or resistor divider for one-way signals.
            </div>
            <div className="danger-box">
              ⚡ <strong>GPIO current limits:</strong> 16 mA max per pin · 50 mA total · Always use a current-limiting resistor with LEDs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}