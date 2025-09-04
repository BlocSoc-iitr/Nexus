import { createPublicClient,createWalletClient, http, defineChain,type WalletClient } from "viem";
import dotenv from "dotenv";
import { privateKeySchema } from "./tools/hyper-evm/callContracts/schema.js";
import { privateKeyToAccount } from "viem/accounts";

dotenv.config();

export const hyperEvmConfig = defineChain({
  id: parseInt(process.env.CHAIN_ID || "998", 10),
  name: "HyperEVM",
  nativeCurrency: {
    decimals: 18,
    name: "HYPE",
    symbol: "HYPE",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.CHAIN_RPC_URL || "https://hyperliquid-testnet.drpc.org",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "HyperEVM Explorer",
      url:
        process.env.BLOCK_EXPLORER_URL ||
        "https://testnet.purrsec.com/",
    },
  },
  testnet: process.env.IS_TESTNET === "true",
});
  if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is required");
}

const parsedPrivateKey = privateKeySchema.parse(process.env.PRIVATE_KEY);
 const account = privateKeyToAccount(parsedPrivateKey as `0x${string}`);

export const walletClient: WalletClient = createWalletClient({
  account: account,
  chain: hyperEvmConfig,
  transport: http(),
});

export const publicClient = createPublicClient({
  chain: hyperEvmConfig,
  transport: http(),
});


