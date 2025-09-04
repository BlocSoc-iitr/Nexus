import { z } from "zod";
import { isAddress } from "viem";

export const privateKeySchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, {
    message: "Must be a valid private key (0x + 64 hex chars)",
  })
  .describe(
    "Private key in 0x-prefixed hex format, 64 characters long (32 bytes)."
  );

export const sendFundsInputSchema = z.object({
  receiverAddress: z
    .string()
    .refine(address => isAddress(address), {
      message: "Must be a valid HyperEVM address (0x format)",
    })
    .describe(
      "The wallet address of the user to send funds to (must be a valid HyperEVM address starting with 0x)."
    ),
  amountToSend: z
    .string()
    .regex(/^\d+(\.\d+)?$/, {
      message: "Amount must be a positive number (as a string)",
    })
    .describe(
      "The amount of funds to send, as a string representing a positive number (e.g., '0.1')."
    ),
  maxFeePerGas: z
    .string()
    .regex(/^\d+(\.\d+)?$/, {
      message: "Max fee must be a positive number (as a string)",
    })
    .optional()
    .describe(
      "The maximum amount of fee per gas to send, as a string representing a positive number (e.g., '20'). Defaults to '20' if not specified."
    ),
  maxPriorityFeePerGas: z
    .string()
    .regex(/^\d+(\.\d+)?$/, {
      message: "Max priority fee must be a positive number (as a string)",
    })
    .optional()
    .describe(
      "The maximum amount of priority fee per gas to send, as a string representing a positive number (e.g., '0.1'). Defaults to '2' if not specified."
    ),
});

export type PrivateKey = z.infer<typeof privateKeySchema>;
export type GetFundsInput = z.infer<typeof sendFundsInputSchema>;
