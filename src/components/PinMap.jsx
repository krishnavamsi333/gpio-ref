// components/PinMap.jsx
import React, { useState } from "react";
import { PINS, TYPES } from "../data/pins";
import { chipClass } from "../utils/helpers";
import { useSectionFade } from "../hooks/useSectionFade";

// ── Pull badge ────────────────────────────────────────────────────────────────
function PullBadge({ desc }) {
  if (desc.includes("pull=High")) return <span className="pull-hi">PULL-UP (default High)</span>;
  if (desc.includes("pull=Low"))  return <span className="pull-lo">PULL-DOWN (default Low)</span>;
  return null;
}

// ── Pin Detail Panel ──────────────────────────────────────────────────────────
function PinDetail({ pin, onClose }) {
  const [activeTab, setActiveTab] = useState("rpigpio");
  const [copied,    setCopied]    = useState(false);
  if (!pin) return null;

  const [phys, bcm, label, type, desc, alts] = pin;
  const altModes = ["ALT0","ALT1","ALT2","ALT3","ALT4","ALT5"];

  function copyCode(text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  const gpioCode = `GPIO.setmode(GPIO.BCM)\nGPIO.setup(${bcm}, GPIO.OUT)\nGPIO.output(${bcm}, GPIO.HIGH)\nval = GPIO.input(${bcm})`;
  const gzCode   = `from gpiozero import LED, Button\nled = LED(${bcm})\nbtn = Button(${bcm})\nled.on(); led.off(); led.toggle()`;

  return (
    <div className="pin-detail-panel open">
      <div className="pd-h">
        <span className={`pd-badge pt-${type}`}>{label}</span>
        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800 }}>Pin {phys}</span>
        {bcm !== null && <span style={{ color: "var(--text2)", fontSize: 13, fontWeight: 600 }}>BCM {bcm}</span>}
        <span style={{ color: "var(--text3)", fontSize: 11 }}>{type}</span>
        <PullBadge desc={desc} />
        <span className="pd-close" onClick={onClose}>✕</span>
      </div>

      <div className="pd-desc">{desc}</div>

      {bcm !== null && (
        <>
          {/* Code tabs */}
          <div className="pd-tabs">
            <span className={`pd-tab${activeTab === "rpigpio" ? " active" : ""}`} onClick={() => setActiveTab("rpigpio")}>RPi.GPIO</span>
            <span className={`pd-tab${activeTab === "gz"      ? " active" : ""}`} onClick={() => setActiveTab("gz")}>gpiozero</span>
          </div>
          <div className="pd-tab-content active">
            <div className="pd-code">
              <button
                className={`pd-copy-btn${copied ? " copied" : ""}`}
                onClick={() => copyCode(activeTab === "rpigpio" ? gpioCode : gzCode)}
              >
                {copied ? "copied!" : "copy"}
              </button>
              {activeTab === "rpigpio" ? (
                <pre style={{ margin: 0 }}>
                  <span style={{ color: "#4a5e80" }}># RPi.GPIO</span>{"\n"}
                  GPIO.setmode(GPIO.BCM){"\n"}
                  GPIO.setup(<span style={{ color: "#ff9e64" }}>{bcm}</span>, GPIO.OUT){"\n"}
                  GPIO.output(<span style={{ color: "#ff9e64" }}>{bcm}</span>, GPIO.HIGH){"\n"}
                  val = GPIO.input(<span style={{ color: "#ff9e64" }}>{bcm}</span>)
                </pre>
              ) : (
                <pre style={{ margin: 0 }}>
                  <span style={{ color: "#4a5e80" }}># gpiozero</span>{"\n"}
                  <span style={{ color: "#b088ff" }}>from</span> gpiozero <span style={{ color: "#b088ff" }}>import</span> LED, Button{"\n"}
                  led = LED(<span style={{ color: "#ff9e64" }}>{bcm}</span>){"\n"}
                  btn = Button(<span style={{ color: "#ff9e64" }}>{bcm}</span>){"\n"}
                  led.on(); led.off(); led.toggle()
                </pre>
              )}
            </div>
          </div>

          {/* ALT table */}
          {Object.keys(alts).length > 0 && (
            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 8 }}>ALT FUNCTION MAP</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "4px 6px", color: "var(--text3)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>GPIO</th>
                    {altModes.map(a => <th key={a} style={{ padding: "4px 6px", color: "var(--text3)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>{a}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "4px 6px", fontWeight: 700, color: "var(--blue)" }}>GPIO{bcm}</td>
                    {altModes.map(a => {
                      const v = alts[a] || "";
                      return v
                        ? <td key={a} style={{ padding: "4px 6px" }}><span className={`chip ${chipClass(v)}`}>{v}</span></td>
                        : <td key={a} style={{ padding: "4px 6px", color: "var(--text4)" }}>—</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend({ activeFilter, onFilter }) {
  return (
    <div className="legend">
      {Object.entries(TYPES).map(([t, { n, dot }]) => (
        <span
          key={t}
          className={`leg-item pt-${t}${activeFilter === t ? " active-filter" : ""}`}
          onClick={() => onFilter(activeFilter === t ? null : t)}
        >
          <span className="leg-dot" style={{ background: dot }} />
          {n}
        </span>
      ))}
    </div>
  );
}

// ── Main PinMap ───────────────────────────────────────────────────────────────
export default function PinMap({ selectedPinIdx, onPinSelect }) {
  const [activeFilter, setActiveFilter] = useState(null);
  const ref = useSectionFade();

  const rows = [];
  for (let i = 0; i < PINS.length; i += 2) {
    rows.push([PINS[i], PINS[i + 1], i]);
  }

  function isDimmed(L, R) {
    if (!activeFilter) return false;
    return L[3] !== activeFilter && R[3] !== activeFilter;
  }

  return (
    <div id="pinmap" className="section" ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">Header Pinout</div>
          <h2 className="section-title">40-Pin GPIO Map</h2>
          <p className="section-sub">Click any pin circle or label for full details · Filter by type using legend below</p>
        </div>

        <Legend activeFilter={activeFilter} onFilter={setActiveFilter} />

        <div className="pinmap-wrap">
          <table className="pinmap">
            <tbody>
              {rows.map(([L, R, i]) => (
                <tr key={i} className={isDimmed(L, R) ? "pin-row-dimmed" : ""}>
                  {/* Left side */}
                  <td className="pd-cell" title={L[4]} style={{ textAlign: "right" }}>
                    {L[4].length > 42 ? L[4].slice(0, 42) + "…" : L[4]}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className={`pl pt-${L[3]}`} onClick={() => onPinSelect(i)}>{L[2]}</span>
                  </td>
                  <td>
                    <div
                      className={`pn pn-${L[3]}${selectedPinIdx === i ? " selected" : ""}`}
                      onClick={() => onPinSelect(i)}
                      title={`Pin ${L[0]} · ${L[2]}`}
                    >
                      {L[0]}
                    </div>
                  </td>
                  <td className="psep">│</td>
                  {/* Right side */}
                  <td>
                    <div
                      className={`pn pn-${R[3]}${selectedPinIdx === i + 1 ? " selected" : ""}`}
                      onClick={() => onPinSelect(i + 1)}
                      title={`Pin ${R[0]} · ${R[2]}`}
                    >
                      {R[0]}
                    </div>
                  </td>
                  <td>
                    <span className={`pl pt-${R[3]}`} onClick={() => onPinSelect(i + 1)}>{R[2]}</span>
                  </td>
                  <td className="pd-cell" title={R[4]}>
                    {R[4].length > 42 ? R[4].slice(0, 42) + "…" : R[4]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedPinIdx !== null && (
          <PinDetail
            pin={PINS[selectedPinIdx]}
            onClose={() => onPinSelect(null)}
          />
        )}

        <div className="tip-box" style={{ marginTop: 18 }}>
          💡 <strong>Orientation:</strong> Pin 1 (3.3V) is top-left when USB ports face right.
          Odd pins = left column, Even = right. All GPIO logic is <strong>3.3V — NOT 5V tolerant.</strong> Max 16 mA per pin, 50 mA total.
        </div>
      </div>
    </div>
  );
}