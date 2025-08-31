import { z } from "zod";

export const getStakingInputSchema = z.object({
  amountToSend: z
    .string()
    .regex(/^\d+(\.\d+)?$/, {
      message: "Amount must be a positive number (as a string)",
    })
    .describe(
      "The amount of funds to stake, as a string representing a positive number (e.g., '0.1')."
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

export type getStakingInput = z.infer<typeof getStakingInputSchema>;
