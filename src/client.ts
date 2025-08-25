import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hyperEvmConfig } from "./config.js";

export const walletClient = createWalletClient({
  chain: hyperEvmConfig,
  transport: http(process.env.CHAIN_RPC_URL),
});

// Only get JSON-RPC accounts in browser environment
// export const jsonRpcAccount = await walletClient.getAddresses().then(accounts => accounts[0])

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("PRIVATE_KEY environment variable is not set");
}

export const account = privateKeyToAccount(privateKey as `0x${string}`);
