import { z } from "zod";
import { isAddress } from "viem";

export const fetchTransactionsInputSchema = z.object({
  userAddress: z
    .string()
    .refine(addr => isAddress(addr), {
      message: "Must be a valid HyperEVM address (0x...)",
    })
    .describe("The user address to search transactions for."),
  lookbackBlocks: z
    .number()
    .int()
    .positive()
    .max(5_000)
    .optional()
    .describe(
      "How many recent blocks to scan backwards from the latest block. Defaults to 500."
    ),
  limit: z
    .number()
    .int()
    .positive()
    .max(200)
    .optional()
    .describe("Maximum number of transactions to return. Defaults to 50."),
});

export type FetchTransactionsInput = z.infer<
  typeof fetchTransactionsInputSchema
>;
