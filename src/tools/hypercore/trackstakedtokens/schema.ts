import { z } from "zod";
import { isAddress } from "viem";

export const StakedInputSchema = z.object({
  userAddress: z
    .string()
    .refine(address => isAddress(address), {
      message: "Must be a valid Ethereum address (0x format)",
    })
    .describe(
      "The address of the validator to stake to (must be a valid Ethereum address starting with 0x)."
    ),
  isTestnet: z
    .union([
      z.boolean(),
      z.string().transform(val => {
        if (val === "true" || val === "1") {
          return true;
        }
        if (val === "false" || val === "0") {
          return false;
        }
        throw new Error(
          "isTestnet must be a boolean or string representation of boolean"
        );
      }),
    ])
    .describe(
      "Set to true if staking on testnet, false for mainnet. Accepts boolean or string 'true'/'false'."
    ),
});

export type GetStakedInput = z.infer<typeof StakedInputSchema>;
