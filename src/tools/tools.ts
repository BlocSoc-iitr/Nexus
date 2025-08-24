import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getBalanceInputSchema } from "./hyper-evm/getBalance/schemas.js";
import { deployContractsSchema } from "./hyper-evm/DeployContracts/schemas.js";

export const GET_BALANCE_TOOL: Tool = {
  name: "get_balance",
  description: "Get the balance of a user address",
  inputSchema: {
    type: "object",
    properties: getBalanceInputSchema.shape,
    required: ["userAddress"],
  },
};

export const GET_LATEST_BLOCK_TOOL: Tool = {
  name: "get_latest_block",
  description: "Get the latest block number",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

export const DEPLOY_CONTRACTS_TOOL: Tool = {
  name: "deploy_contracts",
  description: "Deploy a contract",
  inputSchema: {
    type: "object",
    properties: deployContractsSchema.shape,
    required: ["abi", "bytecode", "constructorArguments"],
  },
};
