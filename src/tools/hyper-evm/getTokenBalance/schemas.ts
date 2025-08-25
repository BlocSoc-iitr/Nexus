import { z } from "zod";
import { isAddress } from "viem";

export const getTokenBalanceInputSchema = z.object({
  contractAddress: z
    .string()
    .refine(address => isAddress(address), {
      message: "Must be a valid HyperEVM address (0x format)",
    })
    .describe(
      "The contract address of the ERC20 token to get the balance for (must be a valid HyperEVM address starting with 0x)."
    ),
    userAddress: z
    .string()
    .refine(address => isAddress(address), {
      message: "Must be a valid HyperEVM address (0x format)",
    })
    .describe(
      "The wallet address of the user to get the balance for (must be a valid HyperEVM address starting with 0x)."
    ),
});

export type GetTokenBalanceInput = z.infer<typeof getTokenBalanceInputSchema>;
