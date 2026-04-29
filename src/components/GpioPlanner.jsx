// components/GpioPlanner.jsx
// Improvements: Python generator, setup.sh, save/load layouts,
// config conflict detection, pin filter/search, theme persistence,
// wiring diagram, voltage helper, I2C scan helper, mobile drawer
import React, { useState, useCallback, useMemo } from "react";
import { PINS } from "../data/pins";
import {
  parseAltLabel, getConflictingPins,
  copyToClipboard, generateConfigTxt,
} from "../utils/helpers";
import { generatePythonCode, generateSetupSh } from "../utils/pythonGenerator";
import { useSectionFade } from "../hooks/useSectionFade";
import { useLocalStorage } from "../hooks/useLocalStorage";

const GENERAL_FNS = [
  { fn: "GPIO Output", label: "GPIO Output", cls: "ch-none" },
  { fn: "GPIO Input",  label: "GPIO Input",  cls: "ch-none" },
  { fn: "LED",         label: "LED Output",  cls: "ch-none" },
  { fn: "Button",      label: "Button Input",cls: "ch-none" },
  { fn: "Sensor",      label: "Sensor Input",cls: "ch-none" },
  { fn: "1-Wire",      label: "1-Wire",      cls: "ch-pcm"  },
  { fn: "PWM",         label: "PWM (software)", cls: "ch-pwm" },
  { fn: "Custom",      label: "Custom",      cls: "ch-none" },
];
const ALT_MODES  = ["ALT0","ALT1","ALT2","ALT3","ALT4","ALT5"];
const TAB_LABELS = ["Config.txt","Python","Setup.sh","Wiring"];

const EXISTING_ACTIVE = {
  4:"uart3",5:"uart3",8:"uart4",9:"uart4",
  14:"uart0",15:"uart0",
  19:"SPI1/CAN",20:"SPI1/CAN",21:"SPI1/CAN",
  16:"SPI1 CE2",17:"SPI1 CS0",
  22:"CAN IRQ",13:"CAN IRQ",
};

const PROTO_COLORS = {
  "I2C":"#22c55e","SPI":"#f97316","UART":"#eab308",
  "1-Wire":"#22d3ee","PWM":"#a855f7","LED":"#ef4444",
  "Button":"#3b82f6","GPIO":"#64748b",
};

function buildWiringDiagram(assignments) {
  const protocols = {};
  Object.entries(assignments).forEach(([pin,{fn,label}]) => {
    const p = PINS.find(x=>x[0]===Number(pin));
    if(!p||p[1]===null)return;
    const f=fn.toUpperCase();
    let proto="GPIO";
    if(f.includes("I2C")||f.includes("SDA")||f.includes("SCL"))proto="I2C";
    else if(f.includes("SPI")||f.includes("MOSI")||f.includes("MISO"))proto="SPI";
    else if(f.includes("UART")||f.includes("TXD")||f.includes("RXD"))proto="UART";
    else if(f==="1-WIRE")proto="1-Wire";
    else if(f.includes("PWM"))proto="PWM";
    else if(f==="LED")proto="LED";
    else if(f==="BUTTON")proto="Button";
    if(!protocols[proto])protocols[proto]=[];
    protocols[proto].push({pin:Number(pin),bcm:p[1],label});
  });
  return protocols;
}

function VoltageHelper({bcm}){
  const [v,setV]=useState("3.3");
  const needs=v==="5";
  return(
    <div style={{marginTop:8,padding:"8px 10px",background:"var(--bg3)",borderRadius:6,border:"1px solid var(--border2)",fontSize:9}}>
      <div style={{fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:"var(--text3)",marginBottom:5}}>Voltage — BCM{bcm}</div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
        <span style={{color:"var(--text2)"}}>Sensor:</span>
        {["3.3","5"].map(val=>(
          <button key={val} onClick={()=>setV(val)} style={{padding:"2px 8px",borderRadius:4,cursor:"pointer",fontSize:9,fontWeight:600,border:`1px solid ${v===val?"var(--blue)":"var(--border2)"}`,background:v===val?"var(--blu-d)":"var(--bg4)",color:v===val?"var(--blue)":"var(--text3)"}}>
            {val}V
          </button>
        ))}
      </div>
      {needs?(
        <div style={{color:"var(--yellow)",lineHeight:1.8}}>
          ⚠ 5V sensor needs level-shifter<br/>
          <strong style={{color:"var(--text)"}}>Divider: R1=1kΩ + R2=2kΩ</strong><br/>
          <span style={{color:"var(--text3)"}}>Or use BSS138 / TXS0108E</span>
        </div>
      ):(
        <div style={{color:"var(--green)"}}>✓ 3.3V — direct connection safe</div>
      )}
    </div>
  );
}

function OutputTabs({assignments,toast}){
  const [tab,setTab]=useState(0);
  const hasAny=Object.keys(assignments).length>0;
  const configTxt=useMemo(()=>generateConfigTxt(assignments,PINS),[assignments]);
  const pythonCode=useMemo(()=>generatePythonCode(assignments,PINS),[assignments]);
  const setupSh=useMemo(()=>generateSetupSh(assignments,PINS),[assignments]);
  const wiring=useMemo(()=>buildWiringDiagram(assignments),[assignments]);

  function copyTab(){
    const texts=[configTxt,pythonCode,setupSh,""];
    if(tab===3)return;
    copyToClipboard(texts[tab]).then(()=>toast(TAB_LABELS[tab]+" copied!"));
  }

  return(
    <div style={{marginTop:14}}>
      <div style={{display:"flex",gap:3,marginBottom:8,flexWrap:"wrap"}}>
        {TAB_LABELS.map((lbl,i)=>(
          <button key={lbl} onClick={()=>setTab(i)} style={{padding:"3px 8px",borderRadius:4,cursor:"pointer",fontSize:9,fontWeight:700,border:`1px solid ${tab===i?"var(--blue)":"var(--border2)"}`,background:tab===i?"var(--blu-d)":"var(--bg3)",color:tab===i?"var(--blue)":"var(--text3)"}}>
            {lbl}
          </button>
        ))}
        {tab!==3&&hasAny&&(
          <button onClick={copyTab} style={{marginLeft:"auto",padding:"3px 8px",borderRadius:4,cursor:"pointer",fontSize:9,fontWeight:700,border:"1px solid var(--border2)",background:"var(--bg4)",color:"var(--text3)"}}>
            Copy
          </button>
        )}
      </div>

      {!hasAny?(
        <div style={{fontSize:9,color:"var(--text4)",padding:"8px 0"}}>Assign pins to generate output</div>
      ):tab===3?(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {Object.entries(wiring).map(([proto,pins])=>(
            <div key={proto} style={{padding:"8px 10px",borderRadius:6,border:`1px solid ${PROTO_COLORS[proto]}30`,background:"var(--bg3)"}}>
              <div style={{fontSize:9,fontWeight:700,color:PROTO_COLORS[proto],marginBottom:5,textTransform:"uppercase",letterSpacing:".1em"}}>{proto}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {pins.map(({pin,bcm,label})=>(
                  <div key={pin} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:20,background:PROTO_COLORS[proto]+"20",border:`1px solid ${PROTO_COLORS[proto]}40`,fontSize:9}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:PROTO_COLORS[proto],flexShrink:0}}/>
                    <span style={{fontWeight:700,color:"var(--text)"}}>P{pin}</span>
                    <span style={{color:"var(--text3)"}}>BCM{bcm}</span>
                    <span style={{color:PROTO_COLORS[proto],maxWidth:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>
                  </div>
                ))}
              </div>
              {proto==="I2C"&&<div style={{marginTop:5,fontSize:8,color:"var(--text3)",fontFamily:"'JetBrains Mono',monospace"}}>$ i2cdetect -y 1</div>}
              {proto==="SPI"&&<div style={{marginTop:5,fontSize:8,color:"var(--text3)",fontFamily:"'JetBrains Mono',monospace"}}>$ ls /dev/spidev*</div>}
            </div>
          ))}
          <div style={{marginTop:4}}>
            <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"var(--text3)",marginBottom:5}}>40-Pin Header</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(20,14px)",gap:2}}>
              {Array.from({length:40},(_,i)=>{
                const physPin=i+1;
                const asgn=assignments[physPin];
                const p=PINS.find(x=>x[0]===physPin);
                const wd=asgn?buildWiringDiagram({[physPin]:asgn}):{};
                const proto=Object.keys(wd)[0];
                const color=asgn?(PROTO_COLORS[proto]??"#64748b"):p?.[3]==="GND"?"#374151":p?.[3]==="PWR33"?"#ef444430":p?.[3]==="PWR5"?"#f9731630":"var(--bg5)";
                return(
                  <div key={physPin} title={`P${physPin}${p?" "+p[2]:""}${asgn?" → "+asgn.label:""}`} style={{width:14,height:14,borderRadius:"50%",background:color,border:asgn?`2px solid ${color}`:"1px solid var(--border2)",boxShadow:asgn?`0 0 5px ${color}80`:"none"}}/>
                );
              })}
            </div>
            <div style={{fontSize:7,color:"var(--text4)",marginTop:3}}>Pins 1–40. Glowing = assigned.</div>
          </div>
        </div>
      ):(
        <pre style={{background:"#0d111e",border:"1px solid rgba(255,255,255,.07)",borderRadius:6,padding:"10px 12px",fontSize:9,color:"#b8d0f0",lineHeight:1.85,whiteSpace:"pre-wrap",wordBreak:"break-word",margin:0,maxHeight:280,overflowY:"auto",fontFamily:"'JetBrains Mono',monospace"}}>
          {[configTxt,pythonCode,setupSh][tab]}
        </pre>
      )}
    </div>
  );
}

function SaveLoadPanel({assignments,onLoad,toast}){
  const [layouts,setLayouts]=useLocalStorage("gpio-layouts",{});
  const [name,setName]=useState("");
  const [open,setOpen]=useState(false);

  function save(){
    if(!name.trim())return;
    setLayouts(prev=>({...prev,[name.trim()]:{assignments,savedAt:new Date().toLocaleString()}}));
    setName(""); toast(`Layout "${name.trim()}" saved!`);
  }
  function load(key){ onLoad(layouts[key].assignments); toast(`Layout "${key}" loaded!`); setOpen(false); }
  function remove(key){ setLayouts(prev=>{const n={...prev};delete n[key];return n;}); toast(`Deleted "${key}"`); }

  return(
    <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"var(--text3)"}}>Saved Layouts</div>
        <button onClick={()=>setOpen(o=>!o)} style={{fontSize:8,padding:"2px 7px",borderRadius:4,cursor:"pointer",border:"1px solid var(--border2)",background:"var(--bg3)",color:"var(--text3)"}}>
          {open?"▲":"▼"} ({Object.keys(layouts).length})
        </button>
      </div>
      <div style={{display:"flex",gap:4}}>
        <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}
          placeholder="Layout name…" style={{flex:1,padding:"4px 8px",borderRadius:4,fontSize:9,border:"1px solid var(--border2)",background:"var(--bg3)",color:"var(--text)",fontFamily:"'JetBrains Mono',monospace",outline:"none"}}/>
        <button onClick={save} disabled={!name.trim()||!Object.keys(assignments).length}
          style={{padding:"4px 9px",borderRadius:4,cursor:"pointer",fontSize:9,fontWeight:700,border:"1px solid var(--grn-b)",background:"var(--grn-d)",color:"var(--green)",opacity:!name.trim()||!Object.keys(assignments).length?0.4:1}}>
          Save
        </button>
      </div>
      {open&&(
        <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:3}}>
          {Object.entries(layouts).length===0&&<div style={{fontSize:9,color:"var(--text4)"}}>No saved layouts</div>}
          {Object.entries(layouts).map(([key,{savedAt}])=>(
            <div key={key} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 8px",borderRadius:5,border:"1px solid var(--border2)",background:"var(--bg3)"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:9,fontWeight:700,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{key}</div>
                <div style={{fontSize:7,color:"var(--text4)"}}>{savedAt}</div>
              </div>
              <button onClick={()=>load(key)} style={{padding:"2px 7px",borderRadius:3,cursor:"pointer",fontSize:8,fontWeight:700,border:"1px solid var(--blu-b)",background:"var(--blu-d)",color:"var(--blue)"}}>Load</button>
              <button onClick={()=>remove(key)} style={{padding:"2px 7px",borderRadius:3,cursor:"pointer",fontSize:8,fontWeight:700,border:"1px solid var(--red-b)",background:"var(--red-d)",color:"var(--red)"}}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GpioPlanner({toast}){
  const [assignments,setAssignments]=useState({});
  const [selectedPin,setSelectedPin]=useState(null);
  const [filterType,setFilterType]=useState("ALL");
  const [search,setSearch]=useState("");
  const [sidebarTab,setSidebarTab]=useState("assign");
  const ref=useSectionFade();

  const gpioPins=PINS.filter(p=>p[1]!==null);
  const {conflictPins,conflictGroups}=getConflictingPins(assignments,PINS);
  const FILTER_TYPES=["ALL","GPIO","I2C","SPI","UART","PWM","ONEWIRE"];

  // ── FIXED: check ALT functions (p[5]) for protocol keywords,
  //    not just the primary type tag (p[3]).
  const visiblePins=useMemo(()=>gpioPins.filter(p=>{
    const matchType=filterType==="ALL"||(() => {
      // GPIO: only pure general-I/O pins (primary type === GPIO)
      if(filterType==="GPIO") return p[3]==="GPIO";
      // All protocol filters: primary type first, then scan every ALT string
      if(p[3]===filterType) return true;
      const a=Object.values(p[5]).join(" ").toUpperCase();
      // I2C: any bus (SDA0-6 / SCL0-6)
      if(filterType==="I2C")    return a.includes("SDA")||a.includes("SCL")||a.includes("I2C");
      // SPI: all 7 buses — data + clock + CE lines
      if(filterType==="SPI")    return a.includes("SPI")||a.includes("MOSI")||a.includes("MISO")||a.includes("SCLK")||a.includes("SCK");
      // UART: data (TXD/RXD) + flow-control (CTS/RTS) — all are valid UART signals
      if(filterType==="UART")   return a.includes("TXD")||a.includes("RXD")||a.includes("CTS")||a.includes("RTS");
      // PWM: hardware PWM channels only
      if(filterType==="PWM")    return a.includes("PWM");
      // 1-Wire: only BCM4 (Pin7) is the standard kernel 1-Wire pin on RPi4
      if(filterType==="ONEWIRE")return p[3]==="ONEWIRE";
      return false;
    })();

    const matchSearch=!search.trim()||(
      p[2].toLowerCase().includes(search.toLowerCase())||
      String(p[0]).includes(search)||
      (p[1]!==null&&String(p[1]).includes(search))||
      Object.values(p[5]).some(v=>v.toLowerCase().includes(search.toLowerCase()))
    );
    return matchType&&matchSearch;
  }),[gpioPins,filterType,search]);

  const assign=useCallback((phys,fn,altMode,label)=>{
    setAssignments(prev=>({...prev,[phys]:{fn,altMode,label}}));
    toast(`Pin ${phys} → ${label}`);
  },[toast]);

  const clearPin=useCallback((phys)=>{
    setAssignments(prev=>{const n={...prev};delete n[phys];return n;});
    toast(`Pin ${phys} cleared`);
  },[toast]);

  const resetAll=useCallback(()=>{
    setAssignments({});setSelectedPin(null);toast("Planner reset");
  },[toast]);

  const exportJSON=useCallback(()=>{
    const out=Object.entries(assignments).map(([pin,{fn,altMode,label}])=>{
      const p=PINS.find(x=>x[0]===Number(pin));
      return{pin:Number(pin),bcm:p?.[1],gpio_label:p?.[2],assigned_fn:fn,alt_mode:altMode||"GPIO",label};
    });
    copyToClipboard(JSON.stringify(out,null,2)).then(()=>toast("JSON copied!"));
  },[assignments,toast]);

  return(
    <div id="planner" className="section" ref={ref}>
      <div className="container">
        <div className="section-hdr">
          <div className="section-tag">Interactive GPIO Planner</div>
          <h2 className="section-title">Pin Assignment Planner</h2>
          <p className="section-sub">Click any pin → assign function → auto-generates config.txt · Python · setup.sh · Wiring diagram</p>
        </div>

        {/* Filter bar */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginBottom:14}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pins…"
            style={{padding:"5px 10px",borderRadius:5,fontSize:10,border:"1px solid var(--border2)",background:"var(--bg3)",color:"var(--text)",fontFamily:"'JetBrains Mono',monospace",outline:"none",width:130}}/>
          {FILTER_TYPES.map(t=>(
            <button key={t} onClick={()=>setFilterType(t)} style={{padding:"3px 10px",borderRadius:20,cursor:"pointer",fontSize:9,fontWeight:600,border:`1px solid ${filterType===t?"var(--blue)":"var(--border2)"}`,background:filterType===t?"var(--blu-d)":"var(--bg3)",color:filterType===t?"var(--blue)":"var(--text3)"}}>
              {t}
            </button>
          ))}
          <div style={{marginLeft:"auto",fontSize:9,color:"var(--text3)"}}>
            {Object.keys(assignments).length} assigned · {visiblePins.length} shown
          </div>
        </div>

        <div className="planner-wrap">
          {/* Pin grid */}
          <div>
            <div className="planner-grid">
              {visiblePins.map(p=>{
                const [phys,,name,type]=p;
                const isReserved=["PWR33","PWR5","GND","ID"].includes(type);
                const isAssigned=!!assignments[phys];
                const isConflict=conflictPins.has(phys);
                const isSelected=selectedPin?.[0]===phys;
                const isExisting=!!EXISTING_ACTIVE[p[1]];
                const altSnippet=Object.entries(p[5]).slice(0,2).filter(([,v])=>v).map(([k,v])=>`${k}:${v}`).join(" ");
                return(
                  <div key={phys}
                    className={["planner-pin",isReserved?"reserved":"",isAssigned?"assigned":"",isConflict?"conflict":""].join(" ")}
                    style={{...(isSelected&&!isReserved?{outline:"2px solid var(--blue)"}:{}),
                            ...(isExisting&&!isAssigned?{borderStyle:"dashed",opacity:0.65}:{})}}
                    onClick={()=>{if(!isReserved){setSelectedPin(p);setSidebarTab("assign");}}}>
                    <div className="planner-pin-num">
                      P{phys}{p[1]!==null?" B"+p[1]:""}
                      {isExisting&&<span title={EXISTING_ACTIVE[p[1]]} style={{color:"var(--yellow)",marginLeft:2}}>⚠</span>}
                    </div>
                    <div className="planner-pin-name">{name}</div>
                    <div style={{fontSize:7,color:"var(--text4)",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{altSnippet}</div>
                    <div className="planner-pin-assign" style={{fontSize:8}}>
                      {assignments[phys]?.label||(isExisting?<span style={{color:"var(--yellow)",fontSize:7}}>{EXISTING_ACTIVE[p[1]]}</span>:"")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="planner-sidebar">
            {/* Top tabs */}
            <div style={{display:"flex",gap:3,marginBottom:12}}>
              {[["assign","🎯 Assign"],["output","📄 Output"]].map(([t,lbl])=>(
                <button key={t} onClick={()=>setSidebarTab(t)} style={{flex:1,padding:"5px",borderRadius:5,cursor:"pointer",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",border:`1px solid ${sidebarTab===t?"var(--blue)":"var(--border2)"}`,background:sidebarTab===t?"var(--blu-d)":"var(--bg3)",color:sidebarTab===t?"var(--blue)":"var(--text3)"}}>
                  {lbl}
                </button>
              ))}
            </div>

            {sidebarTab==="assign"?(
              <>
                {!selectedPin?(
                  <div style={{fontSize:11,color:"var(--text3)",textAlign:"center",padding:"20px 0"}}>
                    ← Click a GPIO pin<br/>to assign a function
                  </div>
                ):(
                  <div>
                    {/* Pin header */}
                    <div style={{marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        <span className={`pl pt-${selectedPin[3]}`} style={{fontSize:10,cursor:"default"}}>{selectedPin[2]}</span>
                        <strong style={{fontFamily:"'Syne',sans-serif",fontSize:15}}>Pin {selectedPin[0]}</strong>
                        <span style={{color:"var(--blue)",fontWeight:700,fontSize:11}}>BCM{selectedPin[1]}</span>
                        <span className={selectedPin[4].includes("pull=High")?"pull-hi":"pull-lo"} style={{fontSize:8}}>
                          {selectedPin[4].includes("pull=High")?"High":"Low"}
                        </span>
                      </div>
                      <div style={{fontSize:9,color:"var(--text3)",marginTop:3,lineHeight:1.6}}>{selectedPin[4]}</div>
                      {EXISTING_ACTIVE[selectedPin[1]]&&(
                        <div style={{marginTop:5,padding:"5px 9px",background:"var(--yel-d)",border:"1px solid var(--yel-b)",borderRadius:5,fontSize:9,color:"var(--yellow)"}}>
                          ⚠ Already in config: {EXISTING_ACTIVE[selectedPin[1]]}
                        </div>
                      )}
                      {assignments[selectedPin[0]]&&(
                        <div style={{marginTop:4,padding:"4px 9px",background:"var(--grn-d)",border:"1px solid var(--grn-b)",borderRadius:5,fontSize:9,color:"var(--green)",fontWeight:600}}>
                          ✓ {assignments[selectedPin[0]].label}
                        </div>
                      )}
                    </div>

                    {/* ALT functions */}
                    <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"var(--text3)",marginBottom:5}}>ALT Functions</div>
                    <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:8}}>
                      {ALT_MODES.map(mode=>{
                        const raw=selectedPin[5][mode];
                        if(!raw)return null;
                        const parsed=parseAltLabel(raw);
                        if(!parsed)return null;
                        const isActive=assignments[selectedPin[0]]?.altMode===mode;
                        return(
                          <button key={mode} onClick={()=>assign(selectedPin[0],parsed.fn,mode,`${parsed.label} (${mode})`)}
                            style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"6px 8px",borderRadius:5,border:`1px solid ${isActive?"var(--blue)":"var(--border2)"}`,background:isActive?"var(--blu-d)":"var(--bg3)",cursor:"pointer",textAlign:"left",fontFamily:"'JetBrains Mono',monospace"}}>
                            <span style={{fontSize:8,fontWeight:700,color:"var(--text3)",minWidth:30}}>{mode}</span>
                            <span className={`chip ${parsed.cls}`} style={{fontSize:9}}>{parsed.label}</span>
                            <span style={{fontSize:8,color:"var(--text3)",marginLeft:"auto"}}>{parsed.fn}</span>
                            {isActive&&<span style={{color:"var(--blue)",fontSize:11}}>✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* General use */}
                    <div style={{borderTop:"1px solid var(--border)",margin:"8px 0"}}/>
                    <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"var(--text3)",marginBottom:5}}>General Use</div>
                    <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:10}}>
                      {GENERAL_FNS.map(({fn,label,cls})=>{
                        const isActive=assignments[selectedPin[0]]?.fn===fn&&!assignments[selectedPin[0]]?.altMode;
                        return(
                          <button key={fn} onClick={()=>assign(selectedPin[0],fn,null,label)}
                            style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"5px 8px",borderRadius:5,border:`1px solid ${isActive?"var(--blue)":"var(--border2)"}`,background:isActive?"var(--blu-d)":"var(--bg3)",cursor:"pointer",textAlign:"left",fontFamily:"'JetBrains Mono',monospace"}}>
                            <span className={`chip ${cls}`} style={{fontSize:9}}>{label}</span>
                            {isActive&&<span style={{color:"var(--blue)",fontSize:11,marginLeft:"auto"}}>✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    {selectedPin[1]!==null&&<VoltageHelper bcm={selectedPin[1]}/>}
                    <button className="planner-btn danger" style={{marginTop:8}} onClick={()=>clearPin(selectedPin[0])}>Clear this pin</button>
                  </div>
                )}

                {/* Conflicts */}
                <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
                  <div style={{fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"var(--text3)",marginBottom:6}}>Conflicts</div>
                  {conflictGroups.length===0
                    ?<div style={{fontSize:9,color:"var(--green)"}}>✓ No conflicts</div>
                    :conflictGroups.map(({busDisplay,roleDisplay,pins},i)=>(
                      <div key={i} className="conflict-item">
                        ⚠ {busDisplay} — {roleDisplay}<br/>
                        <span style={{fontSize:8}}>{pins.map(ph=>`P${ph} [${assignments[ph]?.label||"?"}]`).join(" ↔ ")}</span>
                      </div>
                    ))
                  }
                </div>

                {/* Legend */}
                <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:4}}>
                  {[["var(--bg3)","var(--border2)","solid","Available"],["var(--grn-d)","var(--grn-b)","solid","Assigned"],["var(--red-d)","var(--red-b)","solid","Conflict"],["var(--yel-d)","var(--yel-b)","dashed","Existing config ⚠"]].map(([bg,bd,bs,lbl])=>(
                    <div key={lbl} style={{display:"flex",alignItems:"center",gap:6,fontSize:9,color:"var(--text2)"}}>
                      <div style={{width:10,height:10,borderRadius:2,border:`1px ${bs} ${bd}`,background:bg,flexShrink:0}}/>
                      {lbl}
                    </div>
                  ))}
                </div>

                <button className="planner-btn danger" style={{marginTop:10}} onClick={resetAll}>Reset all</button>
                <button className="planner-btn" style={{marginTop:4}} onClick={exportJSON}>Export JSON</button>
                <button className="planner-btn" style={{marginTop:4}} onClick={()=>setSidebarTab("output")}>View Output Files →</button>
              </>
            ):(
              <OutputTabs assignments={assignments} toast={toast}/>
            )}

            <SaveLoadPanel assignments={assignments} onLoad={setAssignments} toast={toast}/>
          </div>
        </div>
      </div>
    </div>
  );
}