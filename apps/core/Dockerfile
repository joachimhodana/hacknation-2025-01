FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock* ./

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "bun install --frozen-lockfile && bun run src/index.ts"]

