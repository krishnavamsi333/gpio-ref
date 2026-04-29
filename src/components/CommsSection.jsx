// components/CommsSection.jsx
import React, { useState } from "react";
import { useSectionFade } from "../hooks/useSectionFade";
import { copyToClipboard } from "../utils/helpers";

// ── Reusable wiring block ─────────────────────────────────────────────────────
function WiringBlock({ title, children, copyText }) {
  const [copied, setCopied] = useState(false);
  function doCopy() {
    if (!copyText) return;
    copyToClipboard(copyText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  }
  return (
    <div className="wiring-block">
      <div className="wiring-title">{title}</div>
      {copyText && (
        <button className={`wiring-copy${copied ? " copied" : ""}`} onClick={doCopy}>
          {copied ? "copied!" : "copy"}
        </button>
      )}
      {children}
    </div>
  );
}

// ── Comms card ────────────────────────────────────────────────────────────────
function CommsCard({ iconBg, iconColor, iconLabel, title, sub, rows, pins, children }) {
  return (
    <div className="comms-card">
      <div className="cc-header">
        <div className="cc-icon" style={{ background: iconBg, color: iconColor }}>{iconLabel}</div>
        <div>
          <div className="cc-title">{title}</div>
          <div className="cc-sub">{sub}</div>
        </div>
      </div>
      {rows && (
        <div className="cc-body">
          {rows.map(([label, val, style]) => (
            <div className="cc-row" key={label}>
              <span className="cc-label">{label}</span>
              <span className="cc-val" style={style}>{val}</span>
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

// ── I2C Section ───────────────────────────────────────────────────────────────
function I2CSection() {
  const ref = useSectionFade();
  const g = "var(--grn-d)", gc = "var(--green)";
  return (
    <div id="i2c" className="section" ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">Serial Communications</div>
          <h2 className="section-title">I²C — Inter-Integrated Circuit</h2>
          <p className="section-sub">BCM2711 provides 7 I²C buses. I²C1 (Bus 1) is on the 40-pin header at Pins 3 and 5.</p>
        </div>
        <div className="comms-grid">
          <CommsCard iconBg={g} iconColor={gc} iconLabel="I²C" title="I²C Basics" sub="Two-wire synchronous serial"
            rows={[["Wires","2 (SDA + SCL)"],["Topology","Multi-master / multi-slave"],["Standard","100 kHz"],["Fast mode","400 kHz"],["Fast+","1 MHz"],["Addresses","7-bit (128) or 10-bit"],["BCM2711 buses","7 (I²C0–I²C6)"],["Header bus","I²C1 ← use this",{color:"var(--green)"}]]}>
            <div className="cc-pins">
              {[["SDA1","BCM2 · Pin 3","Data · 1.8kΩ board pull-up","ch-i2c"],["SCL1","BCM3 · Pin 5","Clock · 1.8kΩ board pull-up","ch-i2c"],["SDA0","BCM0 · Pin 27","HAT EEPROM — reserved",null],["SCL0","BCM1 · Pin 28","HAT EEPROM — reserved",null]].map(([name,phys,desc,cls]) => (
                <div className="cc-pin-row" key={name}>
                  <span className={`${cls ? "chip "+cls+" " : ""}cc-pin-name`} style={!cls?{fontSize:9,fontWeight:700,minWidth:62}:{}}>{name}</span>
                  <span className="cc-pin-phys">{phys}</span>
                  <span className="cc-pin-desc">{desc}</span>
                </div>
              ))}
            </div>
          </CommsCard>

          <CommsCard iconBg={g} iconColor={gc} iconLabel="I²C" title="Enable & Scan" sub="Setup and diagnostics">
            <div className="cc-body">
              <WiringBlock title="Enable I²C" copyText={"sudo raspi-config\n# Interface Options → I2C → Yes\n\n# /boot/config.txt:\ndtparam=i2c_arm=on\ndtparam=i2c_arm_baudrate=400000"}>
                sudo raspi-config → Interface → I²C → Yes<br/>
                <span style={{color:"var(--text3)"}}># /boot/config.txt:</span><br/>
                dtparam=i2c_arm=on<br/>dtparam=i2c_arm_baudrate=400000
              </WiringBlock>
              <WiringBlock title="Scan & debug" copyText={"sudo apt install i2c-tools\ni2cdetect -y 1\ni2cget -y 1 0x68 0x75\ni2cset -y 1 0x68 0x6B 0x00"}>
                sudo apt install i2c-tools<br/>i2cdetect -y 1<br/>i2cget -y 1 0x68 0x75<br/>i2cset -y 1 0x68 0x6B 0x00
              </WiringBlock>
            </div>
          </CommsCard>

          <CommsCard iconBg={g} iconColor={gc} iconLabel="I²C" title="I²C Bus Map" sub="All BCM2711 I²C buses"
            rows={[["I²C0","HAT EEPROM (GPIO0/1)"],["I²C1","Header Pins 3+5 ← use",{color:"var(--green)"}],["I²C2","HDMI DDC (internal)"],["I²C3","GPIO2/3/4/5 (ALT mux)"],["I²C4","GPIO7/8/9 (ALT mux)"],["I²C5","GPIO10/11/12/13 (ALT mux)"],["I²C6","GPIO0/1/22/23 (ALT mux)"]]} />
        </div>
      </div>
    </div>
  );
}

// ── SPI Section ───────────────────────────────────────────────────────────────
function SPISection() {
  const ref = useSectionFade();
  const o = "var(--orn-d)", oc = "var(--orange)";
  return (
    <div id="spi" className="section" style={{paddingTop:0}} ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">Serial Communications</div>
          <h2 className="section-title">SPI — Serial Peripheral Interface</h2>
          <p className="section-sub">BCM2711 has 7 SPI buses. SPI0 on header pins; SPI1–6 via ALT mux.</p>
        </div>
        <div className="comms-grid">
          <CommsCard iconBg={o} iconColor={oc} iconLabel="SPI" title="SPI0 Header Pins" sub="Main SPI bus on 40-pin header"
            rows={[["Type","Synchronous full-duplex"],["Max speed","125 MHz (250 MHz ÷ n)"],["Modes","CPOL/CPHA 0,1,2,3"],["CE0","GPIO8 · Pin 24 (active LOW)"],["CE1","GPIO7 · Pin 26 (active LOW)"]]}>
            <div className="cc-pins">
              {[["MOSI","GPIO10 · Pin 19","Master Out Slave In"],["MISO","GPIO9 · Pin 21","Master In Slave Out"],["SCLK","GPIO11 · Pin 23","Clock"],["CE0","GPIO8 · Pin 24","Chip enable 0"],["CE1","GPIO7 · Pin 26","Chip enable 1"]].map(([n,p,d])=>(
                <div className="cc-pin-row" key={n}><span className="chip ch-spi cc-pin-name">{n}</span><span className="cc-pin-phys">{p}</span><span className="cc-pin-desc">{d}</span></div>
              ))}
            </div>
          </CommsCard>

          <CommsCard iconBg={o} iconColor={oc} iconLabel="SPI" title="SPI Bus Map" sub="All 7 BCM2711 SPI buses"
            rows={[["SPI0","GPIO7–11 (header) ← use",{color:"var(--orange)"}],["SPI1","GPIO16–21 (ALT4)"],["SPI2","Not on header"],["SPI3","GPIO0/1/2/3/4 (ALT3)"],["SPI4","GPIO4/5/6/7/8 (ALT3)"],["SPI5","GPIO12–16 (ALT3)"],["SPI6","GPIO18–21 (ALT3)"]]}>
            <div className="cc-body">
              <WiringBlock title="Enable SPI" copyText={"sudo raspi-config\n# Interface Options → SPI → Yes\n\ndtparam=spi=on\ndtoverlay=spi1-3cs"}>
                sudo raspi-config → SPI → Yes<br/>dtparam=spi=on<br/>dtoverlay=spi1-3cs <span style={{color:"var(--text3)"}}># for SPI1</span>
              </WiringBlock>
            </div>
          </CommsCard>

          <CommsCard iconBg={o} iconColor={oc} iconLabel="SPI" title="SPI Modes" sub="Clock polarity and phase"
            rows={[["Mode 0","CPOL=0 CPHA=0 (most common)"],["Mode 1","CPOL=0 CPHA=1"],["Mode 2","CPOL=1 CPHA=0"],["Mode 3","CPOL=1 CPHA=1"],["CPOL=0","Clock idles LOW"],["CPOL=1","Clock idles HIGH"],["CPHA=0","Sample on leading edge"],["CPHA=1","Sample on trailing edge"]]} />
        </div>
      </div>
    </div>
  );
}

// ── UART Section ──────────────────────────────────────────────────────────────
function UARTSection() {
  const ref = useSectionFade();
  const y = "var(--yel-d)", yc = "var(--yellow)";
  return (
    <div id="uart" className="section" style={{paddingTop:0}} ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">Serial Communications</div>
          <h2 className="section-title">UART — Universal Async Receiver-Transmitter</h2>
          <p className="section-sub">BCM2711 has 6 UARTs. UART0 is a full PL011; UART1 is mini-UART (CPU-clock-dependent).</p>
        </div>
        <div className="comms-grid">
          <CommsCard iconBg={y} iconColor={yc} iconLabel="TX" title="Header UART Pins" sub="GPIO14/15 — default serial port"
            rows={[["Default baud","115200 bps"],["Baud range","300 – 4 Mbps"],["UART0","PL011 ← preferred",{color:"var(--yellow)"}],["UART1","Mini-UART (baud varies)"],["/dev/serial0","Symlink → active UART"]]}>
            <div className="cc-pins">
              <div className="cc-pin-row"><span className="chip ch-uart cc-pin-name">TXD0</span><span className="cc-pin-phys">GPIO14 · Pin 8</span><span className="cc-pin-desc">TX → RX of device</span></div>
              <div className="cc-pin-row"><span className="chip ch-uart cc-pin-name">RXD0</span><span className="cc-pin-phys">GPIO15 · Pin 10</span><span className="cc-pin-desc">RX ← TX of device</span></div>
            </div>
          </CommsCard>

          <CommsCard iconBg={y} iconColor={yc} iconLabel="TX" title="UART Bus Map" sub="All 6 BCM2711 UARTs"
            rows={[["UART0","GPIO14/15 (ALT0) — PL011",{color:"var(--yellow)"}],["UART1","GPIO14/15 (ALT5) — mini"],["UART2","GPIO0/1 (ALT4)"],["UART3","GPIO4/5 (ALT4)"],["UART4","GPIO8/9 (ALT4)"],["UART5","GPIO12/13/14/15 (ALT4)"]]}>
            <div className="cc-body">
              <WiringBlock title="Disable console (required for device use)">
                sudo raspi-config → Interface → Serial Port<br/>
                Login shell: <strong>No</strong> · Hardware port: <strong>Yes</strong>
              </WiringBlock>
            </div>
          </CommsCard>

          <CommsCard iconBg={y} iconColor={yc} iconLabel="TX" title="Loopback Test" sub="Verify UART hardware">
            <div className="cc-body">
              <div className="danger-box">⚠ Loopback: bridge Pin 8 (TX) ↔ Pin 10 (RX)</div>
              <WiringBlock title="Python loopback">
                import serial<br/>ser = serial.Serial('/dev/serial0', 9600, timeout=2)<br/>ser.write(b'HELLO')<br/>print(ser.read(5))
              </WiringBlock>
              <div className="cc-row"><span className="cc-label">UART0 device</span><span className="cc-val">/dev/serial0 · /dev/ttyAMA0</span></div>
              <div className="cc-row"><span className="cc-label">UART1 device</span><span className="cc-val">/dev/ttyS0</span></div>
            </div>
          </CommsCard>
        </div>
      </div>
    </div>
  );
}

// ── PWM Section ───────────────────────────────────────────────────────────────
function PWMSection() {
  const ref = useSectionFade();
  const p = "var(--pur-d)", pc = "var(--purple)";
  return (
    <div id="pwm" className="section" style={{paddingTop:0}} ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">PWM &amp; Audio</div>
          <h2 className="section-title">PWM — Pulse Width Modulation</h2>
          <p className="section-sub">2 hardware PWM channels. Multiple GPIO pins route to each via ALT modes.</p>
        </div>
        <div className="comms-grid">
          <CommsCard iconBg={p} iconColor={pc} iconLabel="PWM" title="Hardware PWM Pins" sub="True hardware-timed PWM"
            rows={[["Channels","2 (PWM0, PWM1)"],["Freq range","~1 Hz – 125 MHz"],["Clock source","19.2 MHz oscillator"],["Servo freq","50 Hz (20 ms period)"],["Servo pulse","1000–2000 µs"]]}>
            <div className="cc-pins">
              {[["PWM0","GPIO18 · Pin 12 (ALT5)","Channel 0 ← main"],["PWM0","GPIO12 · Pin 32 (ALT0)","Channel 0 alt"],["PWM1","GPIO13 · Pin 33 (ALT0)","Channel 1"],["PWM1","GPIO19 · Pin 35 (ALT5)","Channel 1 alt"]].map(([n,ph,d],i)=>(
                <div className="cc-pin-row" key={i}><span className="chip ch-pwm cc-pin-name">{n}</span><span className="cc-pin-phys">{ph}</span><span className="cc-pin-desc">{d}</span></div>
              ))}
            </div>
          </CommsCard>

          <CommsCard iconBg="var(--cyn-d)" iconColor="var(--cyan)" iconLabel="PCM" title="PCM / I²S Audio" sub="Digital audio interface"
            rows={[["Protocol","I²S / PCM digital audio"],["Sample rates","8 kHz – 192 kHz"],["Bit depth","Up to 32-bit"],["Enable","dtoverlay=i2s-mmap"]]}>
            <div className="cc-pins">
              {[["PCM_CLK","GPIO18 · Pin 12","Bit clock (ALT0)"],["PCM_FS","GPIO19 · Pin 35","Frame sync (ALT0)"],["PCM_DIN","GPIO20 · Pin 38","Data in (ALT0)"],["PCM_DOUT","GPIO21 · Pin 40","Data out (ALT0)"]].map(([n,ph,d])=>(
                <div className="cc-pin-row" key={n}><span className="chip ch-pcm cc-pin-name">{n}</span><span className="cc-pin-phys">{ph}</span><span className="cc-pin-desc">{d}</span></div>
              ))}
            </div>
          </CommsCard>

          <CommsCard iconBg="var(--gry-d)" iconColor="var(--gray)" iconLabel="CLK" title="General Purpose Clocks" sub="GPCLK0, GPCLK1, GPCLK2"
            rows={[["Sources","Oscillator, PLLA, PLLD, HDMI"],["Use case","Audio MCLK, external ref"]]}>
            <div className="cc-pins">
              {[["GPCLK0","GPIO4 · Pin 7 (ALT0)"],["GPCLK0","GPIO20 · Pin 38 (ALT5)"],["GPCLK1","GPIO5 · Pin 29 (ALT0)"],["GPCLK2","GPIO6 · Pin 31 (ALT0)"]].map(([n,ph],i)=>(
                <div className="cc-pin-row" key={i}><span className="chip ch-clk cc-pin-name">{n}</span><span className="cc-pin-phys">{ph}</span></div>
              ))}
            </div>
          </CommsCard>
        </div>
      </div>
    </div>
  );
}

// ── 1-Wire Section ────────────────────────────────────────────────────────────
function OneWireSection() {
  const ref = useSectionFade();
  const c = "var(--cyn-d)", cc = "var(--cyan)";
  return (
    <div id="onewire" className="section" style={{paddingTop:0}} ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">Temperature Sensing</div>
          <h2 className="section-title">1-Wire — DS18B20 Temperature Sensor</h2>
          <p className="section-sub">Dallas 1-Wire on GPIO4 via kernel driver. Supports multiple sensors on one pin.</p>
        </div>
        <div className="comms-grid">
          <CommsCard iconBg={c} iconColor={cc} iconLabel="1W" title="1-Wire Protocol" sub="Single-wire, parasitic or VCC power"
            rows={[["Default pin","GPIO4 (Pin 7)",{color:"var(--cyan)"}],["Pull-up required","4.7 kΩ to 3.3V (external!)"],["Standard speed","15.4 kbps"],["Overdrive","125 kbps"],["Temp accuracy","±0.5°C (−10°C to +85°C)"],["Resolution","9–12 bit (configurable)"],["Conversion time","750 ms @ 12-bit"],["Multi-sensor","Unique 64-bit ID per device"]]} />

          <CommsCard iconBg={c} iconColor={cc} iconLabel="1W" title="Wiring & Setup" sub="DS18B20 connections">
            <div className="cc-body">
              <WiringBlock title="DS18B20 3-wire wiring">
                VCC → 3.3V (Pin 1)<br/>GND → GND (Pin 6)<br/>DATA → GPIO4 (Pin 7)<br/>4.7kΩ between VCC ↔ DATA
              </WiringBlock>
              <WiringBlock title="Enable & verify" copyText={"# /boot/config.txt:\ndtoverlay=w1-gpio,gpiopin=4\n\n# After reboot:\nls /sys/bus/w1/devices/\ncat /sys/bus/w1/devices/28-*/w1_slave"}>
                <span style={{color:"var(--text3)"}}># /boot/config.txt:</span><br/>
                dtoverlay=w1-gpio,gpiopin=4<br/>ls /sys/bus/w1/devices/<br/>cat /sys/bus/w1/devices/28-*/w1_slave
              </WiringBlock>
            </div>
          </CommsCard>
        </div>
      </div>
    </div>
  );
}

// ── Exported composite ────────────────────────────────────────────────────────
export default function CommsSection() {
  return (
    <>
      <I2CSection />
      <SPISection />
      <UARTSection />
      <PWMSection />
      <OneWireSection />
    </>
  );
}