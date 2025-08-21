import { z } from "zod";
import { isAddress } from "viem";

export const getBalanceInputSchema = z.object({
  userAddress: z
    .string()
    .refine(address => isAddress(address), {
      message: "Must be a valid Sepolia address (0x format)",
    })
    .describe(
      "The wallet address of the user to get the balance for (must be a valid Sepolia address starting with 0x)."
    ),
});

export type GetBalanceInput = z.infer<typeof getBalanceInputSchema>;
