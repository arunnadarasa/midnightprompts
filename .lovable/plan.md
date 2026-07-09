## Delta on the approved Midnight pivot

Two changes to the plan already approved — nothing else moves.

### 1. Switch the AISA model to Hy3 (free until July 21)

- Model id: `tencent/hy3` (295B MoE, 256K context, strong at long-context agent + coding tasks).
- Endpoint stays `https://api.aisa.one/v1/chat/completions`.
- Update the sub-agent B regen script (`scripts/regenerate_ideas.py` — currently pinned to `qwen3.7-max`) to send `"model": "tencent/hy3"` on every call.
- Also update `scripts/patch_midnight_block.py` (the new in-place patcher) if it makes any AISA calls; template patching stays pure-Python and needs no model.
- Long context helps here: the new Midnight megaprompt template (Compact contract + MidnightJS wiring + Lace + secrets + hackathon credit) will run 3–5× longer than the current Ethereum one, so Hy3's 256K window lets us keep the full context per idea instead of trimming.
- No fallback model configured — if Hy3 is rate-limited or expires post-July 21, I stop and ask the user which model to swap to rather than silently degrading.

### 2. Request the AISA API key

Before running sub-agent B, ask for the key via `secrets--add_secret` with name `AISA_API_KEY`, placeholder `sk-aisa-...`, and a note pointing to `aisa.one` for the key. The regen script reads `process.env.AISA_API_KEY` — same wiring as before, just a fresh value on the remixed project.

### Everything else from the approved plan is unchanged

Sub-agent A (Midnight docs synthesis) is still running. Rebrand, 4 Midnight primitives, live demo compiled in the sandbox, `lovable-midnight` skill, cleanup of Ethereum artifacts — all as approved.
