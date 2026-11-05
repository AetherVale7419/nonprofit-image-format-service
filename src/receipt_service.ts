import { z } from "zod";
import { callInfrai } from "./infrai_client.js";

export const receiptRequest = z.object({
  file: z.string().min(1),
  filename: z.string().min(1),
  channel: z.enum(["web", "email"]).default("web")
});
export type ReceiptRequest = z.infer<typeof receiptRequest>;

export async function convertReceipt(input: unknown) {
  const request = receiptRequest.parse(input);
  const uploaded = await callInfrai<{ image: string }>("/v1/image/upload", { file: request.file, filename: request.filename });
  const format = request.channel === "email" ? "avif" : "webp";
  return callInfrai<{ image: string; format: string }>("/v1/image/convert", {
    image: uploaded.image,
    format,
    idempotency_key: `receipt-${request.filename}-${format}`,
    store: true
  });
}

if (process.argv[1]?.endsWith("receipt_service.ts")) {
  const raw = process.env.RECEIPT_JSON;
  if (!raw) throw new Error("Set RECEIPT_JSON to a JSON request");
  convertReceipt(JSON.parse(raw)).then((result) => console.log(JSON.stringify(result, null, 2)));
}
