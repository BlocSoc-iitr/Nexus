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
      http: [
        process.env.CHAIN_RPC_URL || "",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "HyperEVM Explorer",
      url:
        process.env.BLOCK_EXPLORER_URL ||
        "",
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

//Sepolia
//11155111
//https://sepolia.infura.io/v3/df64b46e42bf44cdac355be0ff027e2c
//https://sepolia.etherscan.io
