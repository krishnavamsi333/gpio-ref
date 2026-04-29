// components/Peripherals.jsx
import React from "react";
import { PERIPH_CARDS } from "../data/pins";
import { useSectionFade } from "../hooks/useSectionFade";

const TIMING_CARDS = [
  { title: "I²C Timing",    rows: [["Standard","100 kHz"],["Fast mode","400 kHz"],["Fast+","1 MHz"],["Bit time @ 100kHz","10 µs"],["Board pull-up","1.8 kΩ"]] },
  { title: "SPI Timing",    rows: [["Max clock","125 MHz"],["Clock divisor","250 MHz / n (even)"],["Default","500 kHz"],["CE setup","1 clock cycle"],["CE polarity","Active LOW"]] },
  { title: "UART Timing",   rows: [["Common bauds","9600, 115200, 230400"],["Max (UART0)","~4 Mbps"],["Frame default","8N1"],["Start bit","1 bit (LOW)"],["Stop bit","1 or 2 bits (HIGH)"]] },
  { title: "PWM / Servo",   rows: [["Servo freq","50 Hz (20 ms period)"],["0°","1.0 ms (5%)"],["90°","1.5 ms (7.5%)"],["180°","2.0 ms (10%)"],["LED PWM","1 kHz typical"]] },
  { title: "GPIO Electrical",rows:[["Logic voltage","3.3V ONLY"],["Max per pin","16 mA output"],["Max total","50 mA (all GPIO)"],["HIGH threshold","> 1.6V"],["Internal pull","~50 kΩ"]] },
  { title: "1-Wire Timing", rows: [["Standard speed","15.4 kbps"],["Overdrive","125 kbps"],["Reset pulse","480 µs LOW"],["DS18B20 convert","750 ms @ 12-bit"],["Pull-up","4.7 kΩ to 3.3V"]] },
];

export default function Peripherals() {
  const ref = useSectionFade();
  return (
    <div id="periph" className="section" ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">BCM2711 Peripheral Summary</div>
          <h2 className="section-title">All Peripheral Blocks</h2>
          <p className="section-sub">Full peripheral inventory of the BCM2711 SoC in Raspberry Pi 4 Model B</p>
        </div>

        {/* Peripheral cards */}
        <div className="periph-grid">
          {PERIPH_CARDS.map(({ title, color, items }) => (
            <div key={title} className="periph-card" style={{ borderTopColor: color }}>
              <h3 style={{ color }}>{title}</h3>
              <ul>
                {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}
              </ul>
            </div>
          ))}
        </div>

        {/* Timing reference */}
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: "-.03em", marginBottom: 16 }}>
            Signal Timing Reference
          </h3>
          <div className="timing-grid">
            {TIMING_CARDS.map(({ title, rows }) => (
              <div key={title} className="timing-card">
                <div className="tc-hdr">{title}</div>
                {rows.map(([k, v, style]) => (
                  <div key={k} className="tc-row">
                    <span className="tc-k">{k}</span>
                    <span className="tc-v" style={style}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}