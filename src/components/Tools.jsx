// components/Tools.jsx
import React, { useState } from "react";
import { I2C_DEVICES } from "../data/pins";
import { nearestE24 } from "../utils/helpers";
import { useSectionFade } from "../hooks/useSectionFade";

// ── Shared ToolCard shell ─────────────────────────────────────────────────────
function ToolCard({ icon, title, children }) {
  return (
    <div className="tool-card">
      <div className="tool-header">
        <span className="tool-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="tool-body">{children}</div>
    </div>
  );
}

function ResultBox({ children }) {
  return <div className="tool-result">{children}</div>;
}

// ── PWM Calculator ────────────────────────────────────────────────────────────
function PWMCalc() {
  const [freq, setFreq]  = useState(50);
  const [duty, setDuty]  = useState(50);

  let result = null;
  if (freq > 0 && freq <= 125e6) {
    const div       = Math.max(1, Math.round(19200000 / freq / 4096));
    const range     = Math.round(19200000 / div / freq);
    const actualFreq = 19200000 / div / Math.max(1, range);
    const err       = Math.abs((actualFreq - freq) / freq * 100);
    const periodUs  = (1 / freq * 1e6).toFixed(1);
    const dcMs      = ((duty / 100) * (1 / freq) * 1000).toFixed(3);
    result = { actualFreq, err, periodUs, dcMs };
  }

  return (
    <ToolCard icon="〰️" title="PWM Frequency Calculator">
      <div className="tool-row">
        <div className="tool-label">Target Frequency (Hz)</div>
        <input className="tool-input" type="number" value={freq} min="1" max="125000000" onChange={e => setFreq(+e.target.value)} />
      </div>
      <div className="tool-row">
        <div className="tool-label">Duty Cycle: {duty}%</div>
        <div className="range-row">
          <input className="range-input" type="range" min="0" max="100" value={duty} onChange={e => setDuty(+e.target.value)} />
        </div>
      </div>
      <ResultBox>
        {!result ? <span style={{ color: "var(--red)" }}>Frequency must be 1 Hz – 125 MHz</span> : (
          <>
            <div className="result-val">{result.actualFreq.toFixed(2)} Hz</div>
            <div className="result-sub">Period: {result.periodUs} µs · Duty: {result.dcMs} ms · Error: {result.err.toFixed(2)}%</div>
            <div className="result-sub" style={{ marginTop: 4, color: "var(--text3)" }}>
              pigpio: hardware_PWM(18, {Math.round(freq)}, {Math.round(duty * 10000)})<br />
              RPi.GPIO: PWM(pin, {Math.round(freq)}) → ChangeDutyCycle({duty})
            </div>
          </>
        )}
      </ResultBox>
    </ToolCard>
  );
}

// ── Voltage Divider ───────────────────────────────────────────────────────────
function VDivCalc() {
  const [vin,  setVin]  = useState(5);
  const [vout, setVout] = useState(3.3);
  const [r1,   setR1]   = useState(1000);

  let result = null;
  if (vin > 0 && vout > 0 && r1 > 0 && vout < vin) {
    const r2    = r1 * vout / (vin - vout);
    const r2std = nearestE24(r2);
    const actV  = vin * r2std / (r1 + r2std);
    const err   = Math.abs((actV - vout) / vout * 100);
    const curr  = vin / (r1 + r2std) * 1000;
    result = { r2, r2std, actV, err, curr };
  }

  return (
    <ToolCard icon="⚡" title="Voltage Divider (5V→3.3V)">
      {[["Input Voltage (V)", vin, setVin, 0.1],["Target Output (V)", vout, setVout, 0.1],["R1 top resistor (Ω)", r1, setR1, 1]].map(([lbl, val, set, step]) => (
        <div className="tool-row" key={lbl}>
          <div className="tool-label">{lbl}</div>
          <input className="tool-input" type="number" value={val} step={step} onChange={e => set(+e.target.value)} />
        </div>
      ))}
      <ResultBox>
        {!result ? <span style={{ color: "var(--red)" }}>Check values: Vout must be &lt; Vin</span> : (
          <>
            <div className="result-val">R2 = {result.r2.toFixed(0)} Ω → nearest E24: <strong>{result.r2std} Ω</strong></div>
            <div className="result-sub">Actual Vout: {result.actV.toFixed(3)}V · Error: {result.err.toFixed(2)}%</div>
            <div className="result-sub" style={{ color: "var(--text3)" }}>Current through divider: {result.curr.toFixed(2)} mA</div>
            <div style={{ marginTop: 10, padding: 10, background: "var(--bg3)", borderRadius: "var(--r)", border: "1px solid var(--border2)", fontSize: 11, color: "var(--text2)", lineHeight: 1.9, textAlign: "center" }}>
              Vin ({vin}V)<br/>│<br/>[R1 = {r1}Ω]<br/>│<br/>├── Vout = {result.actV.toFixed(2)}V → GPIO<br/>│<br/>[R2 = {result.r2std}Ω]<br/>│<br/>GND
            </div>
          </>
        )}
      </ResultBox>
    </ToolCard>
  );
}

// ── Servo Pulse ───────────────────────────────────────────────────────────────
function ServoCalc() {
  const [angle, setAngle] = useState(90);
  const [minP,  setMinP]  = useState(1000);
  const [maxP,  setMaxP]  = useState(2000);
  const pulse = minP + (maxP - minP) * (angle / 180);
  const duty  = pulse / 20000 * 100;

  return (
    <ToolCard icon="🔄" title="Servo Pulse Width">
      <div className="tool-row">
        <div className="tool-label">Angle: {angle}°</div>
        <div className="range-row">
          <input className="range-input" type="range" min="0" max="180" value={angle} onChange={e => setAngle(+e.target.value)} />
        </div>
      </div>
      {[["Min pulse (µs)", minP, setMinP],["Max pulse (µs)", maxP, setMaxP]].map(([lbl,val,set])=>(
        <div className="tool-row" key={lbl}>
          <div className="tool-label">{lbl}</div>
          <input className="tool-input" type="number" value={val} onChange={e => set(+e.target.value)} />
        </div>
      ))}
      <ResultBox>
        <div className="result-val">{pulse.toFixed(0)} µs pulse</div>
        <div className="result-sub">Duty cycle: {duty.toFixed(2)}% at 50 Hz</div>
        <div className="result-sub" style={{ color: "var(--text3)" }}>
          RPi.GPIO: ChangeDutyCycle({duty.toFixed(2)})<br/>
          pigpio: hardware_PWM(18,50,{Math.round(duty * 10000)})
        </div>
      </ResultBox>
    </ToolCard>
  );
}

// ── I2C Address Decoder ───────────────────────────────────────────────────────
function I2CDecoder() {
  const [raw, setRaw] = useState("");
  const addr = parseInt(raw.replace(/^0x/i, ""), 16);
  const valid = !isNaN(addr) && addr >= 0x03 && addr <= 0x77;
  const dev   = I2C_DEVICES[addr];

  return (
    <ToolCard icon="🔗" title="I²C Address Decoder">
      <div className="tool-row">
        <div className="tool-label">I²C Address (hex)</div>
        <input className="tool-input" type="text" placeholder="e.g. 68 or 0x68" value={raw} onChange={e => setRaw(e.target.value)} />
      </div>
      <ResultBox>
        {!raw ? (
          <span style={{ color: "var(--text4)" }}>Enter address to identify device</span>
        ) : !valid ? (
          <span style={{ color: "var(--red)" }}>Invalid (valid range: 0x03–0x77)</span>
        ) : (
          <>
            <div className="result-val">0x{addr.toString(16).toUpperCase().padStart(2,"0")}</div>
            <div className="result-sub">{dev || "Unknown / unlisted device — check datasheet"}</div>
            <div className="result-sub" style={{ color: "var(--text3)" }}>Scan: i2cdetect -y 1</div>
          </>
        )}
      </ResultBox>
    </ToolCard>
  );
}

// ── LED Resistor ──────────────────────────────────────────────────────────────
const LED_TYPES = [
  { value: "1.8",    label: "Red — ~1.8V"         },
  { value: "2.0",    label: "Yellow/Orange — ~2.0V" },
  { value: "2.1",    label: "Green — ~2.1V"         },
  { value: "3.0",    label: "Blue/White — ~3.0V"    },
  { value: "custom", label: "Custom Vf"              },
];

function LEDCalc() {
  const [vcc,     setVcc]     = useState(3.3);
  const [vfSel,   setVfSel]   = useState("2.1");
  const [vfCustom,setVfCustom]= useState(2.0);
  const [current, setCurrent] = useState(10);
  const vf = vfSel === "custom" ? vfCustom : parseFloat(vfSel);

  let result = null;
  if (vcc > vf) {
    const r    = (vcc - vf) / (current / 1000);
    const rStd = nearestE24(r);
    const actC = (vcc - vf) / rStd * 1000;
    const pwr  = actC / 1000 * (vcc - vf) * 1000;
    result = { r, rStd, actC, pwr };
  }

  return (
    <ToolCard icon="💡" title="LED Resistor Calculator">
      <div className="tool-row">
        <div className="tool-label">Supply Voltage (V)</div>
        <input className="tool-input" type="number" value={vcc} step="0.1" onChange={e => setVcc(+e.target.value)} />
      </div>
      <div className="tool-row">
        <div className="tool-label">LED Type</div>
        <select className="tool-select" value={vfSel} onChange={e => setVfSel(e.target.value)}>
          {LED_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {vfSel === "custom" && (
        <div className="tool-row">
          <div className="tool-label">Custom Vf (V)</div>
          <input className="tool-input" type="number" value={vfCustom} step="0.1" onChange={e => setVfCustom(+e.target.value)} />
        </div>
      )}
      <div className="tool-row">
        <div className="tool-label">Current (mA)</div>
        <input className="tool-input" type="number" value={current} onChange={e => setCurrent(+e.target.value)} />
      </div>
      <ResultBox>
        {!result ? (
          <span style={{ color: "var(--red)" }}>Vcc must be greater than LED Vf</span>
        ) : (
          <>
            <div className="result-val">R = {result.r.toFixed(0)} Ω → E24: <strong>{result.rStd} Ω</strong></div>
            <div className="result-sub">Actual current: {result.actC.toFixed(1)} mA · Power: {result.pwr.toFixed(1)} mW</div>
            <div className={result.actC > 16 ? "result-warn" : "result-ok"}>
              {result.actC > 16 ? "⚠️ Exceeds 16mA GPIO limit! Use a transistor." : "✓ Within GPIO safe limits"}
            </div>
          </>
        )}
      </ResultBox>
    </ToolCard>
  );
}

// ── UART Baud ─────────────────────────────────────────────────────────────────
const BAUD_RATES = [300,1200,2400,4800,9600,19200,38400,57600,115200,230400,460800,1000000,4000000];
const BAUD_USE_CASES = {
  300: "Historic modems", 1200: "Legacy telemetry", 2400: "GPS NMEA legacy",
  4800: "GPS NMEA standard", 9600: "GPS, sensors, Bluetooth AT commands",
  19200: "Industrial sensors", 38400: "Bluetooth serial", 57600: "High-speed sensor data",
  115200: "Default RPi serial · USB adapters", 230400: "High-speed comms",
  460800: "Bluetooth HCI", 1000000: "USB-serial fast · some GPS", 4000000: "UART0 PL011 max on RPi4",
};

function BaudCalc() {
  const [baud, setBaud] = useState(115200);
  const bitTime  = (1 / baud * 1e6).toFixed(3);
  const byteTime = (10 / baud * 1e6).toFixed(2);

  return (
    <ToolCard icon="💬" title="UART Baud Rate Info">
      <div className="tool-row">
        <div className="tool-label">Target baud rate</div>
        <select className="tool-select" value={baud} onChange={e => setBaud(+e.target.value)}>
          {BAUD_RATES.map(b => <option key={b} value={b}>{b >= 1000000 ? (b/1000000)+" Mbps" : b.toLocaleString()}</option>)}
        </select>
      </div>
      <ResultBox>
        <div className="result-val">{baud.toLocaleString()} bps</div>
        <div className="result-sub">Bit time: {bitTime} µs · 8N1 byte: {byteTime} µs</div>
        <div className="result-sub" style={{ color: "var(--text3)", marginTop: 3 }}>{BAUD_USE_CASES[baud] || "Custom baud"}</div>
        <div className="result-sub">serial.Serial('/dev/serial0', {baud})</div>
      </ResultBox>
    </ToolCard>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function Tools() {
  const ref = useSectionFade();
  return (
    <div id="tools" className="section" ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">Interactive Utilities</div>
          <h2 className="section-title">Tools &amp; Calculators</h2>
          <p className="section-sub">PWM · Voltage divider · Servo · I²C address decoder · LED resistor · UART baud</p>
        </div>
        <div className="tools-grid">
          <PWMCalc /><VDivCalc /><ServoCalc /><I2CDecoder /><LEDCalc /><BaudCalc />
        </div>
      </div>
    </div>
  );
}