#!/bin/sh
set -e

echo "Installing dependencies..."
bun install

echo "Pushing Drizzle schema to database (development mode)..."
echo "This will create/update all tables including Better Auth tables (user, session, account, verification)..."
bun run db:push || echo "Warning: Drizzle push failed, but continuing..."

echo "Running Better Auth migrations..."
if [ -z "$BETTER_AUTH_SECRET" ]; then
    echo "Warning: BETTER_AUTH_SECRET is not set. Better Auth migration may fail."
    echo "Skipping Better Auth migrations..."
else
    bun run better-auth:migrate || echo "Warning: Better Auth migration failed, but continuing..."
fi

echo "Creating default admin user (if not exists)..."
bun run create-admin || echo "Warning: Failed to create default admin user, but continuing..."

echo "Starting application..."
exec "$@"

