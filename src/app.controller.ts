import {
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Query,
} from '@nestjs/common';
import { Chart, Coin, OHLCPrice, TrendingCoin } from './price/price.model';
import { CoinGeckoService } from './coingecko/coingecko.service';
import { ChartInterval } from './coingecko/coingecko.interface';
import { EnumValidationPipe } from './validation/enum.validation';
import { Cache } from 'cache-manager';

@Controller('/api')
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private coingeckoService: CoinGeckoService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async cache<T>(
    key: string,
    ttl: number,
    queryFunc: () => Promise<T>,
  ): Promise<T> {
    let data = await this.cacheManager.get<T>(key);
    this.logger.debug('cached data', key, data);
    // Check for null and undefined
    if (data == null) {
      data = await queryFunc();
      await this.cacheManager.set(key, data, ttl);
    }
    return data;
  }

  @Get('/search')
  public async searchCoins(@Query('query') query: string): Promise<Coin[]> {
    const cacheKey = `api:search:${query}`;
    return this.cache(cacheKey, 86400, () =>
      this.coingeckoService.search(query),
    );
  }

  @Get('/search/trending')
  public async getTrendingCoins(): Promise<TrendingCoin[]> {
    const cacheKey = `api:search:trending`;
    return this.cache(cacheKey, 86400, () =>
      this.coingeckoService.searchTrending(),
    );
  }

  @Get('/coins/:coinId/chart')
  public async getCoinChart(
    @Param('coinId') coinId: string,
    @Query('interval', new EnumValidationPipe(ChartInterval))
    interval: ChartInterval,
  ): Promise<Chart> {
    const cacheKey = `api:coins:${coinId}:chart`;
    let ttl = 10;
    switch (interval) {
      case ChartInterval.DAY:
        ttl = 300;
        break;
      case ChartInterval.WEEK:
      case ChartInterval.MONTH:
        ttl = 3600;
        break;
    }
    return this.cache(cacheKey, ttl, () =>
      this.coingeckoService.getPriceChart(coinId, interval),
    );
  }

  @Get('/coins/:coinId/ohlc')
  public async getOHLCChart(
    @Param('coinId') coinId: string,
    @Query('interval', new EnumValidationPipe(ChartInterval))
    interval: ChartInterval,
  ): Promise<OHLCPrice> {
    const cacheKey = `api:coins:${coinId}:ohlc`;
    let ttl = 10;
    switch (interval) {
      case ChartInterval.DAY:
        ttl = 300;
        break;
      case ChartInterval.WEEK:
      case ChartInterval.MONTH:
        ttl = 3600;
        break;
    }
    return this.cache(cacheKey, ttl, () =>
      this.coingeckoService.getPriceOHLC(coinId, interval),
    );
  }
}
