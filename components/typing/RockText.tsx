// components/typing/RockText.tsx
//
// The target's text as it appears on a rock/obstacle: already-typed chars dim
// and strike through, the current char glows, the rest wait. A bare-space
// target renders as a wide "SPACE" pill so the kid knows to hit the thumb.
// Shared by every typing game skin (Space Defense, Dino Run, …).

export default function RockText({
  text,
  charIndex,
  spaceLabel,
  highlight = true,
}: {
  text: string;
  charIndex: number;
  spaceLabel: string;
  /** false on a queued (not-yet-active) target: show the text plainly, with
    * no glowing current char — only the rock being typed gets a cursor, so
    * the kid is never in doubt about which one their keys go to. */
  highlight?: boolean;
}) {
  if (text === ' ') {
    // The space label is Thai ("เว้นวรรค (Space)"), so it must NOT use
    // font-mono — a Latin monospace mangles Thai vowel/tone stacking. Fall
    // back to the app's default (IBM Plex Sans Thai) which lays Thai out
    // correctly. Only the Latin letter targets below keep the mono look.
    return (
      <span className="inline-block whitespace-nowrap rounded-lg bg-violet-500/30 px-3 py-1 text-base font-bold text-violet-100">
        {spaceLabel}
      </span>
    );
  }
  return (
    <span className="font-mono text-2xl font-extrabold tracking-wider sm:text-3xl">
      {[...text].map((ch, i) => (
        <span
          key={i}
          className={
            !highlight
              ? 'text-white/60'
              : i < charIndex
                ? 'text-emerald-400/40 line-through'
                : i === charIndex
                  ? 'rounded bg-fuchsia-500/40 px-0.5 text-white'
                  : 'text-white/75'
          }
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
