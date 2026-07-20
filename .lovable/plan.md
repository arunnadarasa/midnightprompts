Expand the Docker setup guide using the official Docker LLM docs as a reference source.

## Goal
Make the in-app Docker setup guide more authoritative, OS-specific, and useful for the Midnight local stack (proof server + Undeployed node). Keep it inside the existing `DockerSetupGuide` component so all consumers (`/proof-server`, `/undeployed`, `/known-issues`) benefit automatically.

## What will change

1. **Enrich the per-OS panels** in `src/components/DockerSetupGuide.tsx` with official Docker links and clearer install steps derived from the Docker LLM docs (Get Docker, Get Started, Docker Desktop / Engine install pages).

2. **Add a "Docker CLI for Midnight" panel** after the OS tabs covering the commands users actually need:
   - `docker run -d -p 6300:6300 --name ...` for the proof server
   - `docker ps`, `docker logs -f`, `docker stop`, `docker start`, `docker rm`
   - `docker info` / `docker --version` as smoke checks
   - `docker compose` basics for the local Undeployed stack

3. **Add a "Common Docker errors" mini-FAQ** linking to official Docker troubleshooting docs and the Windows blockers we already document (BIOS virtualization, WSL update, PowerShell policy).

4. **Add a "Further reading" footer** linking to the Docker docs (including the LLM-friendly `llms.txt` and `get-started.md`) so users can dig deeper without leaving the workflow.

5. **Update the mega-prompt builder** (`src/lib/mega-prompt-variants.ts`) to reference the expanded guide in the Undeployed variant, so hackathon prompts point participants to the same authoritative Docker setup steps.

## Files to edit
- `src/components/DockerSetupGuide.tsx` (primary changes)
- `src/lib/mega-prompt-variants.ts` (add reference to the in-app guide)
- `src/routes/proof-server.tsx` and `src/routes/undeployed.tsx` (minor cross-link text updates if needed)

## Out of scope
- No new routes or pages.
- No changes to the wallet, Lace, or contract code.
- No backend changes.

## Verification
- Type-check with `bunx tsgo --noEmit`.
- Smoke-test the `/proof-server` and `/undeployed` pages in the preview to confirm the guide still collapses/expands and tabs render correctly.