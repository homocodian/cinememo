FROM oven/bun as build

WORKDIR /app

COPY package.json ./
COPY bun.lock ./

COPY /apps/backend/package.json ./apps/backend/package.json

RUN bun install

COPY /apps/backend ./apps/backend

WORKDIR /app/apps/backend

ENV NODE_ENV=production

RUN bun build \
    --compile \
    --minify \
    --sourcemap \
    --outfile server \
    src/index.ts

RUN [ "chmod", "+x", "./server"]

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/apps/backend/server ./server

ENV NODE_ENV=production

EXPOSE 5500

CMD ["./server"]
