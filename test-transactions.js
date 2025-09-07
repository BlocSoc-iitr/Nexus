import { Hyperliquid } from 'hyperliquid';

async function testTransactionFetching() {
  try {
    console.log('🧪 Testing Hyperliquid Transaction Fetching...\n');
    
    // Initialize SDK
    const sdk = new Hyperliquid();
    await sdk.connect();
    console.log('✅ SDK connected to Hyperliquid');
    
    // Test with multiple addresses that might have activity
    const testAddresses = [
      '0x8B396ddF906D552b2Fd417774Ea8Dd4C4C8b3C4C', // Original test address
      '0x0000000000000000000000000000000000000000',    // Zero address (should have no activity)
      '0x1234567890123456789012345678901234567890',    // Test address
    ];
    
    for (const testAddress of testAddresses) {
      console.log(`\n🔍 Testing address: ${testAddress}`);
      console.log('─'.repeat(60));
      
      // Test with different time ranges
      const timeRanges = [
        { name: 'Last 100 blocks (~3 minutes)', blocks: 100 },
        { name: 'Last 1000 blocks (~33 minutes)', blocks: 1000 },
        { name: 'Last 10000 blocks (~5.5 hours)', blocks: 10000 },
      ];
      
      for (const timeRange of timeRanges) {
        console.log(`\n⏰ ${timeRange.name}`);
        
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - (timeRange.blocks * 2); // 2 seconds per block
        
        const results = [];
        
        // Test 1: Fetch user fills (completed trades)
        try {
          const userFills = await sdk.info.getUserFills(testAddress);
          if (userFills && Array.isArray(userFills)) {
            console.log(`   📊 Fills: ${userFills.length} total`);
            for (const fill of userFills) {
              if (fill.time >= startTime && results.length < 5) {
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
          console.log(`   ❌ Fills error: ${error.message}`);
        }
        
        // Test 2: Fetch user order history (with error handling)
        try {
          const orderHistory = await sdk.info.getUserOrderHistory(testAddress, startTime, endTime);
          if (orderHistory && Array.isArray(orderHistory)) {
            console.log(`   📋 Orders: ${orderHistory.length} total`);
            for (const order of orderHistory) {
              if (results.length < 5) {
                try {
                  results.push({
                    type: 'Order',
                    coin: order.order?.coin || 'Unknown',
                    side: order.order?.side === 'B' ? 'Buy' : 'Sell',
                    size: order.order?.sz || 'Unknown',
                    price: order.order?.limitPx || 'Unknown',
                    timestamp: order.order?.timestamp || 0,
                    orderId: order.order?.oid?.toString() || 'Unknown',
                  });
                } catch (orderError) {
                  console.log(`   ⚠️  Order parsing error: ${orderError.message}`);
                }
              }
            }
          }
        } catch (error) {
          console.log(`   ❌ Order history error: ${error.message}`);
          // Try to get more details about the error
          if (error.response) {
            console.log(`   📄 Response status: ${error.response.status}`);
            console.log(`   📄 Response data: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
          }
        }
        
        // Test 3: Fetch open orders
        try {
          const openOrders = await sdk.info.getUserOpenOrders(testAddress);
          if (openOrders && Array.isArray(openOrders)) {
            console.log(`   ⏳ Open orders: ${openOrders.length} total`);
            for (const order of openOrders) {
              if (results.length < 5) {
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
          console.log(`   ❌ Open orders error: ${error.message}`);
        }
        
        // Display results for this time range
        if (results.length > 0) {
          console.log(`\n   📈 Found ${results.length} transactions in this time range:`);
          results.forEach((r, i) => {
            const date = new Date(r.timestamp * 1000).toLocaleString();
            console.log(`      ${i + 1}. ${r.type} - ${r.coin} ${r.side} ${r.size}`);
          });
        } else {
          console.log(`   📈 No transactions found in this time range`);
        }
      }
    }
    
    console.log('\n🎉 Transaction fetching test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testTransactionFetching();
