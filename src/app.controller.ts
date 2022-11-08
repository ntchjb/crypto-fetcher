import { Controller, Get, Param, Query } from '@nestjs/common';
import { Chart, Coin, OHLCPrice, TrendingCoin } from './price/price.model';
import { CoinGeckoService } from './coingecko/coingecko.service';
import { ChartInterval } from './coingecko/coingecko.interface';
import { EnumValidationPipe } from './validation/enum.validation';

export enum Interval {
  DAY,
  WEEK,
  MONTH,
}

@Controller('/api')
export class AppController {
  constructor(private coingeckoService: CoinGeckoService) {}

  @Get('/search')
  public async searchCoins(@Query('query') query: string): Promise<Coin[]> {
    return this.coingeckoService.search(query);
  }

  @Get('/search/trending')
  public async getTrendingCoins(): Promise<TrendingCoin[]> {
    return this.coingeckoService.searchTrending();
  }

  @Get('/coins/:coinId/chart')
  public async getCoinChart(
    @Param('coinId') coinId: string,
    @Query('interval', new EnumValidationPipe(ChartInterval))
    interval: ChartInterval,
  ): Promise<Chart> {
    return this.coingeckoService.getPriceChart(coinId, interval);
  }

  @Get('/coins/:coinId/ohlc')
  public async getOHLCChart(
    @Param('coinId') coinId: string,
    @Query('interval', new EnumValidationPipe(ChartInterval))
    interval: ChartInterval,
  ): Promise<OHLCPrice> {
    return this.coingeckoService.getPriceOHLC(coinId, interval);
  }
}
