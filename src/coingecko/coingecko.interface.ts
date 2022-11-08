export interface Coin {
  id: string;
  symbol: string;
  name: string;
}

export type SearchCoin = Coin & {
  api_symbol: string;
  market_cap_rank: string;
  thumb: string;
  large: string;
};

export interface SearchResponse {
  coins: SearchCoin[];
}

export type SearchTrendingCoin = Coin & {
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  price_btc: number;
  slug: string;
  score: number;
};

export interface SearchTrendingResponse {
  coins: {
    item: SearchTrendingCoin;
  }[];
}

export interface ChartResponse {
  // [timestampMs, price]
  prices: [number, number][];
  // [timestampMs, price]
  market_caps: [number, number][];
  // [timestampMs, price]
  total_volumes: [number, number][];
}

export type OHLCPriceResponse = [number, number, number, number, number][];

export enum ChartInterval {
  DAY = 1,
  WEEK = 7,
  MONTH = 30,
}
