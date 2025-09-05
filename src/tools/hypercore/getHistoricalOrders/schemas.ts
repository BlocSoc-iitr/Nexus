import { z } from "zod";
import { isAddress } from "viem";

export const getOrdersInputSchema = z.object({
  userAddress: z
    .string()
    .refine(address => isAddress(address), {
      message: "Must be a valid Ethereum address (0x format)",
    })
    .describe("The wallet address of user to fetch historical orders"),
});

export type GetOrdersInput = z.infer<typeof getOrdersInputSchema>;
