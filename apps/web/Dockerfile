FROM oven/bun

# Define build arguments for environment variables
ARG VITE_API_BASE_URL

# Set environment variables during the build process
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./
COPY bun.lock  ./

COPY /apps/web/package.json ./apps/web/package.json

RUN bun install

COPY /apps/web ./apps/web

WORKDIR /app/apps/web

RUN bun run build

EXPOSE 8080

CMD [ "bun", "run", "preview" ]