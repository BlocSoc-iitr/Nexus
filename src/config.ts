import { createPublicClient, http, defineChain } from "viem";
import dotenv from "dotenv";

dotenv.config();

const hyperEvmConfig = defineChain({
  id: parseInt(process.env.CHAIN_ID || "11155111", 10),
  name: "Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
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
      name: "Sepolia Explorer",
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

//HyperEVM
//998
//https://hyperliquid-testnet.drpc.org
//https://testnet.purrsec.com/