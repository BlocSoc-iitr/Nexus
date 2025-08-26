import { z } from "zod";

const abiSchema = z.union([z.array(z.any()), z.record(z.any())]);

export const deployContractsSchema = z.object({
  abi: abiSchema.describe(
    "The ABI of the contract to deploy (can be array or JSON string)"
  ),
  bytecode: z.string().describe("The bytecode of the contract to deploy"),
  constructorArguments: z
    .array(z.any())
    .describe("The constructor arguments of the contract to deploy"),
});

export type DeployContractsInput = z.infer<typeof deployContractsSchema>;
