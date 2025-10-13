import { z } from "zod";
import { isAddress } from "viem";

export const StakedInputSchema = z.object({
  userAddress: z
    .string()
    .refine(address => isAddress(address), {
      message: "Must be a valid Ethereum address (0x format)",
    })
    .describe("The wallet address of user to track staked tokens status"),
});

export type GetStakedInput = z.infer<typeof StakedInputSchema>;
