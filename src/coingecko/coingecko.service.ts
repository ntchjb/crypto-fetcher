import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, ObservableInput, retry } from 'rxjs';
import { genericRetryStrategy } from 'src/http/retry';
import { URL } from 'url';
import {
  ChartInterval,
  ChartResponse,
  OHLCPriceResponse,
  SearchResponse,
  SearchTrendingResponse,
} from './coingecko.interface';
import { Chart, Coin, OHLCPrice, TrendingCoin } from '../price/price.model';

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private readonly baseUrl: string;
  private readonly retryStrategy: (
    error: any,
    retryCount: number,
  ) => ObservableInput<any>;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.baseUrl = configService.get<string>(
      'COINGECKO_BASEURL',
      'https://api.coingecko.com/api/v3/',
    );
    const maxRetry = configService.get<number>('COINGECKO_MAX_RETRY', 3);
    const scalingDuration = configService.get<number>(
      'COINGECKO_RETRY_DURATION',
      1000,
    );
    this.retryStrategy = genericRetryStrategy({
      maxRetryAttempts: maxRetry,
      scalingDuration: scalingDuration,
    });
    if (this.baseUrl[this.baseUrl.length - 1] !== '/') {
      this.baseUrl = `${this.baseUrl}/`;
    }
  }

  private getUrl(relativePath: string): string {
    return new URL(`./${relativePath}`, this.baseUrl).href;
  }

  private handleError(err: AxiosError): Error {
    // handle error here;
    return err;
  }

  public async search(query: string): Promise<Coin[]> {
    const data = await firstValueFrom(
      this.httpService
        .get<SearchResponse>(this.getUrl(`search?query=${query}`))
        .pipe(
          retry({
            delay: this.retryStrategy,
          }),
          catchError((error: AxiosError) => {
            this.logger.error('unable to search', 'err', error, 'query', query);

            throw this.handleError(error);
          }),
        ),
    );

    return data.data.coins.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
    }));
  }

  public async searchTrending(): Promise<TrendingCoin[]> {
    const data = await firstValueFrom(
      this.httpService
        .get<SearchTrendingResponse>(this.getUrl('search/trending'))
        .pipe(
          retry({
            delay: this.retryStrategy,
          }),
          catchError((error: AxiosError) => {
            this.logger.error('unable to search trending', 'err', error);

            throw this.handleError(error);
          }),
        ),
    );

    return data.data.coins
      .sort((a, b) => a.item.score - b.item.score)
      .map((coin) => ({
        id: coin.item.id,
        name: coin.item.name,
        symbol: coin.item.symbol,
        thumbImg: coin.item.thumb,
        smallImg: coin.item.small,
        largeImg: coin.item.large,
        marketCapRank: coin.item.market_cap_rank,
        priceBtc: coin.item.price_btc,
      }));
  }

  public async getPriceChart(
    coinId: string,
    interval: ChartInterval,
  ): Promise<Chart> {
    const data = await firstValueFrom(
      this.httpService
        .get<ChartResponse>(
          this.getUrl(
            `coins/${coinId}/market_chart?vs_currency=usd&days=${interval}`,
          ),
        )
        .pipe(
          retry({
            delay: this.retryStrategy,
          }),
          catchError((error: AxiosError) => {
            this.logger.error(
              'unable to get price chart',
              'err',
              error,
              'coinId',
              coinId,
              'interval',
              ChartInterval[interval],
            );

            throw this.handleError(error);
          }),
        ),
    );

    const { prices, market_caps, total_volumes } = data.data;
    return {
      marketCaps: market_caps,
      totalVolumes: total_volumes,
      prices: prices,
    };
  }

  public async getPriceOHLC(
    coinId: string,
    interval: ChartInterval,
  ): Promise<OHLCPrice> {
    const data = await firstValueFrom(
      this.httpService
        .get<OHLCPriceResponse>(
          this.getUrl(`coins/${coinId}/ohlc?vs_currency=usd&days=${interval}`),
        )
        .pipe(
          retry({
            delay: this.retryStrategy,
          }),
          catchError((error: AxiosError) => {
            this.logger.error(
              'unable to get price candlestick chart',
              'err',
              error,
              'coinId',
              coinId,
              'interval',
              ChartInterval[interval],
            );

            throw this.handleError(error);
          }),
        ),
    );

    return data.data;
  }
}
