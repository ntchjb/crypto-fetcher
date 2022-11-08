import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { CoinGeckoModule } from './coingecko/coingecko.module';

@Module({
  imports: [ConfigModule.forRoot(), CoinGeckoModule, CacheModule.register()],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
