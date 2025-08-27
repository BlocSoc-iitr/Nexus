import { z } from "zod";

export const getTransactionReceiptInputSchema = z.object({
  txHash: z
    .string()
    .regex(
      /^0x([A-Fa-f0-9]{64})$/,
      "Invalid transaction hash: expected 0x + 64 hex chars"
    )
    .describe("The hash of the transaction"),
});

export type getTransactionReceiptInput = z.infer<
  typeof getTransactionReceiptInputSchema
>;
