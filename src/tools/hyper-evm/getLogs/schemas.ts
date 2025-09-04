import { z } from "zod";

export const getLogsInputSchema = z.object({
  contractAddress: z
    .string()
    .describe("The address of the ERC20 token contract"),
  from: z
    .number()
    .optional()
    .describe("The block number to start fetching logs from"),
  to: z
    .number()
    .optional()
    .describe("The block number to stop fetching logs at"),
});

export type GetLogsInput = z.infer<typeof getLogsInputSchema>;
