## Introduction

Nexus is a Model Context Protocol (MCP) server that makes a set of blockchain tools available for the Hyperliquid EVM chain through a standard tool interface. It lets AI agents and clients that work with MCP safely query the state of the chain and do things on-chain through validated tool calls.

### What is an MCP server?

A Model Context Protocol (MCP) server is an open standard for connecting AI agents to external tools and data.

An MCP server:

- Provides a list of tools with JSON schemas for inputs/outputs
- Communicates over stdio or network transports
- Handles requests like "list tools" and "call tool" in a consistent, typed manner

### How it Eases Workflow

MCP servers offer a schema-driven interface that removes the need for custom integrations. Tools are easy for agents to discover, validate, and call, whether running locally (stdio) or remotely (network).

### Benefits

- **Interoperability** – Works with any MCP-compliant client
- **Scalability** – Add or update tools without reworking integrations
- **Reliability** – Typed schemas reduce runtime errors

### Why Hyperliquid?

- High-performance EVM environment with fast finality and low fees
- Familiar EVM tooling (ABIs, RPC, wallets) via `viem`
- Built-in staking capabilities for HYPE tokens

## Architecture

Below is the complete architecture of Nexus

![Architecture](images/architecture.png)

## Implemented tools

The server currently exposes the following tools (see `src/tools/tools.ts`):

- get_latest_block: Get the latest block number
- get_balance: Get native token balance for an user address
- send_funds: Send native funds from the configured signer to a receiver
- deploy_contracts: Deploy a contract with ABI, bytecode, constructor args
- get_transaction_receipt: Fetch a transaction receipt by hash
- stake: Stake HYPE tokens on Hyperliquid
- unstake: Unstake HYPE tokens from Hyperliquid
- call_contract_function: Call the function of a contract
- fetch_transactions: Fetch the transactions for an user address
- get_token_balance: Fetch the balance of an ERC20 token for an user address
- get_logs: Fetch the logs of any ERC20 token between two blocks
- get_historical_orders: Fetch the historical orders for an user address
- track_staked_tokens: Fetch the rewards and summary of staked tokens for an user address

Each tool validates inputs with `zod` and executes using `viem` on the configured Hyperliquid RPC.

## Getting started

### Prerequisites

- Node.js 18+
- A private key for actions that require signing (e.g., send funds, deploy, stake)

### Installation

### Option 1: Integration with Claude Desktop

To add this MCP server to Claude Desktop:

Create or edit the Claude Desktop configuration file at:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

You can easily access this file via the Claude Desktop app by navigating to **Claude > Settings > Developer > Edit Config**.

Add the following configuration:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "blocsociitr-nexus@latest"],
      "env": {
        "CHAIN_ID": "998",
        "CHAIN_RPC_URL": "https://hyperliquid-testnet.drpc.org",
        "BLOCK_EXPLORER_URL": "https://hyperevm-explorer.vercel.app/",
        "IS_TESTNET": "true",
        "PRIVATE_KEY": "your_private_key_here"
      }
    }
  }
}
```

⚠️ Important:

1.  Replace YOUR_PRIVATE_KEY_HERE with your actual private key
2.  Your private key MUST start with 0x
3.  Restart Claude Desktop after saving the config

### Option 2: Run Locally (For Contributing or Development)

Clone this repository:

```bash
git clone https://github.com/blocsociitr/nexus.git
cd nexus
```

Install dependencies:

```bash
npm install
```

Build the project:

```bash
npm run build
```

### Configuration

Create a `.env` file with your credentials:

```bash
# Hyperliquid EVM Configuration
# Chain ID for Hyperliquid EVM
# Use 998 for Hyperliquid Testnet, 1 for Mainnet
CHAIN_ID=998

# RPC endpoint for Hyperliquid EVM
# Testnet: https://hyperliquid-testnet.drpc.org
# Mainnet: https://hyperliquid.drpc.org
CHAIN_RPC_URL=https://hyperliquid-testnet.drpc.org

# Block explorer URL
# Testnet: https://hyperevm-explorer.vercel.app/
# Mainnet: https://explorer.hyperliquid.io/
BLOCK_EXPLORER_URL=https://hyperevm-explorer.vercel.app/

# Set to true for testnet, false for mainnet
IS_TESTNET=true

# Your private key
PRIVATE_KEY=your_private_key_here
```

### Build and Run

```bash
npm run build
npm start
```

You should see: "Hyperliquid MCP Server running on stdio".

### Development

- Build: `npm run build`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Format: `npm run format`

## Project structure

```
src/
  main.ts                 # MCP server bootstrap and handlers
  client.ts               # viem wallet client configured from .env
  config.ts               # chain configuration (Hyperliquid EVM)
  tools/                  # tool definitions and implementations
    tools.ts              # Tool metadata + schemas for MCP
    hyper-evm/            # EVM-specific tool implementations
    hyper-core/           # hyperCore specific tool implementations
```

## Team

- [Harrish](https://github.com/Haxry)
- [Veer](https://github.com/VeerChaurasia)
- [Akshat](https://github.com/dev-n-dough)
- [Abhivansh](https://github.com/akronim26)
- [Yash](https://github.com/YASH-ai-bit)
- [Yogita](https://github.com/yogitagoel)
- [Rishi](https://github.com/rishi-tal-12)
- [Soham](https://github.com/0xr10t)

## Contributing

We openly welcome contributions to Nexus from the broader web3 community. For details, refer to [CONTRIBUTION GUIDELINES](CONTRIBUTING.md).
