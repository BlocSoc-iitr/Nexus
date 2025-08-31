import { walletClient } from "../../../config.js";
import type { getStakingInput } from "./schemas.js";
import { parseEther } from "viem";

const HYPERLIQUID_API = "https://api.hyperliquid.xyz/exchange";

export async function performStaking(stakingDetails: getStakingInput) {
  try {
    const isTestnet = Boolean(stakingDetails.isTestnet);

    const nonce = Date.now();
    const chainId = "0xa4b1";

    const stakingAction = {
      type: "cDeposit",
      signatureChainId: chainId,
      hyperliquidChain: isTestnet ? "Testnet" : "Mainnet",
      wei: parseEther(stakingDetails.amountToSend).toString(),
      nonce: nonce,
    };

    const stakingPayload = {
      stakingAction,
      nonce,
    };

    const account = walletClient.account;
    if (!account) {
      throw new Error("Failed to load wallet client account");
    }

    const stakingSignature = await walletClient.signMessage({
      account,
      message: JSON.stringify(stakingPayload),
    });

    const stakingBody = {
      ...stakingPayload,
      signature: stakingSignature,
    };

    const stakingResponse = await fetch(HYPERLIQUID_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stakingBody),
    });

    if (!stakingResponse.ok) {
      throw new Error(
        `Staking failed: ${stakingResponse.status} ${stakingResponse.statusText}`
      );
    }

    const responseData = await stakingResponse.json();

    return {
      content: [
        {
          type: "text",
          text: `Staking successful!\nAmount: ${stakingDetails.amountToSend} HYPE\nTransaction ID: ${responseData.txId || "N/A"}\nStatus: ${stakingResponse.status}`,
        },
      ],
    };
  } catch (error) {
    console.error("Error performing staking:", error);
    throw new Error(
      `Failed to perform staking: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function performUnstaking(unstakingDetails: getStakingInput) {
  try {
    const isTestnet = Boolean(unstakingDetails.isTestnet);

    const nonce = Date.now();
    const chainId = "0xa4b1";

    const unstakingAction = {
      type: "cWithdraw",
      signatureChainId: chainId,
      hyperliquidChain: isTestnet ? "Testnet" : "Mainnet",
      wei: parseEther(unstakingDetails.amountToSend).toString(),
      nonce: nonce,
    };

    const unstakingPayload = {
      unstakingAction,
      nonce,
    };

    const account = walletClient.account;
    if (!account) {
      throw new Error("Failed to load wallet client account");
    }

    const unstakingSignature = await walletClient.signMessage({
      account,
      message: JSON.stringify(unstakingPayload),
    });

    const unstakingBody = {
      ...unstakingPayload,
      signature: unstakingSignature,
    };

    const unstakingResponse = await fetch(HYPERLIQUID_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unstakingBody),
    });

    if (!unstakingResponse.ok) {
      throw new Error(
        `Unstaking failed: ${unstakingResponse.status} ${unstakingResponse.statusText}`
      );
    }

    const responseData = await unstakingResponse.json();

    return {
      content: [
        {
          type: "text",
          text: `Unstaking successful!\nAmount: ${unstakingDetails.amountToSend} HYPE\nTransaction ID: ${responseData.txId || "N/A"}\nStatus: ${unstakingResponse.status}`,
        },
      ],
    };
  } catch (error) {
    console.error("Error performing unstaking:", error);
    throw new Error(
      `Failed to perform unstaking: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
