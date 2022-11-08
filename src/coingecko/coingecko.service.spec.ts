import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import {
  ChartInterval,
  ChartResponse,
  OHLCPriceResponse,
  SearchResponse,
  SearchTrendingResponse,
} from './coingecko.interface';
import { CoinGeckoService } from './coingecko.service';

const getOKResponse = (data: any): AxiosResponse => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
});

describe('CoinGecko service', () => {
  let coingeckoService: CoinGeckoService;
  let httpService: HttpService;

  const baseUrl = 'https://api.coingecko.com/api/v3';

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [CoinGeckoService],
      imports: [
        ConfigModule,
        HttpModule.register({
          timeout: 30000,
          maxRedirects: 5,
        }),
      ],
    }).compile();

    coingeckoService = testModule.get<CoinGeckoService>(CoinGeckoService);
    httpService = testModule.get<HttpService>(HttpService);
  });

  describe('search', () => {
    it('should properly call search endpoint of Coingecko', async () => {
      const data: SearchResponse = {
        coins: [
          {
            id: 'coin-id-1',
            name: 'coin-name-1',
            symbol: 'coin-symbol-1',
            thumb: 'url-1',
            api_symbol: 'api-symbol-1',
            large: 'url-large-1',
            market_cap_rank: 1,
          },
          {
            id: 'coin-id-2',
            name: 'coin-name-2',
            symbol: 'coin-symbol-2',
            thumb: 'url-2',
            api_symbol: 'api-symbol-2',
            large: 'url-large-2',
            market_cap_rank: 2,
          },
        ],
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(of(getOKResponse(data)));

      const result = await coingeckoService.search('test');

      expect(httpService.get).toBeCalledWith(`${baseUrl}/search?query=test`);
      expect(result).toEqual([
        {
          id: 'coin-id-1',
          name: 'coin-name-1',
          symbol: 'coin-symbol-1',
          thumbImg: 'url-1',
          largeImg: 'url-large-1',
        },
        {
          id: 'coin-id-2',
          name: 'coin-name-2',
          symbol: 'coin-symbol-2',
          thumbImg: 'url-2',
          largeImg: 'url-large-2',
        },
      ]);
    });
  });

  describe('search trending', () => {
    it('should properly search a trend', async () => {
      const data: SearchTrendingResponse = {
        coins: [
          {
            item: {
              id: 'coin-id-1',
              name: 'coin-name-1',
              symbol: 'coin-symbol-1',
              thumb: 'url-1',
              price_btc: 0.1234,
              large: 'url-large-1',
              small: 'url-small-1',
              market_cap_rank: 1,
              score: 11,
              slug: 'slug-1',
            },
          },
          {
            item: {
              id: 'coin-id-2',
              name: 'coin-name-2',
              symbol: 'coin-symbol-2',
              thumb: 'url-2',
              price_btc: 0.5678,
              large: 'url-large-2',
              small: 'url-small-2',
              market_cap_rank: 2,
              score: 2,
              slug: 'slug-2',
            },
          },
        ],
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(of(getOKResponse(data)));

      const result = await coingeckoService.searchTrending();

      expect(httpService.get).toBeCalledWith(`${baseUrl}/search/trending`);
      expect(result).toEqual([
        {
          id: 'coin-id-2',
          name: 'coin-name-2',
          symbol: 'coin-symbol-2',
          thumbImg: 'url-2',
          largeImg: 'url-large-2',
          smallImg: 'url-small-2',
          priceBtc: 0.5678,
          marketCapRank: 2,
        },
        {
          id: 'coin-id-1',
          name: 'coin-name-1',
          symbol: 'coin-symbol-1',
          thumbImg: 'url-1',
          largeImg: 'url-large-1',
          smallImg: 'url-small-1',
          priceBtc: 0.1234,
          marketCapRank: 1,
        },
      ]);
    });
  });

  describe('get price chart', () => {
    it('should properly get price chart', async () => {
      const data: ChartResponse = {
        prices: [
          [1111, 5.67],
          [1112, 5.68],
          [1113, 5.69],
        ],
        market_caps: [
          [1111, 9999],
          [1112, 9999.9],
          [1113, 9999.99],
        ],
        total_volumes: [
          [1111, 8888],
          [1112, 8888.8],
          [1113, 8888.88],
        ],
      };
      const coinId = 'test-coin';
      const interval = ChartInterval.WEEK;

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(of(getOKResponse(data)));

      const result = await coingeckoService.getPriceChart(coinId, interval);

      expect(httpService.get).toBeCalledWith(
        `${baseUrl}/coins/test-coin/market_chart?vs_currency=usd&days=7`,
      );
      expect(result).toEqual({
        marketCaps: data.market_caps,
        totalVolumes: data.total_volumes,
        prices: data.prices,
      });
    });
  });

  describe('get price OHLC', () => {
    it('should properly get price OHLC', async () => {
      const data: OHLCPriceResponse = [
        [1111, 5.5, 6.8, 3.49, 5.67],
        [1112, 5.6, 6.9, 3.5, 5.68],
        [1113, 5.62, 6.7, 3.4, 6],
      ];
      const coinId = 'test-coin';
      const interval = ChartInterval.WEEK;

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(of(getOKResponse(data)));

      const result = await coingeckoService.getPriceOHLC(coinId, interval);

      expect(httpService.get).toBeCalledWith(
        `${baseUrl}/coins/test-coin/ohlc?vs_currency=usd&days=7`,
      );
      expect(result).toEqual(data);
    });
  });
});
