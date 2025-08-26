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
  functionArgs: z.array(z.any()).optional(),
  privateKey: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Private key must be 0x + 64 hex chars")
    .optional(),
});

export type GetContractDetails = z.infer<typeof CallContractSchema>;
