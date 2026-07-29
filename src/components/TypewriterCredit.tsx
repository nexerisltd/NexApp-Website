"use client";

import { useEffect, useState } from "react";

type TypewriterCreditProps = {
  phrases?: string[];
  typingSpeedMs?: number;
  deletingSpeedMs?: number;
  pauseMs?: number;
  className?: string;
};

/**
 * Types out each phrase in `phrases`, pauses, deletes it, then moves on to
 * the next — looping forever. Used on the launch page for the developer
 * credit ("Developed by Arabi Islam" -> "MR. ARX" -> repeat).
 */
export default function TypewriterCredit({
  phrases = ["Developed by Arabi Islam", "MR. ARX"],
  typingSpeedMs = 70,
  deletingSpeedMs = 40,
  pauseMs = 1400,
  className = "",
}: TypewriterCreditProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">(
    "typing"
  );

  useEffect(() => {
    const current = phrases[phraseIndex % phrases.length];

    if (phase === "typing") {
      if (text.length < current.length) {
        const t = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          typingSpeedMs
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("pausing"), pauseMs);
      return () => clearTimeout(t);
    }

    if (phase === "pausing") {
      const t = setTimeout(() => setPhase("deleting"), pauseMs);
      return () => clearTimeout(t);
    }

    // deleting
    if (text.length > 0) {
      const t = setTimeout(
        () => setText(current.slice(0, text.length - 1)),
        deletingSpeedMs
      );
      return () => clearTimeout(t);
    }
    setPhraseIndex((i) => (i + 1) % phrases.length);
    setPhase("typing");
  }, [text, phase, phraseIndex, phrases, typingSpeedMs, deletingSpeedMs, pauseMs]);

  return (
    <span className={`inline-flex items-center font-mono ${className}`}>
      {text}
      <span className="typewriter-caret ml-0.5 inline-block w-[2px] h-[1em] bg-current align-middle" />
    </span>
  );
}
