import type { GetBalanceInput } from "./schemas.js";
import { publicClient } from "../../../config.js";
import { isAddress } from "viem";

export async function getBalance(userAddress: GetBalanceInput) {
  try {
    const address = userAddress.userAddress;
    if (!isAddress(address)) {
      throw new Error(`Invalid HyperEVM address: ${address}`);
    }

    const balanceWei = await publicClient.getBalance({
      address: address as `0x${string}`,
    });

    const balanceHype = Number(balanceWei) / 1e18;

    return {
      content: [
        {
          type: "text",
          text: `Balance for address ${address}:\n• HYPE: ${balanceHype.toFixed(6)}\n• Wei: ${balanceWei.toString()}`,
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw new Error(
      `Failed to fetch balance: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
