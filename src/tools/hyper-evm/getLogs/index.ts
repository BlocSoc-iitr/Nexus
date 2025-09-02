import type { GetLogsInput } from "./schemas.js";
import { publicClient } from "../../../config.js";
import { isAddress } from "viem";

function safeStringify(obj: any) {
  return JSON.stringify(
    obj,
    (_, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  );
}

export async function getLogs(params: GetLogsInput) {
  try {
    const from = params.from ? BigInt(params.from) : 0n;
    const to = params.to ? BigInt(params.to) : 1000n;
    const address = params.contractAddress;

    if (!isAddress(address)) {
      throw new Error(`Invalid HyperEVM address: ${address}`);
    }

    const response = await publicClient.getLogs({
      address,
      fromBlock: from,
      toBlock: to,
    });

    return {
      content: [
        {
          type: "text",
          text: `Given ERC20 token Logs:\n• ${safeStringify(response)}`,
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching Logs:", error);
    throw new Error(
      `Failed to fetch Logs: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
