import { z } from "zod";
import { isAddress } from "viem";

export const CallContractSchema = z.object({
  contractAddress: z
    .string()
    .refine(address => isAddress(address), {
      message: "Must be a valid HyperEVM address (0x format, 42 characters)",
    }),
  functionName: z.string().min(1, "Function name cannot be empty"),
  abi: z.union([z.string(), z.array(z.any())]), 
  functionArgs: z.preprocess((val) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return [val]; 
    }
  }
  return val;
}, z.array(z.any()).optional()),

});

export const privateKeySchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, {
    message: "Must be a valid private key (0x + 64 hex chars)",
  })
  .describe(
    "Private key in 0x-prefixed hex format, 64 characters long (32 bytes)."
  );

export type GetContractDetails = z.infer<typeof CallContractSchema>;
export type PrivateKey = z.infer<typeof privateKeySchema>;
