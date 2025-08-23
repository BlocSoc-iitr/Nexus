import { defineChain } from 'viem'

export const hyperevmTestnet = defineChain({
  id: 998,
  name: 'HyperEVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HyperEVM',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: ['https://hyperliquid-testnet.drpc.org'],
    },
    public: {
      http: ['https://hyperliquid-testnet.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HyperEVM Testnet Explorer',
      url: 'https://testnet.purrsec.com/',
    },
  },
  testnet: true,
})
