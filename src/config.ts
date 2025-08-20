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

dotenv.config();

const hyperEvmConfig = defineChain({
  id: 11155111,
  name: "Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Sepolia Ether",
    symbol: "SEP",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.CHAIN_RPC_URL ||
          "https://sepolia.infura.io/v3/df64b46e42bf44cdac355be0ff027e2c",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Sepolia Etherscan",
      url: "https://sepolia.etherscan.io",
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
const account = privateKeyToAccount(parsedPrivateKey as `0x${string}`);

export const walletClient: WalletClient = createWalletClient({
  account: account,
  chain: hyperEvmConfig,
  transport: http(),
});
