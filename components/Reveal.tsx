// ponytail: duplicated from ussu-web packages/ui, not worth a shared package for 2 files
// across 2 repos yet. Extract to a published @ussu/ui-core package if a 3rd consumer
// shows up or these drift out of sync becomes a real problem.
"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // threshold:0 fires as soon as any pixel enters, not once 10% of the
      // element's own area is visible — a tall table can be many times the
      // viewport height and never reach a 10% area ratio otherwise.
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

const revealStyle = (visible: boolean, delayMs: number) => ({
  transitionDelay: visible ? `${delayMs}ms` : "0ms",
  transitionDuration: "900ms",
  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
});

const revealClass = (visible: boolean) =>
  `transition-[opacity,transform] will-change-transform ${
    visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
  }`;

/** Single element that animates in when it enters the viewport. */
export function Reveal({
  children,
  delayMs = 0,
  className = "",
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={revealStyle(visible, delayMs)} className={`${revealClass(visible)} ${className}`}>
      {children}
    </div>
  );
}

const RevealContext = createContext(false);

/**
 * Observes visibility once for a group of children so they all trigger
 * together instead of racing on independent observers. Use with RevealItem.
 */
export function RevealGroup({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className}>
      <RevealContext.Provider value={visible}>{children}</RevealContext.Provider>
    </div>
  );
}

export function RevealItem({
  children,
  delayMs = 0,
  className = "",
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const visible = useContext(RevealContext);
  return (
    <div style={revealStyle(visible, delayMs)} className={`${revealClass(visible)} ${className}`}>
      {children}
    </div>
  );
}
