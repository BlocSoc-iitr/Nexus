import { z } from "zod";
import { isAddress } from "viem";

export const CallContractSchema = z.object({
  contractAddress: z.string().refine(address => isAddress(address), {
    message: "Must be a valid HyperEVM address (0x format, 42 characters)",
  }),
  functionName: z.string().min(1, "Function name cannot be empty"),
  abi: z.union([z.string(), z.array(z.any())]),
  functionArgs: z.preprocess(val => {
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

export type GetContractDetails = z.infer<typeof CallContractSchema>;
