// components/PopoverClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function PopoverClient({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>

      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: "8px", marginLeft: "-170px", borderRadius: "8px", backgroundColor: "white", padding: "16px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
          {children}
        </div>
      )}
    </div>
  );
}
