// App.jsx
import React, { useState } from "react";

import { useTheme }          from "./hooks/useTheme";
import { useToast }          from "./hooks/useToast";
import { useScrollProgress } from "./hooks/useScrollProgress";

import Hero          from "./components/Hero";
import Topbar        from "./components/Topbar";
import PinMap        from "./components/PinMap";
import VisualBoard   from "./components/VisualBoard";
import AltTable      from "./components/AltTable";
import PullStates    from "./components/PullStates";
import CommsSection  from "./components/CommsSection";
import GpioPlanner   from "./components/GpioPlanner";
import Tools         from "./components/Tools";
import Peripherals   from "./components/Peripherals";
import CodeSnippets  from "./components/CodeSnippets";
import QuickRef      from "./components/QuickRef";
import Footer        from "./components/Footer";
import { Toast, BackToTop, ScrollProgress } from "./components/UI";

export default function App() {
  const { dark, toggle }        = useTheme();
  const { msg, show, toast }    = useToast();
  const { progress, showTop }   = useScrollProgress();
  const [selectedPinIdx, setSelectedPinIdx] = useState(null);

  function handlePinSelect(idx) {
    // If same pin clicked again, toggle off
    setSelectedPinIdx(prev => prev === idx ? null : idx);
    if (idx !== null) {
      setTimeout(() => {
        document.getElementById("pin-detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }

  return (
    <>
      <ScrollProgress progress={progress} />

      <Hero />

      <Topbar
        dark={dark}
        onToggleTheme={toggle}
        onPinSelect={handlePinSelect}
        toast={toast}
      />

      {/* ── Sections ── */}
      <PinMap selectedPinIdx={selectedPinIdx} onPinSelect={handlePinSelect} />
      <hr className="divider" />

      <VisualBoard onPinSelect={handlePinSelect} />
      <hr className="divider" />

      <AltTable />
      <hr className="divider" />

      <PullStates />
      <hr className="divider" />

      <CommsSection />
      <hr className="divider" />

      <GpioPlanner toast={toast} />
      <hr className="divider" />

      <Tools />
      <hr className="divider" />

      <Peripherals />
      <hr className="divider" />

      <CodeSnippets />
      <hr className="divider" />

      <QuickRef />

      <Footer />

      {/* ── Global UI ── */}
      <Toast msg={msg} show={show} />
      <BackToTop visible={showTop} />
    </>
  );
}