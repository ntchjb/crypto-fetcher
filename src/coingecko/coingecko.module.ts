import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoinGeckoService } from './coingecko.service';

@Module({
  exports: [CoinGeckoService],
  providers: [CoinGeckoService],
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('COINGECKO_HTTP_TIMEOUT', 30000),
        maxRedirects: configService.get('COINGECKO_HTTP_MAX_REDIRECTS', 5),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class CoinGeckoModule {}
