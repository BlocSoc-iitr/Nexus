import { z } from "zod";
import { isAddress } from "viem";

const addressSchema = z.string().refine(addr => isAddress(addr), {
  message: "Must be a valid Ethereum address (0x format)",
});

export const getTokenBalanceInputSchema = z.object({
  contractAddress: addressSchema.describe(
    "The contract address of the ERC20 token (must start with 0x)."
  ),
  userAddress: addressSchema.describe(
    "The wallet address of the user (must start with 0x)."
  ),
});

export type GetTokenBalanceInput = z.infer<typeof getTokenBalanceInputSchema>;
