// components/PullStates.jsx
import React from "react";
import { PULL_STATES } from "../data/pins";
import { useSectionFade } from "../hooks/useSectionFade";

export default function PullStates() {
  const ref = useSectionFade();

  return (
    <div id="pulls" className="section" ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">Default Power-On State</div>
          <h2 className="section-title">Pull-up / Pull-down States</h2>
          <p className="section-sub">Default pull state at BCM2711 power-on. All overridable in software.</p>
        </div>

        <div className="grid2">
          <div>
            <div className="tip-box">
              <strong>Pull-UP (HIGH by default)</strong><br />
              Pin reads HIGH when floating. BCM2711 internal pull ≈ 50 kΩ.
              I²C header pins have board-level <strong>1.8 kΩ</strong> pull-ups for fast edge rates.
            </div>
            <div className="warn-box">
              <strong>Pull-DOWN (LOW by default)</strong><br />
              Override:{" "}
              <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 5px", borderRadius: 3, fontSize: 10 }}>
                GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)
              </code>
            </div>
            <div className="danger-box">
              <strong>⚠ 3.3V Logic ONLY — All GPIO pins</strong><br />
              Connecting 5V will permanently damage the BCM2711. Use a bi-directional level shifter
              (e.g., TXS0108E) or voltage divider for read-only 5V signals.
            </div>
          </div>

          <div style={{ overflow: "auto", border: "1px solid var(--border2)", borderRadius: "var(--r-lg)", maxHeight: 500 }}>
            <table className="pull-table">
              <thead>
                <tr>
                  <th>BCM GPIO</th><th>Phys Pin</th><th>Default Pull</th><th>Description</th><th>Override</th>
                </tr>
              </thead>
              <tbody>
                {PULL_STATES.map(([bcm, phys, pull, desc, override]) => (
                  <tr key={bcm}>
                    <td style={{ fontWeight: 700, color: "var(--blue)" }}>GPIO{bcm}</td>
                    <td style={{ color: "var(--text3)", fontSize: 10 }}>Pin {phys}</td>
                    <td>
                      {pull === "High"
                        ? <span className="pull-hi">High (pull-up)</span>
                        : <span className="pull-lo">Low (pull-down)</span>}
                    </td>
                    <td style={{ color: "var(--text2)" }}>{desc}</td>
                    <td style={{ color: "var(--text3)", fontSize: 10 }}>{override}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}