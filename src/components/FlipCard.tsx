import { useState, type ReactNode } from "react";

/** Two-sided card: click or press Enter to flip. Fixed height so faces can overlay. */
export function FlipCard({ front, back, height = 240, flipped, onFlip }: { front: ReactNode; back: ReactNode; height?: number; flipped?: boolean | undefined; onFlip?: ((v: boolean) => void) | undefined }) {
  const [own, setOwn] = useState(false);
  const on = flipped ?? own;
  const flip = () => (onFlip ? onFlip(!on) : setOwn(!on));
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={on}
      onClick={flip}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } }}
      className={`flip cursor-pointer select-none ${on ? "on" : ""}`}
      style={{ height }}
    >
      <div className="flip-inner h-full">
        <div className="flip-face flex flex-col border border-foreground bg-card p-5">{front}</div>
        <div className="flip-face flip-back flex flex-col overflow-y-auto border border-foreground bg-card p-5">{back}</div>
      </div>
    </div>
  );
}
