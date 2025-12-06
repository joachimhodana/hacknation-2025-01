FROM oven/bun:latest AS dev

WORKDIR /app

COPY bun.lock* package.json ./
RUN bun install

# Generate prisma
RUN bun run prisma:generate
RUN bun run prisma:migrate

# Generate better-auth
RUN bun run better-auth:generate
RUN bun run better-auth:migrate

COPY . .

EXPOSE 3000

CMD ["bun", "run", "dev"]
