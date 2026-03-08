FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
RUN rm -rf /usr/local/lib/node_modules/npm
WORKDIR /app

FROM base AS deps

COPY package.json lerna.json yarn.lock* ./
COPY ./packages/host/package.json ./packages/host/
COPY ./packages/server-common/package.json ./packages/server-common/
COPY ./packages/client-common/package.json ./client-packages/common/

RUN yarn install --frozen-lockfile

FROM base as builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/host/node_modules ./packages/host/node_modules
#node_modules 가 없음
#COPY --from=deps /app/packages/server-common/node_modules ./packages/server-common/node_modules

COPY package.json lerna.json yarn.lock* ./

COPY ./packages/host ./packages/host
COPY ./packages ./packages

RUN NODE_OPTIONS="--max-old-space-size=4096" yarn workspace @nextpr/host build

FROM base AS runner

#RUN addgroup --system --gid 1001 nodejs
#RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/packages/host/.next/standalone/ ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/host/.next/static ./packages/host/.next/static

COPY ./packages/host/start.sh ./packages/host/
#RUN chmod +x /app/packages/host/start.sh

CMD ["yarn", "workspace", "@nextpr/host", "run", "run"]
