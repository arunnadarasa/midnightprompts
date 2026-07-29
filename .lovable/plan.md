## Problem

On narrow mobile viewports, the showcase demo cards overflow horizontally — inline `<code>` tokens like `appendEntry` and `/api/append-entry`, plus long words, push text past the card's right edge (visible as clipped "Compa…", "behin…", "ov…" in the screenshot). The `max-w-2xl` on the paragraph doesn't help because inline code doesn't break by default, and the grid track is being widened by the non-wrapping child.

## Changes (mobile-only UX, `src/routes/showcase.index.tsx`)

1. **Card container** — add `min-w-0 overflow-hidden` on the `<a>` / `<Link>` wrapper so a stubborn child can't stretch the grid track.
2. **Body paragraph** — add `break-words` (and `[overflow-wrap:anywhere]` as fallback) to `<p className="mt-3 text-sm …">` so long tokens wrap.
3. **Inline code** — add a small utility `break-all` on every `<code>` inside card bodies (or wrap them with a class) so `/api/append-entry`, `appendEntry`, `MidnightUSDC`, `PAYMENT-SIGNATURE`, `state.dust.state.progress.isStrictlyComplete()` etc. wrap cleanly.
4. **Header row** — the eyebrow tag row (`flex items-center justify-between … flex-wrap`) is fine, but tighten gap on mobile (`gap-y-1`) so the badge sits neatly under the tag when it wraps.
5. **Title** — add `break-words` on the `<h2>` (short today, but future-proof).
6. **Filter chips row** — already `flex-wrap`, no change needed.

No copy or business-logic changes; visual-only tweak scoped to this one file.
