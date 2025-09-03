import { Hyperliquid } from "hyperliquid";
import type { GetOrdersInput } from "./schemas.js";
import { isAddress } from "viem";

export async function getHistoricalOrders(userAddress: GetOrdersInput) {
  try {
    const address = userAddress.userAddress;
    if (!isAddress(address)) {
      throw new Error(`Invalid HyperEVM address: ${address}`);
    }

    const sdk = new Hyperliquid();

    const response = await sdk.info.getHistoricalOrders(address);

    return {
      content: [
        {
          type: "text",
          text: `Historical orders for address ${address}:\n• ${JSON.stringify(response, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching historical orders:", error);
    throw new Error(
      `Failed to fetch historical orders: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
