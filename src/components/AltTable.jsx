// components/AltTable.jsx
import React from "react";
import { PINS } from "../data/pins";
import { chipClass } from "../utils/helpers";
import { useSectionFade } from "../hooks/useSectionFade";

const ALT_MODES = ["ALT0","ALT1","ALT2","ALT3","ALT4","ALT5"];

export default function AltTable() {
  const ref = useSectionFade();

  const gpioPins = PINS
    .filter(p => p[1] !== null && Object.keys(p[5]).length > 0)
    .sort((a, b) => a[1] - b[1]);

  return (
    <div id="altfn" className="section" ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">BCM2711 Datasheet Table 5</div>
          <h2 className="section-title">Alternate Functions</h2>
          <p className="section-sub">All 28 user GPIOs · ALT0–ALT5 · Source: RP-008341-DS Release 1.1, March 2024</p>
        </div>

        <div className="table-wrap">
          <table className="alt-table">
            <thead>
              <tr>
                <th>Label</th><th>GPIO</th><th>Pull</th><th>Phys</th>
                {ALT_MODES.map(a => <th key={a}>{a}</th>)}
              </tr>
            </thead>
            <tbody>
              {gpioPins.map(p => {
                const [phys, bcm, label, type, desc, alts] = p;
                const pull = desc.includes("pull=High") ? "High" : "Low";
                return (
                  <tr key={bcm}>
                    <td><span className={`pl pt-${type}`} style={{ cursor: "default", fontSize: 10 }}>{label}</span></td>
                    <td style={{ fontWeight: 700, color: "var(--blue)" }}>GPIO{bcm}</td>
                    <td>
                      {pull === "High"
                        ? <span className="pull-hi">High</span>
                        : <span className="pull-lo">Low</span>}
                    </td>
                    <td style={{ color: "var(--text3)", fontSize: 10 }}>P{phys}</td>
                    {ALT_MODES.map(a => {
                      const v = alts[a] || "";
                      return v
                        ? <td key={a}><span className={`chip ${chipClass(v)}`}>{v}</span></td>
                        : <td key={a}><span className="ch-none">—</span></td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
          <span style={{ color: "var(--text3)", fontSize: 10, marginRight: 4 }}>Key:</span>
          {[["ch-uart","UART"],["ch-spi","SPI"],["ch-i2c","I²C"],["ch-pwm","PWM"],["ch-pcm","PCM/CLK"],["ch-jtag","JTAG"],["ch-clk","GPCLK"],["ch-dpi","DPI/SD"]].map(([cls,lbl]) => (
            <span key={cls} className={`chip ${cls}`}>{lbl}</span>
          ))}
        </div>
      </div>
    </div>
  );
}