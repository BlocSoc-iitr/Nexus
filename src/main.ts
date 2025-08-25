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
  DEPLOY_CONTRACTS_TOOL,
  SEND_FUNDS_TOOL,
} from "./tools/tools.js";
import { getBalance } from "./tools/hyper-evm/getBalance/index.js";
import { getLatestBlock } from "./tools/hyper-evm/getBlockNumber/index.js";
import { deployContracts } from "./tools/hyper-evm/DeployContracts/index.js";
import type { DeployContractsInput } from "./tools/hyper-evm/DeployContracts/schemas.js";
import { sendFunds } from "./tools/hyper-evm/sendFunds/index.js";
import { sendFundsInputSchema } from "./tools/hyper-evm/sendFunds/schemas.js";

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

          case "deploy_contracts": {
            const input = args as DeployContractsInput;
            const result = await deployContracts(input);
            return result;
          }

          case "send_funds": {
            const { receiverAddress, amountToSend } = args as {
              receiverAddress: string;
              amountToSend: string;
            };

            const validatedInput = sendFundsInputSchema.parse({
              receiverAddress,
              amountToSend,
            });

            const result = await sendFunds(validatedInput);
            return result;
          }

          default: {
            throw new Error(
              `Tool '${name}' not found. Available tools: get_latest_block, get_balance, deploy_contracts, send_funds`
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
        DEPLOY_CONTRACTS_TOOL,
        SEND_FUNDS_TOOL,
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
