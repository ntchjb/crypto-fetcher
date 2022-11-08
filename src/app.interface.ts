export interface Coin {
  id: string;
  symbol: string;
  name: string;
}

export type TrendyCoin = Coin & {
  marketCapRank: string;
  thumbImg: string;
  smallImg: string;
  largeImg: string;
  priceBtc: string;
};

export interface Chart {
  // [timestampMs, price]
  prices: [number, number][];
  // [timestampMs, price]
  marketCaps: [number, number][];
  // [timestampMs, price]
  totalVolumes: [number, number][];
}

// [timestampMs, open, high, low, close]
export type OHLCPrice = [number, number, number, number, number][];
