import type { GetLogsInput } from "./schemas.js";
import { publicClient } from "../../../config.js";

function safeStringify(obj: any) {
  return JSON.stringify(
    obj,
    (_, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  );
}

export async function getLogs(params: GetLogsInput) {
  try {
    const from = params.from ? BigInt(params.from) : 31083400n;
    const to = params.to ? BigInt(params.to) : 31084400n;
    const wethAddress = "0xADcb2f358Eae6492F61A5F87eb8893d09391d160";

    const response = await publicClient.getLogs({
      address: wethAddress,
      fromBlock: from,
      toBlock: to,
    });

    return {
      content: [
        {
          type: "text",
          text: `WETH Logs:\n• ${safeStringify(response)}`,
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
