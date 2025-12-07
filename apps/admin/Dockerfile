FROM oven/bun:latest

ARG PORT=3001
ARG HOST=0.0.0.0

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .

EXPOSE ${PORT}

# PORT and HOST will be set by docker-compose environment variables at runtime
# These are build-time defaults
ENV PORT=${PORT}
ENV HOST=${HOST}

# Install dependencies if node_modules is empty (for volume mounts)
CMD sh -c "if [ ! -d node_modules/better-auth ]; then bun install; fi && bun run dev -- --host ${HOST} --port ${PORT}"

