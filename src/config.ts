import { createPublicClient,createWalletClient, http, defineChain } from "viem";
import dotenv from "dotenv";

dotenv.config();

export const hyperEvmConfig = defineChain({
  id: parseInt(process.env.CHAIN_ID || "11155111", 10),
  name: "HyperEVM",
  nativeCurrency: {
    decimals: 18,
    name: "HYPE",
    symbol: "HYPE",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.CHAIN_RPC_URL || "https://sepolia.infura.io/v3/df64b46e42bf44cdac355be0ff027e2c",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "HyperEVM Explorer",
      url:
        process.env.BLOCK_EXPLORER_URL ||
        "https://sepolia.etherscan.io",
    },
  },
  testnet: process.env.IS_TESTNET === "true",
});

export const publicClient = createPublicClient({
  chain: hyperEvmConfig,
  transport: http(),
});


