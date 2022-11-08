FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN yarn run build

ENV NODE_ENV production

RUN rm -rf ./node_modules && yarn install --production --frozen-lockfile && yarn cache clean

USER node

FROM node:18-alpine AS production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/src/main.js" ]
