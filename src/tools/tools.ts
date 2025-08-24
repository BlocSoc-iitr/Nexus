import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getBalanceInputSchema } from "./hyper-evm/getBalance/schemas.js";
import { sendFundsInputSchema } from "./hyper-evm/sendFunds/schemas.js";

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

export const SEND_FUNDS_TOOL: Tool = {
  name: "send_funds",
  description: "Send funds between two wallets",
  inputSchema: {
    type: "object",
    properties: sendFundsInputSchema.shape,
    required: ["receiverAddress", "amountToSend"],
  },
};
