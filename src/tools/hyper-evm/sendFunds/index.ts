import { walletClient } from "../../../config.js";
import { isAddress, parseEther, parseGwei } from "viem";
import type { GetFundsInput } from "./schemas.js";

export async function sendFunds(transactionDetails: GetFundsInput) {
  try {
    const address = transactionDetails.receiverAddress;
    const amountWei = parseEther(transactionDetails.amountToSend);
    const maxFeePerGas = parseGwei(transactionDetails.maxFeePerGas || "20");
    const maxPriorityFeePerGas = parseGwei(
      transactionDetails.maxPriorityFeePerGas || "2"
    );

    if (!isAddress(address)) {
      throw new Error(`Invalid HyperEVM address: ${address}`);
    }

    const account = walletClient.account;

    if (!account) {
      throw new Error("No sender account found");
    }

    const transactionHash = await walletClient.sendTransaction({
      account,
      to: address as `0x${string}`,
      value: amountWei,
      chain: walletClient.chain,
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    });

    return {
      content: [
        {
          type: "text",
          text: `Transaction Hash: ${transactionHash}`,
        },
      ],
    };
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw new Error(
      `Failed to send transaction: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
