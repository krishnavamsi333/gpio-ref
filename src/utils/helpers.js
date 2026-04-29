// ─── CHIP CLASS ──────────────────────────────────────────────────────────────
export function chipClass(fn) {
  if (!fn) return "ch-none";
  const u = fn.toUpperCase();
  if (u.includes("TXD") || u.includes("RXD") || u.includes("CTS") || u.includes("RTS")) return "ch-uart";
  if (u.includes("SPI")) return "ch-spi";
  if (u.includes("SDA") || u.includes("SCL")) return "ch-i2c";
  if (u.includes("PWM")) return "ch-pwm";
  if (u.includes("PCM") || u.includes("GPCLK") || u.includes("PCLK")) return "ch-pcm";
  if (u.includes("ARM")) return "ch-jtag";
  if (u.includes("CLK")) return "ch-clk";
  return "ch-dpi";
}

// ─── NEAREST E24 RESISTOR ─────────────────────────────────────────────────────
export function nearestE24(v) {
  const e24 = [1,1.1,1.2,1.3,1.5,1.6,1.8,2,2.2,2.4,2.7,3,3.3,3.6,3.9,4.3,4.7,5.1,5.6,6.2,6.8,7.5,8.2,9.1];
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  let best = e24[0], bd = Math.abs(n - e24[0]);
  e24.forEach(r => { const d = Math.abs(n - r); if (d < bd) { bd = d; best = r; } });
  return Math.round(best * mag);
}

// ─── CLIPBOARD COPY ───────────────────────────────────────────────────────────
export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

// ─── PLANNER: ALT LABEL PARSER ───────────────────────────────────────────────
export function parseAltLabel(raw) {
  if (!raw || raw === "—") return null;
  const u = raw.toUpperCase();
  if (u.includes("SDA"))                        return { fn: "I2C SDA",  label: raw, cls: "ch-i2c"  };
  if (u.includes("SCL"))                        return { fn: "I2C SCL",  label: raw, cls: "ch-i2c"  };
  if (u.includes("TXD") || u.includes("TX"))    return { fn: "UART TX",  label: raw, cls: "ch-uart" };
  if (u.includes("RXD") || u.includes("RX"))    return { fn: "UART RX",  label: raw, cls: "ch-uart" };
  if (u.includes("CTS"))                        return { fn: "UART CTS", label: raw, cls: "ch-uart" };
  if (u.includes("RTS"))                        return { fn: "UART RTS", label: raw, cls: "ch-uart" };
  if (u.includes("MOSI"))                       return { fn: "SPI MOSI", label: raw, cls: "ch-spi"  };
  if (u.includes("MISO"))                       return { fn: "SPI MISO", label: raw, cls: "ch-spi"  };
  if (u.includes("SCLK") || u.includes("SCK")) return { fn: "SPI SCLK", label: raw, cls: "ch-spi"  };
  if (u.includes("CE") && u.includes("N"))      return { fn: "SPI CE",   label: raw, cls: "ch-spi"  };
  if (u.includes("PWM"))                        return { fn: "PWM",      label: raw, cls: "ch-pwm"  };
  if (u.includes("PCM"))                        return { fn: "PCM/I2S",  label: raw, cls: "ch-pcm"  };
  if (u.includes("GPCLK") || u.includes("CLK")) return { fn: "GPCLK",   label: raw, cls: "ch-clk"  };
  if (u.includes("ARM") || u.includes("JTAG")) return { fn: "JTAG",     label: raw, cls: "ch-jtag" };
  return { fn: raw, label: raw, cls: "ch-dpi" };
}

// ─── PLANNER: CONFLICT DETECTION ─────────────────────────────────────────────
export function resourceKey(bcm, fn) {
  const f = fn.toUpperCase();
  if (f.includes("UART")) {
    if (bcm === 14 || bcm === 15) return "UART:0_1";
    if (bcm === 0  || bcm === 1 ) return "UART:2";
    if (bcm === 4  || bcm === 5 ) return "UART:3";
    if (bcm === 8  || bcm === 9 ) return "UART:4";
    if (bcm >= 12  && bcm <= 15 ) return "UART:5";
    return "UART:" + bcm;
  }
  if (f.includes("I2C") || f.includes("SDA") || f.includes("SCL")) {
    if (bcm === 2 || bcm === 3)                       return "I2C:1";
    if (bcm === 4 || bcm === 5)                       return "I2C:3";
    if (bcm === 7 || bcm === 8 || bcm === 9)          return "I2C:4";
    if (bcm >= 10 && bcm <= 13)                       return "I2C:5";
    if ([0,1,22,23].includes(bcm))                    return "I2C:6";
    return "I2C:" + bcm;
  }
  if (f.includes("SPI")) {
    if (bcm >= 7  && bcm <= 11) return "SPI:0";
    if (bcm >= 16 && bcm <= 21) return "SPI:1";
    if (bcm >= 0  && bcm <= 4 ) return "SPI:3";
    if (bcm >= 4  && bcm <= 8 ) return "SPI:4";
    if (bcm >= 12 && bcm <= 16) return "SPI:5";
    if (bcm >= 18 && bcm <= 21) return "SPI:6";
    return "SPI:" + bcm;
  }
  if (f === "PWM") {
    if (bcm === 12 || bcm === 18) return "PWM:0";
    if (bcm === 13 || bcm === 19) return "PWM:1";
    return "PWM:" + bcm;
  }
  if (f === "1-WIRE") return "1WIRE:" + bcm;
  return null; // standalone fns never conflict
}

export function busRole(fn) {
  const f = fn.toUpperCase();
  if (f.includes("UART TX") || f.includes("TXD"))  return "TX";
  if (f.includes("UART RX") || f.includes("RXD"))  return "RX";
  if (f.includes("CTS"))  return "CTS";
  if (f.includes("RTS"))  return "RTS";
  if (f.includes("SDA"))  return "SDA";
  if (f.includes("SCL"))  return "SCL";
  if (f.includes("MOSI")) return "MOSI";
  if (f.includes("MISO")) return "MISO";
  if (f.includes("SCLK") || f.includes("SCK")) return "SCLK";
  if (f.includes("CE") && f.includes("N"))      return "CE"; // CEs OK to share
  if (f === "PWM")    return "PWM";
  if (f === "1-WIRE") return "1W";
  return f;
}

// ─── CONFIG.TXT GENERATOR ─────────────────────────────────────────────────────
// UART mapping: BCM pin → UART number + overlay name
const UART_MAP = {
  14: { num: 0, overlay: "uart0",  tx: 14, rx: 15 },
  15: { num: 0, overlay: "uart0",  tx: 14, rx: 15 },
  0:  { num: 2, overlay: "uart2",  tx: 0,  rx: 1  },
  1:  { num: 2, overlay: "uart2",  tx: 0,  rx: 1  },
  4:  { num: 3, overlay: "uart3",  tx: 4,  rx: 5  },
  5:  { num: 3, overlay: "uart3",  tx: 4,  rx: 5  },
  8:  { num: 4, overlay: "uart4",  tx: 8,  rx: 9  },
  9:  { num: 4, overlay: "uart4",  tx: 8,  rx: 9  },
  12: { num: 5, overlay: "uart5",  tx: 12, rx: 13 },
  13: { num: 5, overlay: "uart5",  tx: 12, rx: 13 },
};

// SPI mapping: BCM pin → SPI bus
const SPI_BUS_MAP = {
  10: 0, 9: 0, 11: 0, 8: 0, 7: 0,   // SPI0
  20: 1, 19: 1, 21: 1, 16: 1,        // SPI1
};

// I2C mapping: BCM pin → I2C bus
const I2C_BUS_MAP = {
  2: 1, 3: 1,   // I2C1 (header)
  0: 0, 1: 0,   // I2C0 (EEPROM / i2c_vc)
};

export function generateConfigTxt(assignments, PINS) {
  const used = {
    i2c1: false, i2c0: false,
    spi0: false, spi1: false,
    uarts: new Set(),
    onewire: false, onewire_pin: 4,
    pwm: [], // array of {pin, func}
    i2s: false,
    can: false,
    gpio_out: [], gpio_in: [],
  };

  const pinAssignments = [];

  Object.entries(assignments).forEach(([pin, { fn, label }]) => {
    const p = PINS.find(x => x[0] === Number(pin));
    if (!p) return;
    const bcm = p[1];
    const f   = fn.toUpperCase();
    pinAssignments.push({ pin: Number(pin), bcm, label: label || fn });

    if (f.includes("I2C") || f.includes("SDA") || f.includes("SCL")) {
      const bus = I2C_BUS_MAP[bcm];
      if (bus === 0) used.i2c0 = true;
      else           used.i2c1 = true;
    }
    if (f.includes("SPI") || f.includes("MOSI") || f.includes("MISO") || f.includes("SCLK") || f.includes("SPI CE")) {
      const bus = SPI_BUS_MAP[bcm];
      if (bus === 1) used.spi1 = true;
      else           used.spi0 = true;
    }
    if (f.includes("UART") || f.includes("TXD") || f.includes("RXD")) {
      const u = UART_MAP[bcm];
      if (u) used.uarts.add(JSON.stringify(u));
    }
    if (f === "1-WIRE")  { used.onewire = true; used.onewire_pin = bcm ?? 4; }
    if (f.includes("PCM") || f.includes("I2S")) used.i2s = true;
    if (f === "PWM" || (f.includes("PWM") && !f.includes("SPI"))) {
      // func=2 for ALT5 (GPIO18/19), func=4 for ALT0 (GPIO12/13)
      const func = (bcm === 18 || bcm === 19) ? 2 : 4;
      used.pwm.push({ pin: bcm, func });
    }
    if (f === "GPIO OUTPUT") used.gpio_out.push(bcm);
    if (f === "GPIO INPUT")  used.gpio_in.push(bcm);
  });

  const L = [];  // output lines

  L.push("# ╔══════════════════════════════════════════════════════╗");
  L.push("# ║   /boot/firmware/config.txt  (Bookworm)             ║");
  L.push("# ║   /boot/config.txt           (Bullseye and older)   ║");
  L.push("# ║   Generated by RPi4 GPIO Planner                    ║");
  L.push("# ╚══════════════════════════════════════════════════════╝");
  L.push("");

  // ── Pin summary ──
  if (pinAssignments.length > 0) {
    L.push("# ── Pin assignment summary ──────────────────────────────");
    pinAssignments.forEach(({ pin, bcm, label }) => {
      L.push(`#   Pin ${String(pin).padStart(2)}  BCM ${bcm !== null ? String(bcm).padStart(2) : "--"}  →  ${label}`);
    });
    L.push("");
  }

  // ── Already in your config (reference) ──
  L.push("# ── Already present in your config.txt (keep these) ────");
  L.push("# dtparam=audio=on");
  L.push("# camera_auto_detect=1");
  L.push("# display_auto_detect=1");
  L.push("# dtoverlay=vc4-kms-v3d");
  L.push("# arm_64bit=1");
  L.push("# arm_boost=1");
  L.push("");

  // ── New lines to ADD ──
  L.push("# ── ADD these lines to your [all] section ───────────────");
  let hasNew = false;

  // I2C1 (header pins 3+5)
  if (used.i2c1) {
    hasNew = true;
    L.push("");
    L.push("# I²C1 — header pins SDA=Pin3(BCM2) SCL=Pin5(BCM3)");
    L.push("dtparam=i2c_arm=on");
    L.push("dtparam=i2c_arm_baudrate=400000");
    L.push("# Scan:  i2cdetect -y 1");
  }

  // I2C0 (BCM0/1 — also matches dtparam=i2c_vc=on in your config)
  if (used.i2c0) {
    hasNew = true;
    L.push("");
    L.push("# I²C0 — BCM0/BCM1 (also used by HAT EEPROM)");
    L.push("dtparam=i2c_vc=on");
    L.push("dtoverlay=i2c0");
    L.push("dtparam=i2c0_baudrate=400000");
    L.push("# Scan:  i2cdetect -y 0");
  }

  // SPI0
  if (used.spi0) {
    hasNew = true;
    L.push("");
    L.push("# SPI0 — MOSI=BCM10(P19) MISO=BCM9(P21) SCLK=BCM11(P23) CE0=BCM8(P24) CE1=BCM7(P26)");
    L.push("dtparam=spi=on");
    L.push("# Test: ls /dev/spidev0.*");
  }

  // SPI1
  if (used.spi1) {
    hasNew = true;
    L.push("");
    L.push("# SPI1 — auxiliary SPI (BCM19/20/21 + CE pins)");
    L.push("dtparam=spi=on");
    L.push("dtoverlay=spi1-1cs          # 1 chip-select  (change to spi1-2cs / spi1-3cs as needed)");
    L.push("# For CAN on SPI1 (like your existing config):");
    L.push("# dtoverlay=spi1-2cs,cs0_pin=17,cs1_pin=16");
    L.push("# dtoverlay=mcp2515,spi1-0,oscillator=16000000,interrupt=22");
    L.push("# dtoverlay=mcp2515,spi1-1,oscillator=16000000,interrupt=13");
  }

  // UARTs
  if (used.uarts.size > 0) {
    hasNew = true;
    L.push("");
    L.push("# UART — serial interfaces");
    L.push("enable_uart=1");
    [...used.uarts].forEach(u => {
      const { num, overlay, tx, rx } = JSON.parse(u);
      L.push(`dtoverlay=${overlay}         # UART${num}: TX=BCM${tx} RX=BCM${rx}  → /dev/ttyAMA${num === 0 ? 0 : num - 1}`);
    });
    L.push("# To free UART0 from Bluetooth:");
    L.push("# dtoverlay=disable-bt");
    L.push("# Disable serial console first: raspi-config → Interface → Serial Port → No shell / Yes port");
  }

  // 1-Wire
  if (used.onewire) {
    hasNew = true;
    L.push("");
    L.push(`# 1-Wire — DS18B20 on BCM${used.onewire_pin} (Pin ${PINS.find(p => p[1] === used.onewire_pin)?.[0] ?? "?"})"`);
    L.push(`dtoverlay=w1-gpio,gpiopin=${used.onewire_pin}`);
    L.push("# Read: cat /sys/bus/w1/devices/28-*/w1_slave");
    L.push("# NOTE: Add external 4.7kΩ pull-up resistor between DATA and 3.3V");
  }

  // PWM
  if (used.pwm.length > 0) {
    hasNew = true;
    L.push("");
    used.pwm.forEach(({ pin, func }) => {
      L.push(`# Hardware PWM — BCM${pin}`);
      L.push(`dtoverlay=pwm,pin=${pin},func=${func}`);
      L.push("# Two channels: dtoverlay=pwm-2chan,pin=18,func=2,pin2=19,func2=2");
    });
    L.push("# Library: pip install pigpio  →  sudo pigpiod");
  }

  // I2S
  if (used.i2s) {
    hasNew = true;
    L.push("");
    L.push("# I²S / PCM audio — BCM18(CLK) BCM19(FS) BCM20(DIN) BCM21(DOUT)");
    L.push("dtoverlay=i2s-mmap");
  }

  // Plain GPIO (no overlay needed)
  if (used.gpio_out.length > 0 || used.gpio_in.length > 0) {
    L.push("");
    L.push("# Standard GPIO pins — no config.txt changes needed");
    if (used.gpio_out.length > 0) L.push(`# GPIO Output: BCM ${used.gpio_out.join(", ")}`);
    if (used.gpio_in.length  > 0) L.push(`# GPIO Input:  BCM ${used.gpio_in.join(", ")}`);
    L.push("# Control via: RPi.GPIO / gpiozero / pigpio");
  }

  if (!hasNew && used.gpio_out.length === 0 && used.gpio_in.length === 0) {
    L.push("# No interfaces assigned yet — assign pins in the planner above");
  }

  // ── Reference block for YOUR existing config ──
  L.push("");
  L.push("# ─────────────────────────────────────────────────────────");
  L.push("# REFERENCE: Your existing config.txt lines (already active)");
  L.push("# ─────────────────────────────────────────────────────────");
  L.push("# dtparam=spi=on");
  L.push("# dtparam=i2c_arm=on");
  L.push("# enable_uart=1");
  L.push("# dtoverlay=uart0");
  L.push("# dtoverlay=uart3                          # TX=BCM4 RX=BCM5");
  L.push("# dtoverlay=uart4                          # TX=BCM8 RX=BCM9");
  L.push("# dtoverlay=spi1-2cs,cs0_pin=17,cs1_pin=16");
  L.push("# dtoverlay=mcp2515,spi1-0,oscillator=16000000,interrupt=22  # CAN0");
  L.push("# dtoverlay=mcp2515,spi1-1,oscillator=16000000,interrupt=13  # CAN1");
  L.push("# dtparam=i2c_vc=on");
  L.push("# dtoverlay=i2c0");
  L.push("# dtparam=i2c_arm_baudrate=400000");
  L.push("# dtparam=i2c0_baudrate=400000");

  return L.join("\n");
}

export function getConflictingPins(assignments, PINS) {
  const rmap = {};
  Object.entries(assignments).forEach(([pin, { fn }]) => {
    const p = PINS.find(x => x[0] === Number(pin));
    if (!p || p[1] === null) return;
    const rk = resourceKey(p[1], fn);
    if (!rk) return;
    const role    = busRole(fn);
    const roleKey = role === "CE" ? "CE_" + p[0] : role;
    const fullKey = rk + ":" + roleKey;
    if (!rmap[fullKey]) rmap[fullKey] = [];
    rmap[fullKey].push(Number(pin));
  });

  const conflictPins   = new Set();
  const conflictGroups = [];
  Object.entries(rmap).forEach(([fullKey, pins]) => {
    if (pins.length > 1) {
      pins.forEach(p => conflictPins.add(p));
      const parts      = fullKey.split(":");
      const busDisplay = parts.slice(0, -1).join(" Bus ");
      const roleDisplay = parts[parts.length - 1];
      conflictGroups.push({ busDisplay, roleDisplay, pins });
    }
  });
  return { conflictPins, conflictGroups };
}