// Midnight x402 facilitator — CORS-proxy + simulated settlement.
// Real settlement requires a deployed MidnightUSDC contract; without it we return
// { simulated: true } and a stub tx hash. Never crash at boot.
import { createFileRoute } from "@tanstack/react-router";

const NETWORK = "midnight:preprod";

export const Route = createFileRoute("/api/public/x402-proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sig = request.headers.get("PAYMENT-SIGNATURE");

        if (!sig) {
          const body = {
            x402Version: 2,
            error: "payment required",
            accepts: [
              {
                scheme: "midnight-mUSDC",
                network: NETWORK,
                asset: "0xMidnightUSDC_NOT_DEPLOYED",
                amount: "10000",
                maxTimeoutSeconds: 300,
                extra: { name: "MidnightUSDC", version: "1" },
              },
            ],
          };
          return new Response(JSON.stringify(body), {
            status: 402,
            headers: { "Content-Type": "application/json" },
          });
        }

        // No deployed facilitator yet — surface a simulated settlement.
        const paymentResponse = {
          success: true,
          simulated: true,
          network: NETWORK,
          payer: "mn_addr_test1…",
          midnightTxHash: "0xSIMULATED",
          note: "Deploy MidnightUSDC and wire this route to a real facilitator to settle on-chain.",
        };

        return new Response(
          JSON.stringify({ unlocked: true, content: "Protected payload." }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "PAYMENT-RESPONSE": Buffer.from(JSON.stringify(paymentResponse)).toString("base64"),
            },
          },
        );
      },
    },
  },
});
