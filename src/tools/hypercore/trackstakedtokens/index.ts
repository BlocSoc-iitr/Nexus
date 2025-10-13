import { Hyperliquid } from "hyperliquid";
import type { GetStakedInput } from "./schema.js";
import { isAddress } from "viem";

export async function getStakedtokens(userAddress: GetStakedInput) {
  try {
    const address = userAddress.userAddress;
    if (!isAddress(address)) {
      throw new Error(`Invalid HyperEVM address: ${address}`);
    }

    const sdk = new Hyperliquid();

    const delegatorrwards = await sdk.info.getDelegatorRewards(address);
    const delegatorsummary = await sdk.info.getDelegatorSummary(address);

    return {
      content: [
        {
          type: `Delegator rewards for address ${address}:\n• ${JSON.stringify(delegatorrwards, null, 2)}   and Delegator summary for adddress ${address}:\n• ${JSON.stringify(delegatorsummary, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    console.error("Error tracking stacked tokens", error);
    throw new Error(
      `Failed to track staked token status: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
