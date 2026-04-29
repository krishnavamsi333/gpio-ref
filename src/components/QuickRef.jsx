// components/QuickRef.jsx
import React from "react";
import { QUICK_REF } from "../data/pins";
import { useSectionFade } from "../hooks/useSectionFade";

export default function QuickRef() {
  const ref = useSectionFade();
  return (
    <div id="quickref" className="section" ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">At a Glance</div>
          <h2 className="section-title">Quick Reference</h2>
          <p className="section-sub">Essential pins, commands, packages and safety limits</p>
        </div>
        <div className="qref-grid">
          {QUICK_REF.map(({ title, rows }) => (
            <div key={title} className="qref-card">
              <div className="qref-title">{title}</div>
              {rows.map(([k, v, style]) => (
                <div key={k} className="qref-row">
                  <span className="qref-key">{k}</span>
                  <span className="qref-val" style={style}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}