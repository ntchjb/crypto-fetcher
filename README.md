# crypto-fetcher

A simple crypto price fetcher from Coingecko, with caching using Nest.js.

## Setup

```sh
# Install dependencies
yarn

# Start the server
yarn start

# Build the server, output to `dist` folder
yarn build

# Run unit tests
yarn test
```

## Dockerfile

Use `docker-compose.yaml` to run the server and its dependencies inside containers.

```sh
# build image
docker-compose build

# UP!
docker-compose up -d
```

## APIs

- `GET /api/coins/:coinId/chart?interval=` Get price chart for given crypto coin
  - `coinId`: coin ID provided by Coingecko
  - `interval`: interval enum. Can be `DAY`, `WEEK`, or `MONTH`.
- `GET /api/coins/:coinId/ohlc` Get candlestick chart for given crypto coin
  - `coinId`: coin ID provided by Coingecko
  - `interval`: interval enum. Can be `DAY`, `WEEK`, or `MONTH`.
- `GET /api/search?query=` Find coins based on query string from Coingecko
  - `query`: coin name to be searched
- `GET /api/search/trending` Gets trending coins from Coingecko

## Test No. 2

Test No. 2 can be found at `no-2` folder. It can be run by using `ts-node`.

```sh
ts-node ./no-2/main.ts
```
