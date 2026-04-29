// components/Topbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { PINS, TYPES } from "../data/pins";
import { copyToClipboard } from "../utils/helpers";

const NAV_LINKS = [
  { href: "#pinmap",   icon: "📍", label: "Map"       },
  { href: "#visual",   icon: "🎨", label: "Visual"    },
  { href: "#altfn",    icon: "⚙️",  label: "Alt Fn"   },
  { href: "#pulls",    icon: "🔌", label: "Pulls"     },
  { href: "#i2c",      icon: "🔗", label: "I²C"       },
  { href: "#spi",      icon: "📡", label: "SPI"       },
  { href: "#uart",     icon: "💬", label: "UART"      },
  { href: "#pwm",      icon: "〰️", label: "PWM"       },
  { href: "#onewire",  icon: "🌡️", label: "1-Wire"    },
  { href: "#planner",  icon: "🗺️", label: "Planner"   },
  { href: "#tools",    icon: "🛠️", label: "Tools"     },
  { href: "#periph",   icon: "🔧", label: "Periph"    },
  { href: "#code",     icon: "🐍", label: "Code"      },
  { href: "#quickref", icon: "📋", label: "Quick Ref" },
];

export default function Topbar({ dark, onToggleTheme, onPinSelect, toast }) {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState([]);
  const [active,   setActive]   = useState("#pinmap");
  const inputRef  = useRef(null);
  const dropRef   = useRef(null);

  // keyboard shortcut /
  useEffect(() => {
    const handler = e => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (!dropRef.current?.contains(e.target)) setResults([]); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // IntersectionObserver for active nav link
  useEffect(() => {
    const links  = document.querySelectorAll(".nav-link");
    const obs    = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setActive("#" + e.target.id);
      }),
      { rootMargin: "-15% 0px -75% 0px" }
    );
    document.querySelectorAll("[id]").forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  function doSearch(q) {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const ql = q.toLowerCase();
    setResults(
      PINS.filter(p => {
        const hay = (
          p[2] + " " + p[4] + " " + p[3] + " " +
          (p[1] !== null ? "gpio" + p[1] + " bcm" + p[1] + " " + p[1] : "") +
          " pin" + p[0] + " " + Object.values(p[5]).join(" ")
        ).toLowerCase();
        return hay.includes(ql);
      }).slice(0, 10)
    );
  }

  function handleResultClick(pin) {
    setResults([]);
    setQuery("");
    document.getElementById("pinmap")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => onPinSelect(PINS.indexOf(pin)), 350);
  }

  function exportJSON() {
    const json = JSON.stringify(
      PINS.map(([phys, bcm, label, type, desc, alts]) => ({ phys, bcm, label, type, desc, alts })),
      null, 2
    );
    copyToClipboard(json).then(() => toast("Pinout JSON copied!"));
  }

  return (
    <div className="topbar">
      <div className="topbar-inner">
        {/* Search */}
        <div className="search-wrap" ref={dropRef}>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Search pins, GPIOs, functions… (press /)"
            value={query}
            onChange={e => doSearch(e.target.value)}
            onKeyDown={e => e.key === "Escape" && (setResults([]), inputRef.current.blur())}
          />
          {query && (
            <span className="search-clear" onClick={() => { setQuery(""); setResults([]); }}>✕</span>
          )}
          {results.length > 0 && (
            <div className="search-dropdown">
              {results.map((p, i) => (
                <div key={i} className="srd-item" onClick={() => handleResultClick(p)}>
                  <div className="srd-pin-num" style={{ background: TYPES[p[3]]?.dot || "#888" }}>{p[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="srd-label">
                      {p[2]}{p[1] !== null && <span style={{ color: "var(--text3)", fontSize: 10 }}> · BCM{p[1]}</span>}
                    </div>
                    <div className="srd-desc">{p[4]}</div>
                  </div>
                  <span style={{ fontSize: 9, color: "var(--text3)" }}>{p[3]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="nav-links">
          {NAV_LINKS.map(({ href, icon, label }) => (
            <a
              key={href}
              className={`nav-link${active === href ? " active" : ""}`}
              href={href}
              onClick={() => setActive(href)}
            >
              <span className="nav-icon">{icon}</span>{label}
            </a>
          ))}
        </nav>

        {/* Controls */}
        <div className="topbar-controls">
          <button className="ctrl-btn" onClick={onToggleTheme} title="Toggle light/dark">
            {dark ? "☀️" : "🌙"}
          </button>
          <button className="ctrl-btn" onClick={() => window.print()} title="Print">🖨️</button>
          <button className="ctrl-btn" onClick={exportJSON} title="Copy pinout JSON">{"{ }"}</button>
        </div>
      </div>
    </div>
  );
}