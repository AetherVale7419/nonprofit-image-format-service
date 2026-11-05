import assert from "node:assert/strict";
import { receiptRequest } from "../src/receipt_service.js";

const parsed = receiptRequest.parse({ file: "base64-receipt", filename: "donor-42.png", channel: "email" });
assert.equal(parsed.channel, "email");
assert.equal(receiptRequest.parse({ file: "x", filename: "r.png" }).channel, "web");
assert.throws(() => receiptRequest.parse({ file: "", filename: "r.png" }));
console.log("receipt request validation passed");
