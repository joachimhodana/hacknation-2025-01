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

EXPOSE 8080

CMD ["bun", "run", "dev"]
