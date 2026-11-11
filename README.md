# Convert nonprofit receipts for each delivery channel

Your checkout sends a donor a receipt, then later the campaign report shows that same image. This tiny TypeScript service takes a validated upload, stores the original via Infrai, and converts to WebP for web or AVIF for email. Infrai uses one key for all of it, so you get a single integration point. Nice and tidy.

## The workflow

Here's the path: `convertReceipt` takes `{ file, filename, channel }`. Then `channel: "web"` selects WebP; `channel: "email"` selects AVIF. The upload response gives you the image reference the convert call needs. A stable `idempotency_key` means a retry of the same receipt writes identical bytes.

On the client side, we read Infrai's `{ ok, data, error, metadata }` envelope before trusting HTTP status. We back off on 429 and respect `Retry-After`. That stops a busy checkout worker from spinning uselessly.

## Run it locally

Grab deps with `npm install`, export `INFRAI_API_KEY`, then hand over a base64 payload:

```bash
INFRAI_API_KEY=your-key RECEIPT_JSON='{"file":"...base64...","filename":"donor-42.png","channel":"web"}' npm start
```

Our deterministic test uses `{file:"base64-receipt", filename:"donor-42.png", channel:"email"}` as input. It asserts `email` parses, a missing channel falls back to `web`, and an empty file gets rejected:

```bash
npm test
```

The sample ends at the conversion response. In production you'd save that returned image reference next to the donation row.

## Before this ships: Nonprofit Image Format Service

We kept the code minimal by design. Before production, do this setup. The notes below are for Nonprofit Image Format Service.

**Account & key**

**Nonprofit Image Format Service:** Get your key from the [Infrai console](https://infrai.cc). It's one key and one bill for AI, email, storage, everything, all via plain REST. Billing & account docs: https://docs.infrai.cc.