// components/CodeSnippets.jsx
import React, { useState } from "react";
import { useSectionFade } from "../hooks/useSectionFade";

const SNIPPETS = [
  {
    tag: "GPIO — RPi.GPIO",
    code: `import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Output — blink LED on GPIO18
GPIO.setup(18, GPIO.OUT)
for _ in range(5):
    GPIO.output(18, GPIO.HIGH); time.sleep(0.5)
    GPIO.output(18, GPIO.LOW);  time.sleep(0.5)

# Input with pull-up
GPIO.setup(17, GPIO.IN, pull_up_down=GPIO.PUD_UP)
val = GPIO.input(17)  # 1=HIGH, 0=LOW

# Edge interrupt callback
def on_edge(channel):
    print(f"Rising edge on GPIO{channel}")

GPIO.add_event_detect(17, GPIO.RISING,
    callback=on_edge, bouncetime=200)
GPIO.cleanup()  # always cleanup`,
  },
  {
    tag: "PWM — LED + Servo",
    code: `import RPi.GPIO as GPIO, time
GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)

# Software PWM @ 1kHz (LED fade)
pwm = GPIO.PWM(18, 1000)
pwm.start(0)
for dc in range(0, 101, 5):
    pwm.ChangeDutyCycle(dc); time.sleep(0.04)
pwm.stop()

# Servo @ 50 Hz on GPIO18
servo = GPIO.PWM(18, 50)
servo.start(7.5)       # 90° neutral
time.sleep(1)
servo.ChangeDutyCycle(2.5)   # 0°
time.sleep(1)
servo.ChangeDutyCycle(12.5)  # 180°
time.sleep(1)
servo.stop(); GPIO.cleanup()`,
  },
  {
    tag: "1-Wire — DS18B20",
    code: `import glob, time

# Requires: dtoverlay=w1-gpio in /boot/config.txt
def read_temp(sensor_path):
    with open(f"{sensor_path}/w1_slave") as f:
        lines = f.readlines()
    if 'YES' in lines[0]:
        raw = lines[1].split('t=')[1].strip()
        return float(raw) / 1000.0
    return None

sensors = glob.glob('/sys/bus/w1/devices/28-*')
for s in sensors:
    t = read_temp(s)
    name = s.split('/')[-1]
    print(f"{name}: {t:.3f}°C / {t*9/5+32:.1f}°F")`,
  },
  {
    tag: "gpiozero — Modern API",
    code: `from gpiozero import LED, Button, PWMLED, Servo
from signal import pause

led = LED(18)
led.blink(on_time=0.5, off_time=0.5)

pwm_led = PWMLED(18)
pwm_led.pulse()  # smooth fade in/out

btn = Button(17)
btn.when_pressed  = lambda: print('Pressed!')
btn.when_released = lambda: print('Released!')

servo = Servo(18)
servo.min()  # 0°
servo.mid()  # 90°
servo.max()  # 180°
pause()`,
  },
  {
    tag: "I²C — smbus2",
    code: `import smbus2

bus = smbus2.SMBus(1)  # Bus 1 = Pin 3+5

# Scan all 7-bit addresses
found = []
for addr in range(0x03, 0x78):
    try:
        bus.read_byte(addr)
        found.append(f"0x{addr:02X}")
    except OSError:
        pass
print("Devices:", found)

# MPU-6050 (0x68) — read WHO_AM_I
who = bus.read_byte_data(0x68, 0x75)
print(f"WHO_AM_I = 0x{who:02X}")  # → 0x68
bus.write_byte_data(0x68, 0x6B, 0x00)  # wake
data = bus.read_i2c_block_data(0x68, 0x3B, 6)
ax = (data[0] << 8) | data[1]
bus.close()`,
  },
  {
    tag: "SPI — spidev",
    code: `import spidev

spi = spidev.SpiDev()
spi.open(0, 0)           # bus=0, CE0
spi.max_speed_hz = 500000
spi.mode = 0             # CPOL=0 CPHA=0

# Full-duplex loopback (wire MOSI→MISO)
tx = [0xDE, 0xAD, 0xBE, 0xEF]
rx = spi.xfer2(tx)
print(tx == rx)  # True if loopback wired

# MCP3008 ADC — read channel 0
def read_adc(ch):
    assert 0 <= ch <= 7
    r = spi.xfer2([1, (8+ch) << 4, 0])
    return ((r[1] & 3) << 8) + r[2]

val = read_adc(0)
voltage = val * 3.3 / 1023
print(f"{val} → {voltage:.3f}V")
spi.close()`,
  },
  {
    tag: "UART — pyserial",
    code: `import serial, time
# Disable console first via raspi-config!
ser = serial.Serial(
    port='/dev/serial0',
    baudrate=9600,
    bytesize=serial.EIGHTBITS,
    parity=serial.PARITY_NONE,
    stopbits=serial.STOPBITS_ONE,
    timeout=2
)
ser.write(b'Hello RPi!')
time.sleep(0.05)
print(ser.read(10))
# Non-blocking read loop
ser.timeout = 0
while True:
    if ser.in_waiting:
        line = ser.readline().decode('utf-8', errors='ignore')
        print(line.strip())
    time.sleep(0.01)
ser.close()`,
  },
  {
    tag: "Hardware PWM — pigpio",
    code: `import pigpio, time
# sudo pigpiod  (start daemon first)
pi = pigpio.pi()

# HW PWM on GPIO18 — 50Hz neutral servo
pi.hardware_PWM(18, 50, 75000)   # 7.5%
time.sleep(1)
pi.hardware_PWM(18, 50, 50000)   # 0°
time.sleep(1)
pi.hardware_PWM(18, 50, 100000)  # 180°
time.sleep(1)
pi.hardware_PWM(18, 0, 0)  # off
pi.stop()`,
  },
];

function CodeBlock({ tag, code }) {
  const [copied, setCopied] = useState(false);
  function doCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }
  return (
    <div>
      <div className="code-tag">{tag}</div>
      <div className="code-block">
        <button className={`code-copy${copied ? " copied" : ""}`} onClick={doCopy}>
          {copied ? "copied!" : "copy"}
        </button>
        <pre>{code}</pre>
      </div>
    </div>
  );
}

export default function CodeSnippets() {
  const ref = useSectionFade();
  const left  = SNIPPETS.slice(0, 4);
  const right = SNIPPETS.slice(4);

  return (
    <div id="code" className="section" ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">Python Code Examples</div>
          <h2 className="section-title">Code Snippets</h2>
          <p className="section-sub">RPi.GPIO · smbus2 · spidev · pyserial · gpiozero · pigpio — click copy on any block</p>
        </div>
        <div className="grid2">
          <div>{left.map(s  => <CodeBlock key={s.tag} {...s} />)}</div>
          <div>{right.map(s => <CodeBlock key={s.tag} {...s} />)}</div>
        </div>
      </div>
    </div>
  );
}