import { Hyperliquid } from "hyperliquid";
import type { FetchTransactionsInput } from "./schemas.js";

const RETRYABLE_ERROR_PATTERNS = [
  "422",
  "deserialize",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENETUNREACH",
] as const;

interface HistoricalOrder {
  coin?: string;
  side?: string;
  sz?: string;
  limitPx?: string;
  timestamp?: number;
  oid?: string | number;
  order?: {
    coin?: string;
    side?: string;
    sz?: string;
    limitPx?: string;
    timestamp?: number;
    oid?: string | number;
  };
}

function isHistoricalOrder(obj: any): obj is HistoricalOrder {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (typeof obj.coin === "string" ||
      (obj.order && typeof obj.order.coin === "string"))
  );
}

function isRetryableError(message: string): boolean {
  return RETRYABLE_ERROR_PATTERNS.some(pattern =>
    message.toLowerCase().includes(pattern.toLowerCase())
  );
}

export async function fetchTransactions(input: FetchTransactionsInput) {
  const { userAddress, lookbackBlocks = 500, limit = 50 } = input;

  try {
    // Initialize Hyperliquid SDK
    const sdk = new Hyperliquid();

    const endTimeSec = Math.floor(Date.now() / 1000);
    const startTimeSec = endTimeSec - lookbackBlocks * 2; // 2 seconds per block

    const results: Array<{
      type: string;
      coin?: string;
      side: string;
      size: string;
      price?: string;
      timestamp: number;
      orderId?: string;
      fillId?: string;
    }> = [];

    // Fetch user fills (completed trades)
    try {
      const userFills = await sdk.info.getUserFills(userAddress);
      if (userFills && Array.isArray(userFills)) {
        for (const fill of userFills) {
          if (fill.time >= startTimeSec && results.length < limit) {
            results.push({
              type: "Fill",
              coin: fill.coin,
              side: fill.side === "B" ? "Buy" : "Sell",
              size: fill.sz,
              price: fill.px,
              timestamp: fill.time,
              fillId: fill.hash,
            });
          }
        }
      }
    } catch (error) {
      console.warn("Could not fetch user fills:", error);
    }

    try {
      const maxAttempts = 3;
      const baseDelayMs = 300;
      let lastError: unknown = undefined;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const orderHistory = await sdk.info.getUserOrderHistory(
            userAddress,
            startTimeSec,
            endTimeSec
          );
          if (orderHistory && Array.isArray(orderHistory)) {
            for (const order of orderHistory) {
              if (results.length < limit) {
                results.push({
                  type: "Order",
                  coin: order.order.coin,
                  side: order.order.side === "B" ? "Buy" : "Sell",
                  size: order.order.sz,
                  price: order.order.limitPx,
                  timestamp: order.order.timestamp,
                  orderId: order.order.oid.toString(),
                });
              }
            }
          }
          lastError = undefined;
          break;
        } catch (err) {
          lastError = err;
          const message = err instanceof Error ? err.message : String(err);
          const isRetryable = isRetryableError(message);
          if (attempt < maxAttempts && isRetryable) {
            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            await new Promise(r => setTimeout(r, delay));
            continue;
          }
          throw err;
        }
      }
      if (lastError) {
        throw lastError;
      }
    } catch (error) {
      console.warn("Could not fetch order history:", error);
      try {
        const histRaw = await sdk.info.getHistoricalOrders(userAddress);
        const hist: HistoricalOrder[] = Array.isArray(histRaw) ? histRaw : [];

        for (const order of hist) {
          if (results.length >= limit) break;

          // Use type guard to safely access properties
          if (!isHistoricalOrder(order)) {
            continue;
          }

          try {
            const coin =
              order.order && typeof order.order.coin === "string"
                ? order.order.coin
                : typeof order.coin === "string"
                  ? order.coin
                  : "Unknown";

            const sideRaw =
              order.order && typeof order.order.side === "string"
                ? order.order.side
                : typeof order.side === "string"
                  ? order.side
                  : undefined;
            const side = sideRaw === "B" ? "Buy" : "Sell";

            const size =
              order.order && typeof order.order.sz === "string"
                ? order.order.sz
                : typeof order.sz === "string"
                  ? order.sz
                  : "Unknown";

            const price =
              order.order && typeof order.order.limitPx === "string"
                ? order.order.limitPx
                : typeof order.limitPx === "string"
                  ? order.limitPx
                  : "Unknown";

            const timestamp =
              order.order && typeof order.order.timestamp === "number"
                ? order.order.timestamp
                : typeof order.timestamp === "number"
                  ? order.timestamp
                  : 0;

            const oid =
              order.order &&
              (typeof order.order.oid === "string" ||
                typeof order.order.oid === "number")
                ? order.order.oid
                : typeof order.oid === "string" || typeof order.oid === "number"
                  ? order.oid
                  : undefined;

            results.push({
              type: "Order",
              coin,
              side,
              size,
              price,
              timestamp,
              orderId: oid !== undefined ? oid.toString() : "Unknown",
            });
          } catch {
            // Skip malformed entries
          }
        }
      } catch (fallbackError) {
        console.warn("Historical orders fallback failed:", fallbackError);
      }
    }

    try {
      const openOrders = await sdk.info.getUserOpenOrders(userAddress);
      if (openOrders && Array.isArray(openOrders)) {
        for (const order of openOrders) {
          if (results.length < limit) {
            results.push({
              type: "Open Order",
              coin: order.coin,
              side: order.side === "B" ? "Buy" : "Sell",
              size: order.sz,
              price: order.limitPx,
              timestamp: order.timestamp,
              orderId: order.oid.toString(),
            });
          }
        }
      }
    } catch (error) {
      console.warn("Could not fetch open orders:", error);
    }

    results.sort((a, b) => b.timestamp - a.timestamp);
    const limitedResults = results.slice(0, limit);

    if (limitedResults.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No Hyperliquid transactions found for ${userAddress} in the last ${lookbackBlocks} blocks (${Math.floor((endTimeSec - startTimeSec) / 3600)} hours).`,
          },
        ],
      };
    }

    const lines = limitedResults.map((r, i) => {
      const date = new Date(r.timestamp * 1000).toLocaleString();
      let line = `\n${i + 1}. ${r.type}`;
      line += `\n   Time: ${date}`;
      line += `\n   Coin: ${r.coin || "N/A"}`;
      line += `\n   Side: ${r.side}`;
      line += `\n   Size: ${r.size}`;

      if (r.price) {
        line += `\n   Price: ${r.price}`;
      }

      if (r.orderId) {
        line += `\n   Order ID: ${r.orderId}`;
      }

      if (r.fillId) {
        line += `\n   Fill ID: ${r.fillId}`;
      }

      line += `\n   ${"─".repeat(50)}`;
      return line;
    });

    return {
      content: [
        {
          type: "text",
          text: `Found ${limitedResults.length} Hyperliquid transaction(s) for ${userAddress} in the last ${Math.floor((endTimeSec - startTimeSec) / 3600)} hours.`,
        },
        { type: "text", text: lines.join("") },
      ],
    };
  } catch (error) {
    console.error("Error fetching Hyperliquid transactions:", error);
    throw new Error(
      `Failed to fetch Hyperliquid transactions: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
