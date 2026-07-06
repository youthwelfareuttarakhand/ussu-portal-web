// ponytail: duplicated from ussu-web packages/ui, see Reveal.tsx note.
export function EyebrowSwoosh({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 20" className={`mt-1 h-4 w-24 text-accent ${className}`} fill="none" aria-hidden="true">
      <path d="M2 10c15-8 30-8 45 0s35 8 51 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
