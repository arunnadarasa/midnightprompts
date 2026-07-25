#!/usr/bin/env python3
"""Generate agentic-commerce ideas keyed to each of the 10 creative themes.

For every theme we add:
  50 A2A/AP2 ideas
  25 UCP ideas
  25 x402 ideas
= 100 agentic ideas per theme, appended to the existing 100 base ideas.

Each idea gets a `protocol` field so the prompt builder can inject the
right on-chain block. Everything is deterministic (seeded)."""

import json, random, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "data" / "ideas"

# Theme-specific verticals so titles feel native to each house.
THEME_VERTICALS = {
    "dance": [
        "choreography licensing", "rehearsal footage rentals",
        "movement-notation resale", "dance-class replay access",
        "festival ticket splits", "choreographer commissions",
        "studio-time bookings", "dance-competition payouts",
        "guest-instructor bookings", "movement-IP registrations",
    ],
    "music": [
        "streaming split payments", "beat-drop sample licensing",
        "sync-license negotiation", "producer commissions",
        "session-musician bookings", "royalty splits", "stem sales",
        "playlist placements", "concert ticket splits", "album pre-orders",
    ],
    "visual-art": [
        "digital-art licensing", "gallery commissions", "print-on-demand runs",
        "generative-art prompt sales", "commission-request auctions",
        "collector-provenance passports", "edition drops",
        "critique-agent hire", "residency stipends", "moodboard curation",
    ],
    "video": [
        "stock-footage sales", "editor-for-hire gigs",
        "colour-grade LUT licensing", "sync-license negotiation",
        "creator-fan micro-tips", "shoot-day bookings",
        "b-roll marketplace", "captioning gigs", "thumbnail commissions",
        "streaming split payments",
    ],
    "photography": [
        "photo-rights licensing", "shoot-day bookings",
        "retouching gigs", "print sales", "editorial commissions",
        "stock-photo sales", "wedding-album deliveries",
        "location-scout bookings", "model-release attestations",
        "photojournalism payouts",
    ],
    "writing": [
        "ghostwriting gigs", "poetry-chapbook royalties",
        "translation gigs", "screenplay options",
        "developmental-edit bookings", "serialised-fiction subscriptions",
        "newsletter split payments", "critique-agent hire",
        "manuscript-appraisal fees", "author-collab splits",
    ],
    "film-animation": [
        "indie-film distribution", "storyboard commissions",
        "animator-for-hire gigs", "asset-pack licensing",
        "voice-over bookings", "rigging-service gigs",
        "festival-submission escrows", "co-production splits",
        "post-production bookings", "screener paywalls",
    ],
    "games": [
        "3D-model marketplaces", "tabletop-game asset sales",
        "playtester bookings", "esports tournament payouts",
        "mod licensing", "level-design commissions",
        "voice-actor bookings", "narrative-writer gigs",
        "asset-bundle drops", "speedrun-verification tips",
    ],
    "theater": [
        "playwright commissions", "rehearsal-space bookings",
        "director-for-hire gigs", "lighting-design commissions",
        "cast-splits payouts", "touring-royalty splits",
        "streaming-performance paywalls", "understudy bookings",
        "costume-rental agreements", "script-licensing deals",
    ],
    "fashion": [
        "textile-pattern licensing", "sample-run commissions",
        "second-hand fashion resale", "stylist bookings",
        "runway-clip licensing", "costume-rental agreements",
        "capsule-drop pre-orders", "made-to-measure bookings",
        "supply-chain provenance", "designer-collab splits",
    ],
}

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
    "AI-model API", "premium content feed", "high-resolution asset",
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

# Rotate across all four hooks so the theme-page hook chips keep filtering.
HOOK_ROTATION = [
    ("compact-deploy",  "Compact ZK contract",         "onchain logic"),
    ("private-witness", "Private witness proof",       "zero-knowledge"),
    ("lace-wallet",     "Lace wallet + tDUST",         "wallet UX"),
    ("ipfs-content",    "IPFS content + on-chain CID", "decentralized storage"),
]

PROTOCOL_LABEL = {
    "a2a-ap2": "A2A + AP2",
    "ucp": "UCP",
    "x402": "x402 · mUSDC",
}

def slugify(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return re.sub(r"-+", "-", s)[:40]

def make_idea(theme_slug, protocol, idx, action_pool, persona_pool, verticals, rng):
    action, why = rng.choice(action_pool)
    persona = rng.choice(persona_pool)
    vertical = verticals[idx % len(verticals)]
    title_bank = [
        f"{action} · {vertical}",
        f"Agentic {action.lower()}: {vertical}",
        f"{persona.title()} for {vertical}",
        f"{vertical.title()} — {action.lower()} lane",
        f"{action} {vertical} via {persona}",
    ]
    title = rng.choice(title_bank)
    pitch = f"{why} Persona: {persona}. Vertical: {vertical}. Every write ends with a Midnight tx."
    tam, sam, som = rng.choice(TAM_SEEDS)
    hook_id, hook_name, hook_tag = HOOK_ROTATION[idx % len(HOOK_ROTATION)]
    return {
        "id": f"{theme_slug}-agentic-{protocol}-{idx:03d}-{slugify(title)}",
        "theme": theme_slug,
        "title": title,
        "pitch": pitch,
        "subDiscipline": f"agentic · {PROTOCOL_LABEL[protocol]}",
        "quantumHook": hook_name,
        "quantumHookId": hook_id,
        "quantumTag": hook_tag,
        "quantumRationale": (
            f"This idea uses the {PROTOCOL_LABEL[protocol]} protocol overlay on top of a Compact contract: "
            f"the off-chain agent flow ends by calling a Midnight circuit so state is auditable on-chain."
        ),
        "tam": tam,
        "sam": sam,
        "som": som,
        "protocol": protocol,
    }

def build_theme(theme_slug):
    theme_file = OUT / f"{theme_slug}.json"
    data = json.loads(theme_file.read_text())
    base_ideas = [i for i in data["ideas"] if not i.get("protocol")]

    verticals = THEME_VERTICALS[theme_slug]
    rng = random.Random(f"agentic:v2:{theme_slug}")

    new_ideas = []
    plan = [
        ("a2a-ap2", 50, ACTIONS_A2A_AP2, PERSONAS_A2A),
        ("ucp",     25, ACTIONS_UCP,     PERSONAS_UCP),
        ("x402",    25, ACTIONS_X402,    PERSONAS_X402),
    ]
    seen_titles = {i["title"] for i in base_ideas}
    for protocol, count, actions, personas in plan:
        for i in range(count):
            idea = make_idea(theme_slug, protocol, i, actions, personas, verticals, rng)
            tries = 0
            while idea["title"] in seen_titles and tries < 6:
                idea = make_idea(theme_slug, protocol, i, actions, personas, verticals, rng)
                tries += 1
            seen_titles.add(idea["title"])
            new_ideas.append(idea)

    data["ideas"] = base_ideas + new_ideas
    theme_file.write_text(json.dumps(data, indent=2))
    print(f"{theme_slug}: {len(base_ideas)} base + {len(new_ideas)} agentic = {len(data['ideas'])}")

def main():
    for slug in THEME_VERTICALS:
        build_theme(slug)
    # Remove the three standalone agentic theme files.
    for stale in ("agentic-a2a-ap2.json", "agentic-ucp.json", "agentic-x402.json"):
        p = OUT / stale
        if p.exists():
            p.unlink()
            print(f"removed {stale}")
    print("done")

if __name__ == "__main__":
    main()
