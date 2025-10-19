import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getBalanceInputSchema } from "./hyper-evm/getBalance/schemas.js";
import { CallContractSchema } from "./hyper-evm/callContracts/schema.js";
import { deployContractsSchema } from "./hyper-evm/deployContracts/schemas.js";
import { sendFundsInputSchema } from "./hyper-evm/sendFunds/schemas.js";
import { getTransactionReceiptInputSchema } from "./hyper-evm/getTransactionReceipt/schemas.js";
import { getTokenBalanceInputSchema } from "./hyper-evm/getTokenBalance/schemas.js";
import { fetchTransactionsInputSchema } from "./hyper-evm/fetchTransactions/schemas.js";
import {
  getStakingInputSchema,
  getUnstakingInputSchema,
} from "./hyper-evm/handleStake/schemas.js";
import { getLogsInputSchema } from "./hyper-evm/getLogs/schemas.js";
import { getOrdersInputSchema } from "./hypercore/getHistoricalOrders/schemas.js";
import { StakedInputSchema } from "./hypercore/trackstakedtokens/schema.js";

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
    required: ["contractAddress", "functionName", "abi"],
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

export const SEND_FUNDS_TOOL: Tool = {
  name: "send_funds",
  description: "Send funds between two wallets",
  inputSchema: {
    type: "object",
    properties: sendFundsInputSchema.shape,
    required: ["receiverAddress", "amountToSend"],
  },
};

export const GET_TRANSACTION_RECEIPT_TOOL: Tool = {
  name: "get_transaction_receipt",
  description: "Get the receipt of a transaction",
  inputSchema: {
    type: "object",
    properties: getTransactionReceiptInputSchema.shape,
    required: ["txHash"],
  },
};

export const GET_TOKEN_BALANCE_TOOL: Tool = {
  name: "get_token_balance",
  description: "Get the balance of an ERC20 token of a user address",
  inputSchema: {
    type: "object",
    properties: getTokenBalanceInputSchema.shape,
    required: ["contractAddress", "userAddress"],
  },
};

export const FETCH_TRANSACTIONS_TOOL: Tool = {
  name: "fetch_transactions",
  description:
    "Fetch recent transactions involving a user address by scanning recent blocks",
  inputSchema: {
    type: "object",
    properties: fetchTransactionsInputSchema.shape,
    required: ["userAddress"],
  },
};

export const STAKE_TOOL: Tool = {
  name: "stake",
  description: "Stake HYPE tokens on Hyperliquid",
  inputSchema: {
    type: "object",
    properties: getStakingInputSchema.shape,
    required: ["amountToStake", "validatorAddress", "isTestnet"],
  },
};

export const UNSTAKE_TOOL: Tool = {
  name: "unstake",
  description: "Unstake HYPE tokens from Hyperliquid",
  inputSchema: {
    type: "object",
    properties: getUnstakingInputSchema.shape,
    required: ["amountToUnstake", "validatorAddress", "isTestnet"],
  },
};

export const GET_LOGS_TOOL: Tool = {
  name: "get_logs",
  description:
    "Get the logs of any ERC20 token(present on hyperliquid) between two blocks",
  inputSchema: {
    type: "object",
    properties: getLogsInputSchema.shape,
    requires: [],
  },
};

export const GET_HISTORICAL_ORDERS_TOOL: Tool = {
  name: "get_historical_orders",
  description:
    "Get the historical orders of a user address present on hyperliquid",
  inputSchema: {
    type: "object",
    properties: getOrdersInputSchema.shape,
    required: ["userAddress"],
  },
};

export const TRACK_STAKED_TOKENS: Tool = {
  name: "track_staked_tokens",
  description:
    "Get the rewards and summary of a user address present on hyperliquid",
  inputSchema: {
    type: "object",
    properties: StakedInputSchema.shape,
    required: ["userAddress", "isTestnet"],
  },
};
