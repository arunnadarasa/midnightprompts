## Scope

Mobile UX pass on `src/routes/ideas.$id.tsx` only — the "The build prompt." section in the screenshot. No copy changes, no logic changes.

## Problems visible in the screenshot

1. **Copy button dominates the mobile row.** It sits in the header's right-hand `flex` slot, wraps below the H2, and stretches to feel like a full-width primary CTA even though the real primary action is "Open in Lovable" further down.
2. **Variant tabs wrap awkwardly.** `inline-flex flex-wrap` with three pills of uneven width produces "Preview | Preprod" on row 1 and "Undeployed (Local)" alone on row 2 with a visible empty gap to the right of the second row (the `bg-border` shows through). Looks broken.
3. **Prompt `<pre>` uses `break-all`**, which chops words mid-character on narrow screens and hurts readability. `break-words` / `overflow-wrap: anywhere` (already partly set inline) is enough.
4. Minor: the "budget · 1 message" chip is already hidden on mobile — keep that.

## Changes

### Variant tabs → full-width segmented control on mobile

Replace the wrapping inline pill row with a 3-column grid on mobile that promotes to inline-flex at `sm:`. Each button gets `text-center` and slightly tighter padding + tracking so "Undeployed (Local)" fits on one line at 360px. Same visual language (gold active, border separators), just no ragged wrap.

```tsx
<div className="grid grid-cols-3 gap-px bg-border border border-border sm:inline-flex sm:w-auto">
  {/* buttons: px-2 py-2 text-[10px] tracking-[0.18em] sm:px-4 sm:text-[11px] sm:tracking-[0.24em] text-center */}
</div>
```

### Copy button → move next to the tabs, secondary styling on mobile

Remove `<CopyButton>` from the H2 header row. Put it on the same row as the segmented control: tabs take the available width, copy button sits to the right on `sm:` and drops under the tabs on mobile as a right-aligned, auto-width secondary button (not a full-width slab). The header row then only holds the eyebrow + H2, which is what the desktop layout already implies.

### Prompt block wrapping

On the `<pre>`: swap `break-all` for `break-words`; keep the inline `wordBreak: "break-word"` / `overflowWrap: "anywhere"`. Also drop `sm:p-8` to `sm:p-6` — 8 is fine on desktop but the mobile `p-4` already looks right; only real change is the word-break class.

### Action buttons row

`.flex flex-wrap gap-3` already wraps, but on 360px "Open in Lovable · Undeployed (Local) ↗" overflows the button horizontally because of `px-6`. Add `w-full sm:w-auto justify-center` to each action anchor/Link in that row so they stack as full-width buttons on mobile and stay inline from `sm:` up. This matches the pattern used elsewhere in the site (e.g. `undeployed.tsx` action row is fine, this one is the outlier).

## Files touched

- `src/routes/ideas.$id.tsx` — only the "Appendix · Mega-prompt" section (roughly lines 139–232) and the `<pre>` className.

## Not doing

- No changes to prompt content, variant logic, `buildVariant`, or `CopyButton` internals.
- No changes to other routes, nav, or the DanceProof toast visible in the screenshot (that's the Lovable IDE, not the app).
- No new components.

## Verification

- Reload `/ideas/<id>` at 360px width: tabs render as one row of three equal cells, copy button is a compact secondary control, prompt wraps on word boundaries, action buttons stack full-width.
- At `sm:` (≥640px) the layout matches today's desktop: inline tabs, inline copy button, inline action row.
