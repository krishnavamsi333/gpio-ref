// components/Hero.jsx
import React from "react";

const STATS = [
  { num: "40", label: "Total Pins" },
  { num: "28", label: "User GPIOs" },
  { num: "6",  label: "ALT Modes"  },
  { num: "7",  label: "SPI Buses"  },
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div>
          <div className="hero-eye">
            <span className="led-dot" />
            Complete Hardware Reference · BCM2711
          </div>
          <h1 className="hero-title">
            Raspberry Pi 4<br />
            <span>GPIO &amp; Peripherals</span>
          </h1>
          <p className="hero-sub">
            Full 40-pin pinout, alternate functions, pull states — plus interactive
            tools: I²C · SPI · UART · PWM · 1-Wire reference, GPIO planner with
            conflict detection, PWM calculator, voltage divider, LED resistor, and
            more. Based on BCM2711 datasheet RP-008341-DS Rev 1.1.
          </p>
          <div className="hero-badges">
            <span className="hb hb-red">BCM2711</span>
            <span className="hb hb-blue">40-Pin Header</span>
            <span className="hb hb-green">28 User GPIOs</span>
            <span className="hb hb-purple">6 ALT Modes</span>
            <span className="hb hb-cyan">Rev 1.1 · 2024</span>
          </div>
        </div>
        <div className="hero-stats">
          {STATS.map(({ num, label }) => (
            <div className="hs" key={label}>
              <div className="hs-num">{num}</div>
              <div className="hs-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}