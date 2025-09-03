import {
  createPublicClient,
  http,
  defineChain,
  createWalletClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";
import { privateKeySchema } from "./tools/hyper-evm/sendFunds/schemas.js";
import * as hyper from "@nktkas/hyperliquid";

dotenv.config();

export const hyperEvmConfig = defineChain({
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
        process.env.CHAIN_RPC_URL || "https://hyperliquid-testnet.drpc.org",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "HyperEVM Explorer",
      url: process.env.BLOCK_EXPLORER_URL || "https://testnet.purrsec.com/",
    },
  },
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: hyperEvmConfig,
  transport: http(),
});

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is required");
}

const parsedPrivateKey = privateKeySchema.parse(process.env.PRIVATE_KEY);
export const account = privateKeyToAccount(parsedPrivateKey as `0x${string}`);

export const walletClient: WalletClient = createWalletClient({
  account: account,
  chain: hyperEvmConfig,
  transport: http(),
});

export const transport = new hyper.HttpTransport({
  isTestnet: true,
  timeout: 30000,
});

export const exchClient = new hyper.ExchangeClient({
  wallet: walletClient,
  transport: transport,
  isTestnet: true,
  signatureChainId: process.env.isTestnet ? "0x66eee" : "0x1",
});

export const infoClient = new hyper.InfoClient({ transport });
