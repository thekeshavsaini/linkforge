#!/bin/sh
set -e

echo "==> LinkForge Production Startup"
echo "==> Synchronizing database schema with Prisma..."

# Attempt schema push with retries in case database container is still initializing
MAX_RETRIES=15
COUNT=0

until npx prisma db push --skip-generate || [ $COUNT -eq $MAX_RETRIES ]; do
  COUNT=$((COUNT + 1))
  echo "Database not ready yet (attempt $COUNT/$MAX_RETRIES). Waiting 2 seconds..."
  sleep 2
done

if [ $COUNT -eq $MAX_RETRIES ]; then
  echo "Error: Database connection could not be established after $MAX_RETRIES attempts."
  echo "Starting application server anyway (database reconnection will be retried on requests)..."
fi

echo "==> Starting LinkForge Next.js application server on port ${PORT:-3000}..."
exec node server.js
