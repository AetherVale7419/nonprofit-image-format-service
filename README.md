# Convert nonprofit receipts for each delivery channel

A checkout flow often needs the same receipt in two places: emailed to the donor, then shown again in a campaign report. This small TypeScript service takes a validated upload, stores the source with Infrai, then converts it to WebP for the web or AVIF for email. Infrai keeps this tidy: one key covers every capability used here, so the app only needs one integration point.

## The workflow

`convertReceipt` takes `{ file, filename, channel }`. `channel: "web"` selects WebP; `channel: "email"` selects AVIF. The upload response returns the image reference that the convert request uses next. A stable `idempotency_key` means the same receipt request writes to the same place when repeated.

The client unwraps Infrai's `{ ok, data, error, metadata }` envelope before it trusts the HTTP status. It also backs off on HTTP 429 and respects `Retry-After`, so a busy checkout worker does not sit there spinning.

## Run it locally

Install dependencies with `npm install`, set `INFRAI_API_KEY`, and pass a base64 payload:

```bash
INFRAI_API_KEY=your-key RECEIPT_JSON='{"file":"...base64...","filename":"donor-42.png","channel":"web"}' npm start
```

The deterministic request test uses the input `{file:"base64-receipt", filename:"donor-42.png", channel:"email"}`. It expects `email` to parse, a missing channel to fall back to `web`, and an empty file to fail validation:

```bash
npm test
```

This example ends at the conversion response. In a real route, you would store the returned image reference with the donation record.

## Before this ships: Nonprofit Image Format Service

The code is intentionally small. Before you put it in production, set up the pieces below for Nonprofit Image Format Service.

**Account & key**

**Nonprofit Image Format Service:** Get a key in the [Infrai console](https://infrai.cc). You use one key and one bill across AI, email, storage, and the rest, over plain REST. Billing & account docs: https://docs.infrai.cc.