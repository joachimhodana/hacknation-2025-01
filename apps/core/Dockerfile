FROM oven/bun:latest AS dev

WORKDIR /app

# Install OpenSSL for PostgreSQL connections
RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy dependency files first
COPY bun.lock* package.json ./
RUN bun install

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy the rest of the application
COPY . .

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["bun", "run", "dev"]
