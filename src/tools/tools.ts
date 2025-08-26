import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getBalanceInputSchema } from "./hyper-evm/getBalance/schemas.js";
import { CallContractSchema } from "./hyper-evm/callContracts/schema.js";

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

export const CALL_CONTRACT_FUNCTION: Tool = {
  name: "call_contract_function",
  description: "Call a contract function on HyperEVM",
  inputSchema: {
    type: "object",
    properties: CallContractSchema.shape,
    required: ["contractAddress","functionName","abi"],
  },
};
