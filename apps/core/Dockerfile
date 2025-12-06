FROM oven/bun:latest AS dev

WORKDIR /app

COPY bun.lock* package.json ./
RUN bun install

COPY . .

EXPOSE 3000

CMD ["bun", "run", "dev"]
