"use client";

import { Download } from "lucide-react";

// Prints/downloads just one receipt card: every element carrying
// data-receipt is hidden except the one matching targetId, then restored
// once the print dialog closes. Lets each receipt have its own download
// button on a page that may list several.
export function PrintButton({ targetId, label = "Download" }: { targetId: string; label?: string }) {
  function handlePrint() {
    const others = Array.from(document.querySelectorAll<HTMLElement>("[data-receipt]")).filter(
      (el) => el.dataset.receipt !== targetId,
    );
    others.forEach((el) => el.setAttribute("data-print-hidden", "true"));
    const restore = () => {
      others.forEach((el) => el.removeAttribute("data-print-hidden"));
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 print:hidden"
    >
      <Download size={14} />
      {label}
    </button>
  );
}
