import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { GET_BALANCE_TOOL, GET_LATEST_BLOCK_TOOL,CALL_CONTRACT_FUNCTION } from "./tools/tools.js";
import { getBalance } from "./tools/hyper-evm/getBalance/index.js";
import { getLatestBlock } from "./tools/hyper-evm/getBlockNumber/index.js";
import { callContracts } from "./tools/hyper-evm/callContracts/index.js";
import { CallContractSchema } from "./tools/hyper-evm/callContracts/schema.js";

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
          
            case "call_contract_function": {
  try {
    const { contractAddress, functionName, abi, functionArgs, privateKey } = args as {
      contractAddress: string;
      functionName: string;
      abi: any;
      functionArgs?: any[];
      privateKey?: string;
    };

    const validatedInput = CallContractSchema.parse({
      contractAddress,
      functionName,
      abi,
      functionArgs,
      privateKey,
    });

    const result = await callContracts(validatedInput);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            result,
            (_, v) => (typeof v === "bigint" ? v.toString() : v),
            2
          ),
        },
      ],
    };
  } catch (validationError) {
    console.error("Validation error:", validationError);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            validationError instanceof Error
              ? validationError.message
              : String(validationError)
          }`,
        },
      ],
    };
  }
}


          default:
            throw new Error(
              `Tool '${name}' not found. Available tools: get_latest_block, get_balance, call_contract_function`
            );
      

       
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
      tools: [GET_LATEST_BLOCK_TOOL, GET_BALANCE_TOOL,CALL_CONTRACT_FUNCTION],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Hyperliquid MCP Server running on stdio");
}

main().catch(error => {
  console.error("Fatal error in main():", error);
});
