// hooks/useToast.js
import { useState, useCallback, useRef } from "react";

export function useToast() {
  const [msg, setMsg]     = useState("");
  const [show, setShow]   = useState(false);
  const timerRef          = useRef(null);

  const toast = useCallback((message, dur = 2200) => {
    setMsg(message);
    setShow(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShow(false), dur);
  }, []);

  return { msg, show, toast };
}