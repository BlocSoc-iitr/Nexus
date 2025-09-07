import { Hyperliquid } from 'hyperliquid';
import type { FetchTransactionsInput } from "./schemas.js";

export async function fetchTransactions(input: FetchTransactionsInput) {
  const { userAddress, lookbackBlocks = 500, limit = 50 } = input;

  try {

    // Initialize Hyperliquid SDK
    const sdk = new Hyperliquid();

    // Calculate time range based on lookbackBlocks (assuming ~2 second block time)
    const endTimeSec = Math.floor(Date.now() / 1000);
    const startTimeSec = endTimeSec - (lookbackBlocks * 2); // 2 seconds per block
    // Keep seconds for APIs that expect seconds

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
              type: 'Fill',
              coin: fill.coin,
              side: fill.side === 'B' ? 'Buy' : 'Sell',
              size: fill.sz,
              price: fill.px,
              timestamp: fill.time,
              fillId: fill.hash,
            });
          }
        }
      }
    } catch (error) {
      console.warn('Could not fetch user fills:', error);
    }

    // Fetch user order history with retry and fallback
    try {
      const maxAttempts = 3;
      const baseDelayMs = 300;
      let lastError: unknown = undefined;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          // API expects second timestamps
          const orderHistory = await sdk.info.getUserOrderHistory(userAddress, startTimeSec, endTimeSec);
          if (orderHistory && Array.isArray(orderHistory)) {
            for (const order of orderHistory) {
              if (results.length < limit) {
                results.push({
                  type: 'Order',
                  coin: order.order.coin,
                  side: order.order.side === 'B' ? 'Buy' : 'Sell',
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
          // If 422 or similar, backoff and retry
          const message = err instanceof Error ? err.message : String(err);
          const isRetryable = /422|deserialize|ECONNRESET|ETIMEDOUT|ENETUNREACH/i.test(message);
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
      console.warn('Could not fetch order history:', error);
      // Fallback: try getHistoricalOrders (no time bounds)
      try {
        const hist = await (async () => {
          try {
            // getHistoricalOrders returns an array of orders for the address
            // Types may differ slightly; we will normalize the essential fields used in results
            // @ts-ignore - SDK typing differences across versions
            const resp = await sdk.info.getHistoricalOrders(userAddress);
            return Array.isArray(resp) ? resp : [];
          } catch (e) {
            return [] as unknown[];
          }
        })();
        for (const order of hist) {
          if (results.length >= limit) break;
          try {
            results.push({
              type: 'Order',
              // @ts-ignore - best-effort normalization
              coin: order.order?.coin ?? order.coin ?? 'Unknown',
              // @ts-ignore
              side: (order.order?.side ?? order.side) === 'B' ? 'Buy' : 'Sell',
              // @ts-ignore
              size: order.order?.sz ?? order.sz ?? 'Unknown',
              // @ts-ignore
              price: order.order?.limitPx ?? order.limitPx ?? 'Unknown',
              // @ts-ignore
              timestamp: order.order?.timestamp ?? order.timestamp ?? 0,
              // @ts-ignore
              orderId: (order.order?.oid ?? order.oid)?.toString?.() ?? 'Unknown',
            });
          } catch {
            // Skip malformed entries
          }
        }
      } catch (fallbackError) {
        console.warn('Historical orders fallback failed:', fallbackError);
      }
    }

    // Fetch open orders
    try {
      const openOrders = await sdk.info.getUserOpenOrders(userAddress);
      if (openOrders && Array.isArray(openOrders)) {
        for (const order of openOrders) {
          if (results.length < limit) {
            results.push({
              type: 'Open Order',
              coin: order.coin,
              side: order.side === 'B' ? 'Buy' : 'Sell',
              size: order.sz,
              price: order.limitPx,
              timestamp: order.timestamp,
              orderId: order.oid.toString(),
            });
          }
        }
      }
    } catch (error) {
      console.warn('Could not fetch open orders:', error);
    }

    // Sort results by timestamp (newest first) and limit to requested amount
    results.sort((a, b) => b.timestamp - a.timestamp);
    const limitedResults = results.slice(0, limit);

    if (limitedResults.length === 0) {
      return {
        content: [{ 
          type: "text", 
          text: `No Hyperliquid transactions found for ${userAddress} in the last ${lookbackBlocks} blocks (${Math.floor((endTimeSec - startTimeSec) / 3600)} hours).` 
        }],
      };
    }

    const lines = limitedResults.map((r, i) => {
      const date = new Date(r.timestamp * 1000).toLocaleString();
      let line = `\n${i + 1}. ${r.type}`;
      line += `\n   Time: ${date}`;
      line += `\n   Coin: ${r.coin || 'N/A'}`;
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
      
      line += `\n   ${'─'.repeat(50)}`;
      return line;
    });

    return {
      content: [
        { 
          type: "text", 
          text: `Found ${limitedResults.length} Hyperliquid transaction(s) for ${userAddress} in the last ${Math.floor((endTimeSec - startTimeSec) / 3600)} hours.` 
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