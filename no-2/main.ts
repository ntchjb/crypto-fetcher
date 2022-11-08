function getMaxProfit(prices: number[]): number {
  const len = prices.length;
  let maxPrices = 0;
  let maxProfit = 0;
  for (let i = len - 1; i > 0; i--) {
    // Get cumulative max price
    if (maxPrices < prices[i]) {
      maxPrices = prices[i];
    }
    // Compare the cumulative max price with the price before it
    const profit = maxPrices - prices[i - 1];
    if (maxProfit < profit) {
      maxProfit = profit;
    }
  }

  return maxProfit;
}

getMaxProfit([7, 1, 5, 3, 6, 4]);
