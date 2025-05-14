FROM node:20-alpine

# Install postgresql-client for pg_isready command
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy package files first
COPY package*.json ./
RUN npm ci

# Copy source code and build it
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

# Copy migrations
COPY migrations/ ./migrations/

# Copy and set up init script
COPY init.sh /init.sh
RUN chmod +x /init.sh

CMD ["/init.sh"]