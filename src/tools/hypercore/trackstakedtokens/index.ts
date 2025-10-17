import { Hyperliquid } from "hyperliquid";
import type { GetStakedInput } from "./schema.js";

export async function getStakedtokens(stackingInputDetails: GetStakedInput) {
  try {
    const address = stackingInputDetails.userAddress;
    const isTestnet = stackingInputDetails.isTestnet;

    const sdk = new Hyperliquid({ testnet: isTestnet });

    const delegatorrwards = await sdk.info.getDelegatorRewards(address);
    const delegatorsummary = await sdk.info.getDelegatorSummary(address);

    const safeStringify = (obj: unknown) =>
      JSON.stringify(
        obj,
        (_, v) => (typeof v === "bigint" ? v.toString() : v),
        2
      );

    return {
      content: [
        {
          type: "text",
          text: `Delegator rewards for ${address}:\n${safeStringify(delegatorrwards)}\n\nDelegator summary:\n${safeStringify(delegatorsummary)}`,
        },
      ],
    };
  } catch (error) {
    throw new Error(
      `Failed to track staked token status: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
