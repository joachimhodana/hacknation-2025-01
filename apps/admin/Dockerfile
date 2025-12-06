FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .

EXPOSE 3001

ENV PORT=3001

# Install dependencies if node_modules is empty (for volume mounts)
CMD sh -c "if [ ! -d node_modules/better-auth ]; then bun install; fi && bun run dev -- --host 0.0.0.0 --port 3001"

