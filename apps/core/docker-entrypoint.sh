#!/bin/sh
set -e

echo "Installing dependencies..."
bun install

echo "Pushing Drizzle schema to database (development mode)..."
bun run db:push || echo "Warning: Drizzle push failed, but continuing..."

echo "Running Better Auth migrations..."
if [ -z "$BETTER_AUTH_SECRET" ]; then
    echo "Warning: BETTER_AUTH_SECRET is not set. Better Auth migration may fail."
else
    bun run better-auth:migrate || echo "Warning: Better Auth migration failed, but continuing..."
fi

echo "Starting application..."
exec "$@"

