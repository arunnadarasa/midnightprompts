#!/usr/bin/env python3
"""Generate the three agentic theme JSON files.

  agentic-a2a-ap2.json  -> 500 ideas
  agentic-ucp.json      -> 250 ideas
  agentic-x402.json     -> 250 ideas

Each idea gets a `protocol` field so the prompt builder can append the
right on-chain block. Everything is deterministic (seeded)."""

import json, os, random, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "ideas"
OUT.mkdir(parents=True, exist_ok=True)

VERTICALS = [
    "music streaming", "indie film distribution", "digital art licensing",
    "podcast paywalls", "AI dataset marketplaces", "photography rights",
    "dance choreography IP", "esports tournament payouts", "translation gigs",
    "3D-model marketplaces", "font licensing", "typography stock",
    "stock footage sales", "science-preprint tips", "open-source bounties",
    "citizen-journalism payouts", "streaming split payments",
    "creator-fan micro-tips", "AI voice-model rentals", "code-review bounties",
    "tabletop-game asset sales", "beat-drop sample licensing",
    "generative-art prompt sales", "recipe-book royalties",
    "moodboard curation", "product-review reputation", "carbon-credit retirement",
    "supply-chain provenance", "second-hand fashion resale", "vintage vinyl trade",
    "wine-cellar provenance", "coffee-bean traceability",
    "handmade-jewellery sales", "poetry chapbook royalties",
    "yoga-class replay access", "meditation-audio libraries",
    "cooking-class replays", "language-tutor bookings",
    "science-experiment reproducibility", "peer-review reputation",
    "citizen-science telemetry", "field-recording archives",
    "sample-pack sales", "AI-agent hire marketplaces",
    "on-demand data-labelling", "cross-agent negotiation",
    "delivery-drone waypoints", "IoT-sensor readings", "smart-lock rentals",
    "shared-workspace bookings",
]

PERSONAS_A2A = [
    "buyer agent", "seller agent", "curator agent", "aggregator agent",
    "translator agent", "escrow agent", "arbitrator agent", "sourcing agent",
    "pricing agent", "recommender agent",
]
PERSONAS_UCP = [
    "merchant", "buyer", "wholesale desk", "affiliate", "co-op member",
    "artist co-operative", "gig-worker collective", "creator DAO",
]
PERSONAS_X402 = [
    "AI-model API", "premium news feed", "high-resolution asset",
    "private analytics endpoint", "search-tool webhook",
    "on-demand transcription API", "code-audit LLM route",
    "translator microservice", "moderator LLM", "embedding-search endpoint",
]

ACTIONS_A2A_AP2 = [
    ("Negotiate", "Two agents haggle price and terms via A2A `message/send`; the final CartMandate is signed off-chain then anchored on Midnight."),
    ("Broker", "A broker agent collects competing offers, selects a winner, signs an AP2 CartMandate and calls `anchorMandate`."),
    ("Escrow", "A2A negotiation ends in an escrowed mandate; funds unlock after a second CartMandate signs the delivery receipt."),
    ("Auction", "Multiple seller agents respond to a buyer RFP; highest signed offer is anchored to `MandateVault` as the winning cart."),
    ("Aggregate", "A curator agent bundles offers from many sellers into one CartMandate the buyer signs once, then anchors on Midnight."),
    ("Delegate", "An AP2 IntentMandate delegates authority to an agent; every CartMandate the agent produces is anchored under the intent hash."),
    ("Split", "Revenue-split CartMandate signs the payout table; the mandate hash pins the split on Midnight so downstream transfers can be verified."),
    ("Rebalance", "Two agents renegotiate an existing anchored mandate; a new CartMandate supersedes the old one on-chain via `anchorMandate`."),
    ("Match", "Matching agent pairs buyer and seller intents from a public queue; the resulting CartMandate is anchored under both intent hashes."),
    ("Underwrite", "Underwriter agent co-signs a CartMandate; the anchored mandate carries both signatures so payout is contingent on both."),
]
ACTIONS_UCP = [
    ("ZK Checkout", "Merchant serves a UCP `discovery` doc, buyer runs the collapsed checkout, and the merchant records the order on `OrderLedger` on Midnight."),
    ("Signed Receipt", "UCP checkout returns an RFC 9421-signed receipt; the receipt hash is recorded to `OrderLedger` for public audit."),
    ("Bulk Order", "One UCP checkout call anchors a whole basket to `OrderLedger` with one Midnight tx."),
    ("Self-Test", "Merchant exposes UCP `selfTest`; a passing run anchors the conformance hash to `OrderLedger` as a public attestation."),
    ("Discovery", "UCP discovery is signed with the merchant's key; the signing-key fingerprint is anchored on Midnight for pinning."),
    ("Refund", "A UCP refund op re-anchors the order with a `refunded` flag; the ledger keeps both the original and refund order hash."),
]
ACTIONS_X402 = [
    ("Paywall", "Client hits a 402, signs an mUSDC authorization for the amount, the facilitator submits `MidnightUSDC.transfer`, and the endpoint returns the payload."),
    ("Metered API", "Per-call mUSDC billing via x402; the facilitator batches settled transfers into `MidnightUSDC` on Midnight."),
    ("Streaming", "Long-poll endpoint charges per chunk; each chunk is a separate x402 challenge settled on Midnight."),
    ("Prepaid", "Client pre-tops mUSDC to an escrow contract; x402 challenges are checked against the escrow balance before serving."),
    ("Tiered", "Different `accepts[]` entries for free / basic / pro tiers, each settled through `MidnightUSDC.transfer`."),
    ("Refund", "Endpoint refunds the paid mUSDC if the response fails a schema check; refund goes back through `MidnightUSDC` on Midnight."),
]

TAM_SEEDS = [
    ("$210B — global e-commerce", "$28B — agentic commerce SAM by 2028", "$140M — early-adopter mandate flows"),
    ("$88B — API-first economy", "$9B — pay-per-call APIs", "$45M — mUSDC-metered early adopters"),
    ("$1.2T — creator economy", "$180B — programmable payouts", "$220M — ZK-anchored splits"),
    ("$47B — B2B negotiation software", "$5B — agent-to-agent SaaS", "$85M — anchored-mandate SAM"),
    ("$310B — cross-border settlement", "$22B — stablecoin rails", "$120M — mimic-token PoC bracket"),
]

# ---------- helpers ----------
def slugify(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return re.sub(r"-+", "-", s)

# hook mapping so the prompt block generator has something to grab.
# We reuse existing hook ids so buildVariant doesn't blow up.
HOOK_BY_PROTOCOL = {
    "a2a-ap2": ("compact-deploy", "Compact ZK contract", "onchain logic"),
    "ucp":     ("compact-deploy", "Compact ZK contract", "onchain logic"),
    "x402":    ("compact-deploy", "Compact ZK contract", "onchain logic"),
}

def make_idea(protocol, slug_prefix, idx, action_pool, persona_pool, vertical, rng):
    action, why = rng.choice(action_pool)
    persona = rng.choice(persona_pool)
    title_bank = [
        f"{action} {vertical}",
        f"Agentic {action.lower()}: {vertical}",
        f"{persona.title()} for {vertical}",
        f"{action} · {vertical} via {persona}",
        f"{vertical.title()} — {action.lower()} lane",
    ]
    title = rng.choice(title_bank)
    pitch = f"{why} Persona: {persona}. Vertical: {vertical}. Every write ends with a Midnight tx."
    tam, sam, som = rng.choice(TAM_SEEDS)
    hook_id, hook_name, hook_tag = HOOK_BY_PROTOCOL[protocol]
    sub = f"agentic · {protocol}"
    return {
        "id": f"{slug_prefix}-{idx:04d}-{slugify(title)[:40]}",
        "theme": slug_prefix,
        "title": title,
        "pitch": pitch,
        "subDiscipline": sub,
        "quantumHook": hook_name,
        "quantumHookId": hook_id,
        "quantumTag": hook_tag,
        "quantumRationale": (
            f"This idea uses the {protocol.upper()} protocol layer on top of a Compact contract: "
            f"the off-chain agent flow ends by calling a Midnight circuit so state is auditable on-chain."
        ),
        "tam": tam,
        "sam": sam,
        "som": som,
        "protocol": protocol,
    }

def build(protocol, count, slug, name, emoji, audience, market_anchor, action_pool, persona_pool):
    rng = random.Random(f"agentic:{protocol}:v1")
    ideas = []
    seen = set()
    # Cycle through verticals + personas to spread coverage.
    for i in range(count):
        vertical = VERTICALS[i % len(VERTICALS)]
        idea = make_idea(protocol, slug, i, action_pool, persona_pool, vertical, rng)
        # nudge to avoid duplicate titles
        n = 0
        while idea["title"] in seen and n < 5:
            idea = make_idea(protocol, slug, i, action_pool, persona_pool, vertical, rng)
            n += 1
        seen.add(idea["title"])
        ideas.append(idea)
    payload = {
        "theme": {
            "slug": slug,
            "name": name,
            "emoji": emoji,
            "audience": audience,
            "market_anchor": market_anchor,
        },
        "ideas": ideas,
    }
    path = OUT / f"{slug}.json"
    path.write_text(json.dumps(payload, indent=2))
    print(f"wrote {path} — {len(ideas)} ideas")

build(
    protocol="a2a-ap2", count=500,
    slug="agentic-a2a-ap2", name="Agent Negotiation", emoji="🤝",
    audience="agent-builders, marketplace teams",
    market_anchor="$28B agentic-commerce SAM by 2028 (Gartner)",
    action_pool=ACTIONS_A2A_AP2, persona_pool=PERSONAS_A2A,
)
build(
    protocol="ucp", count=250,
    slug="agentic-ucp", name="ZK Checkout (UCP)", emoji="🧾",
    audience="merchants, creator co-ops",
    market_anchor="RFC 9421 signed-checkout adoption in 2026",
    action_pool=ACTIONS_UCP, persona_pool=PERSONAS_UCP,
)
build(
    protocol="x402", count=250,
    slug="agentic-x402", name="x402 · mUSDC Paywall", emoji="🪙",
    audience="API providers, LLM route operators",
    market_anchor="Pay-per-call API market, mimic-USDC on Midnight",
    action_pool=ACTIONS_X402, persona_pool=PERSONAS_X402,
)

print("done")
