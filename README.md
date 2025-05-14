# Team Polls Application

A real-time polling application built with Node.js, PostgreSQL, Redis, React, and WebSocket.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start with Docker](#quick-start-with-docker)
- [Manual Setup](#manual-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Testing](#testing)
- [Architecture](#architecture)

## Features
- Create polls with multiple options and expiration time
- Real-time vote updates using WebSocket
- Anonymous authentication
- Rate-limited voting (5 votes/sec per user)
- Automatic poll expiration
- Persistent storage with PostgreSQL
- Redis caching for performance
- Modern React frontend with real-time updates

## Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, Vite, TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Real-time**: WebSocket
- **Testing**: Jest
- **Container**: Docker

## Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd team-polls
   ```

2. Create a `.env` file in the root directory:
   ```env
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=teampolls
   JWT_SECRET=your-secret-key-here
   REDIS_URL=redis://redis:6379
   ```

3. Start all services:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Manual Setup

### Backend Setup

1. Install dependencies:
   ```bash
   cd team-polls
   npm install
   ```

2. Create a `.env` file:
   ```env
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=teampolls
   DB_HOST=localhost
   DB_PORT=5432
   JWT_SECRET=your-secret-key-here
   REDIS_URL=redis://localhost:6379
   ```

3. Start PostgreSQL and Redis (required):
   ```bash
   docker-compose up -d postgres redis
   ```

4. Run migrations:
   ```bash
   npm run migrate:up
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage Guide

### Creating a Poll

1. Get an anonymous token:
   ```bash
   curl -X POST http://localhost:3000/api/auth/anon
   ```

2. Create a new poll:
   ```bash
   curl -X POST http://localhost:3000/api/poll \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "question": "What is your favorite color?",
       "options": ["Red", "Blue", "Green"],
       "expiresAt": "2024-12-31T23:59:59Z"
     }'
   ```

3. Cast a vote:
   ```bash
   curl -X POST http://localhost:3000/api/poll/POLL_ID/vote \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "optionIndex": 0
     }'
   ```

4. Get poll results:
   ```bash
   curl http://localhost:3000/api/poll/POLL_ID
   ```

### Using the Frontend

1. Open http://localhost:5173 in your browser
2. Click "Create Poll" to create a new poll
3. Share the poll URL with others
4. Watch real-time updates as votes come in

## Development

### Running Tests
```bash
# Backend tests
cd team-polls
npm test

# Frontend tests
cd frontend
npm test
```

### Database Migrations
```bash
# Create a new migration
npm run migrate:create migration_name

# Run migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down
```

## Architecture

### Backend Architecture
- Express.js REST API with WebSocket support
- PostgreSQL for persistent storage
- Redis for caching and rate limiting
- JWT for authentication
- Modular code structure with TypeScript

### Frontend Architecture
- React with TypeScript
- Vite for fast development
- WebSocket for real-time updates
- Responsive design
- Component-based architecture

### Security Features
- Rate limiting
- CORS protection
- Helmet security headers
- Environment-based secrets
- Input validation

### Scaling Considerations
- Connection pooling for database
- Redis caching layer
- WebSocket clustering support
- Docker containerization
- Horizontal scaling ready

## API Documentation
