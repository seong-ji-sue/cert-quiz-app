FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
RUN rm -rf /usr/local/lib/node_modules/npm
WORKDIR /app

FROM base AS deps

COPY package.json lerna.json yarn.lock* ./
COPY ./packages/remote/package.json ./packages/remote/
COPY ./packages/server-common/package.json ./packages/server-common/
COPY ./packages/client-common/package.json ./client-packages/common/


RUN yarn install --frozen-lockfile

FROM base as builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/remote/node_modules ./packages/remote/node_modules
#node_modules 가 없음
#COPY --from=deps /app/packages/server-common/node_modules ./packages/server-common/node_modules

COPY package.json lerna.json yarn.lock* ./

COPY ./packages/remote ./packages/remote
COPY ./packages ./packages

RUN NODE_OPTIONS="--max-old-space-size=4096" yarn workspace @nextpr/remote build

FROM base AS runner

#RUN addgroup --system --gid 1001 nodejs
#RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/packages/remote/.next/standalone/ ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/remote/.next/static ./packages/remote/.next/static

COPY ./packages/remote/start.sh ./packages/remote/
#RUN chmod +x /app/packages/remote/start.sh

CMD ["yarn", "workspace", "@nextpr/remote", "run", "run"]
