# Copilot Instructions for Nexus

## Project Overview

- **Nexus** is a TypeScript project organized under `src/` and built to `build/`.
- The codebase is modular, with a focus on EVM-related tooling (see `src/tools/hyper-evm/`).
- Major features are grouped by function (e.g., `getBalance`, `getBlockNumber`), each with its own directory and clear separation of schemas and logic.

## Key Architectural Patterns

- **Entry Point:** `src/main.ts` is the main entry for the application.
- **Configuration:** Centralized in `src/config.ts` and output to `build/config.js`.
- **Tooling:** Each tool (e.g., `getBalance`) has an `index.ts` (logic) and `schemas.ts` (data validation/types).
- **Build Output:** All compiled JS and type definitions are in `build/`, mirroring the `src/` structure.

## Developer Workflows

- **Build:** Use `npm run build` (if defined in `package.json`) or `tsc` to compile TypeScript to `build/`.
- **Debug:** Work in `src/`, not `build/`. Do not edit files in `build/` directly.
- **Add Tools:** To add a new EVM tool, create a new directory under `src/tools/hyper-evm/` with `index.ts` and `schemas.ts`.

## Conventions & Patterns

- **TypeScript Only:** All source code is TypeScript. No JavaScript in `src/`.
- **Schema Separation:** Data schemas/types are always in `schemas.ts`.
- **Flat Exports:** Tools are exported via their `index.ts`.
- **No Business Logic in Config:** `config.ts` is for configuration only.

## Integration Points

- **EVM Integration:** Tools in `src/tools/hyper-evm/` interact with EVM-compatible chains (see `getBalance`, `getBlockNumber`).
- **External Dependencies:** Managed via `package.json`.

## Examples

- To add a new tool for EVM:
  1. Create `src/tools/hyper-evm/myTool/index.ts` and `schemas.ts`.
  2. Export logic from `index.ts`, types from `schemas.ts`.
  3. Update any central registry if present (not found in current codebase).

## References

- Main entry: `src/main.ts`
- Config: `src/config.ts`
- Tool pattern: `src/tools/hyper-evm/getBalance/`, `src/tools/hyper-evm/getBlockNumber/`

---

_If any conventions or workflows are unclear, please request clarification or point to missing patterns._
