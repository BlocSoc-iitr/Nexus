import { publicClient } from "../../../config.js";
import type { getTransactionReceiptInput } from "./schemas.js";

export async function getTransactionReceipt(input: getTransactionReceiptInput) {
  let { txHash } = input;
  if (!txHash.startsWith("0x")) txHash = "0x" + txHash;

  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt) {
      return {
        content: [
          { type: "text", text: `No transaction found for hash: ${txHash}` },
        ],
      };
    }

    const isContractCreation = receipt.to === null;
    const explorerUrl =
      `${process.env.BLOCK_EXPLORER_URL}tx/${txHash}` ||
      `https://testnet.purrsec.com/${txHash}`;

    const gasEth = receipt.effectiveGasPrice
      ? `${((Number(receipt.gasUsed) * Number(receipt.effectiveGasPrice)) / 1e18).toFixed(6)} ETH`
      : `${receipt.gasUsed.toString()} gas`;

    return {
      content: [
        {
          type: "text",
          text: `Status: ${receipt.status === "success" ? "Success" : "Failed"}`,
        },
        {
          type: "text",
          text: `Block: ${receipt.blockNumber.toLocaleString()}`,
        },
        {
          type: "text",
          text: `BlockHash: ${receipt.blockHash}`,
        },
        {
          type: "text",
          text: `From: ${receipt.from}`,
        },
        {
          type: "text",
          text: `To: ${isContractCreation ? `Contract Creation: ${receipt.contractAddress}` : receipt.to}`,
        },
        {
          type: "text",
          text: `Gas Used: ${receipt.gasUsed.toString()} (${gasEth})`,
        },
        { type: "text", text: `Logs: ${receipt.logs?.length ?? 0} events` },
        { type: "text", text: "View on Etherscan", href: explorerUrl },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching transaction receipt: ${error.message || error}`,
        },
      ],
    };
  }
}
