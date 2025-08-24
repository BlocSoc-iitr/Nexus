import { createPublicClient, http, defineChain } from "viem";
import dotenv from "dotenv";

dotenv.config();

const hyperEvmConfig = defineChain({
  id: parseInt(process.env.CHAIN_ID || "998", 10),
  name: "HyperEVM",
  nativeCurrency: {
    decimals: 18,
    name: "HyperEVM",
    symbol: "HYPE",
  },
  rpcUrls: {
    default: {
      http: [process.env.CHAIN_RPC_URL || ""],
    },
  },
  blockExplorers: {
    default: {
      name: "HyperEVM Explorer",
      url: process.env.BLOCK_EXPLORER_URL || "",
    },
  },
  testnet: process.env.IS_TESTNET === "true",
});

export const publicClient = createPublicClient({
  chain: hyperEvmConfig,
  transport: http(),
});

export const hyperEvmTestnet = hyperEvmConfig;


