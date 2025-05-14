#!/bin/sh

# Exit on any error
set -e

echo "Starting initialization process..."

# Maximum number of retries
MAX_RETRIES=30
RETRY_COUNT=0

# Extract database connection details from DATABASE_URL or use defaults
if [ -n "$DATABASE_URL" ]; then
    # Parse DATABASE_URL
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\).*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
else
    # Use environment variables or defaults
    DB_HOST=${POSTGRES_HOST:-db}
    DB_PORT=${POSTGRES_PORT:-5432}
    DB_USER=${POSTGRES_USER:-postgres}
    DB_PASSWORD=${POSTGRES_PASSWORD:-postgres}
    DB_NAME=${POSTGRES_DB:-teampolls}
fi

echo "Waiting for database..."
until PGPASSWORD=$DB_PASSWORD pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    echo "Database is unavailable - sleeping (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)"
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Failed to connect to database after $MAX_RETRIES attempts"
    exit 1
fi

echo "Database is ready!"

# Export PGPASSWORD for psql commands
export PGPASSWORD=$DB_PASSWORD

echo "Setting up database..."
cd /app

# Create database if it doesn't exist (suppress error if it does)
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME" || echo "Database already exists"

echo "Running migrations..."
# Run the migration with better error handling
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f /app/migrations/migrations/1678886400000_create_polls_and_votes.sql; then
    echo "Migrations finished successfully!"
else
    echo "Migration failed! Check the error above."
    exit 1
fi

echo "Building TypeScript..."
npm run build

echo "Starting application..."
exec node dist/index.js 