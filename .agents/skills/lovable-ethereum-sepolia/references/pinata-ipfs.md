# Pinata IPFS pinning (optional)

Only needed when the app pins media, JSON metadata, or manifests to IPFS
(e.g. an ERC-721 `tokenURI` pointing at `ipfs://<cid>`).

## Secret

`PINATA_JWT` (server) + `VITE_PINATA_JWT` (browser, if uploading from the
client). **Must be a scoped JWT** created via Pinata dashboard →
API Keys → New Key → limit permissions to `pinFileToIPFS` +
`pinJSONToIPFS`. Never ship a full-account JWT to the browser.

## Browser upload (file)

```ts
async function pinFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}` },
    body,
  });
  if (!res.ok) throw new Error(`Pinata ${res.status}: ${await res.text()}`);
  const { IpfsHash } = await res.json();
  return IpfsHash as string; // "bafybeig…"
}
```

## Pin JSON metadata

```ts
async function pinJson(data: unknown): Promise<string> {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
    },
    body: JSON.stringify({ pinataContent: data }),
  });
  if (!res.ok) throw new Error(`Pinata ${res.status}: ${await res.text()}`);
  const { IpfsHash } = await res.json();
  return IpfsHash;
}
```

## Gateway URLs

Both work for browser preview:

- `https://gateway.pinata.cloud/ipfs/${cid}` — Pinata's dedicated gateway
  (faster if you have a paid Pinata plan)
- `https://ipfs.io/ipfs/${cid}` — public IPFS gateway (rate-limited)
- `https://cloudflare-ipfs.com/ipfs/${cid}` — CDN-backed alternative

For an `<img>` in the UI, prefer `gateway.pinata.cloud` when the JWT
plan includes gateway access; otherwise fall back to `ipfs.io`.

## ERC-721 metadata pattern

Two pins per mint — media then JSON:

```ts
// 1. pin the image
const imageCid = await pinFile(imageFile);

// 2. pin the metadata JSON referencing the image
const metadataCid = await pinJson({
  name: "Choreo #001",
  description: "Timestamped on Sepolia",
  image: `ipfs://${imageCid}`,
  attributes: [{ trait_type: "chain", value: "Sepolia" }],
});

// 3. mint with tokenURI = ipfs://${metadataCid}
await mintContract.write.mint([`ipfs://${metadataCid}`]);
```

`tokenURI` MUST use the `ipfs://` scheme, not a gateway URL — wallets and
marketplaces resolve `ipfs://` themselves and pick their own gateway.
Baking a gateway URL into the token metadata makes it permanently
dependent on that gateway staying online.

## Failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Pinata 401` | JWT missing scopes, or full-account JWT expired | Recreate a scoped JWT with `pinFileToIPFS` + `pinJSONToIPFS` |
| CID pins but gateway 404s for ~1 min | IPFS DHT propagation lag | Wait; try alternate gateway |
| `image` field in metadata shows broken in OpenSea | Used `https://…` instead of `ipfs://` | Fix to `ipfs://${cid}` |
| Large file upload hangs | Free Pinata plan file-size cap | Chunk or upgrade plan |
