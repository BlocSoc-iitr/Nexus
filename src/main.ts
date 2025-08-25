import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import {
  GET_BALANCE_TOOL,
  GET_LATEST_BLOCK_TOOL,
  SEND_FUNDS_TOOL,
  GET_TOKEN_BALANCE_TOOL,
} from "./tools/tools.js";
import { getBalance } from "./tools/hyper-evm/getBalance/index.js";
import { getLatestBlock } from "./tools/hyper-evm/getBlockNumber/index.js";
import { sendFunds } from "./tools/hyper-evm/sendFunds/index.js";
import { sendFundsInputSchema } from "./tools/hyper-evm/sendFunds/schemas.js";
import { getTokenBalanceInputSchema } from "./tools/hyper-evm/getTokenBalance/schemas.js";
import { getTokenBalance } from "./tools/hyper-evm/getTokenBalance/index.js";

async function main() {
  console.error("Starting Hyperliquid MCP server...");
  const server = new Server(
    {
      name: "hyperliquid",
      version: "0.0.1",
    },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received request:", request);
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case "get_latest_block": {
            const latestBlock = await getLatestBlock();
            return latestBlock;
          }

          case "get_balance": {
            const userAddress = (args as { userAddress: `0x${string}` })
              .userAddress;
            const balance = await getBalance({ userAddress });
            return balance;
          }

          case "send_funds": {
            const {
              receiverAddress,
              amountToSend,
              maxFeePerGas,
              maxPriorityFeePerGas,
            } = args as {
              receiverAddress: string;
              amountToSend: string;
              maxFeePerGas?: string;
              maxPriorityFeePerGas?: string;
            };

            const validatedInput = sendFundsInputSchema.parse({
              receiverAddress,
              amountToSend,
              maxFeePerGas,
              maxPriorityFeePerGas,
            });

            const result = await sendFunds(validatedInput);
            return result;
          }

          case "get_token_balance": {
            const { contractAddress, userAddress } = args as {
              contractAddress: string;
              userAddress: string;
            };

            const validatedInput = getTokenBalanceInputSchema.parse({
              contractAddress,
              userAddress,
            });

            const result = await getTokenBalance(validatedInput);
            return result;
          }

          default: {
            throw new Error(
              `Tool '${name}' not found. Available tools: get_latest_block, get_balance, send_funds, get_token_balance`
            );
          }
        }
      } catch (error) {
        console.error("Error handling request:", error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received ListToolsRequest");
    return {
      tools: [
        GET_LATEST_BLOCK_TOOL,
        GET_BALANCE_TOOL,
        SEND_FUNDS_TOOL,
        GET_TOKEN_BALANCE_TOOL,
      ],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Hyperliquid MCP Server running on stdio");
}

main().catch(error => {
  console.error("Fatal error in main():", error);
});
