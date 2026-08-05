Confirm current prompt count and OS behavior

Current state:
- 996 base ideas + 1,000 agentic ideas (A2A/AP2, UCP, x402) = 1,996 total ideas
- 5 visible network variants per idea: Preview, Preprod, Undeployed (Local), Undeployed (Fly.io), Undeployed (Mobile)
- Visible prompts: 1,996 × 5 = 9,980
- Hidden Mainnet variant: 1,996 × 6 = 11,976 if counted
- The macOS / Windows / Linux toggle only swaps the Docker/prerequisites block inside a single prompt; it does NOT multiply the prompt count
- User confirmed they want to keep current behavior (no OS multiplier)

No code changes needed.