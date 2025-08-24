import { createPublicClient, http, defineChain } from "viem";
import dotenv from "dotenv";

dotenv.config();

const hyperEvmConfig = defineChain({
  id: parseInt("998", 10),
  name: "HyperEVM",
  nativeCurrency: {
    decimals: 18,
    name: "HyperEVM",
    symbol: "HYPE",
  },
  rpcUrls: {
    default: {
      http: ["https://hyperliquid-testnet.drpc.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "HyperEVM Explorer",
      url: "https://testnet.purrsec.com/",
    },
  },
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: hyperEvmConfig,
  transport: http(),
});

export const hyperEvmTestnet = hyperEvmConfig;


