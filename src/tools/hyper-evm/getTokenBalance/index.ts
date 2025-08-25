import { publicClient } from "../../../config.js";
import type { GetTokenBalanceInput } from "./schemas.js";
import { erc20Abi, isAddress } from "viem";

export async function getTokenBalance(contractDetails: GetTokenBalanceInput) {
  try {
    const contractAddress = contractDetails.contractAddress;
    const userAddress = contractDetails.userAddress;
    if (!isAddress(contractAddress)) {
      throw new Error(`Invalid HyperEVM address: ${contractAddress}`);
    }

    if (!isAddress(userAddress)) {
      throw new Error(`Invalid HyperEVM address: ${userAddress}`);
    }

    const balanceData = await publicClient.readContract({
      address: contractAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress],
    });

    const nameData = await publicClient.readContract({
      address: contractAddress,
      abi: erc20Abi,
      functionName: "name",
    });

    const symbolData = await publicClient.readContract({
      address: contractAddress,
      abi: erc20Abi,
      functionName: "symbol",
    });

    const tokenBalance = Number(balanceData) / 1e18;

    return {
      content: [
        {
          type: "text",
          text: `Token balance of ${nameData} for address ${userAddress}:\n• ${tokenBalance} ${symbolData}`,
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
