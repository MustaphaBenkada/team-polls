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
   cd backend
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
cd backend
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

[Add your API documentation here]

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application with Docker](#running-the-application-with-docker)
- [Configuration](#configuration)
- [Database Migrations](#database-migrations)
- [Contributing](#contributing)
- [License](#license)

## Overview

This application, Team Polls, allows users to create polls with multiple options and set an expiration date. Other users can then vote on these polls. The backend API is built with Node.js and Express, utilizing a PostgreSQL database for persistent data storage and Redis for potential caching or real-time features. The application is containerized using Docker for easy setup and deployment.

## Getting Started

### Prerequisites

Before you can run this application, you need to have the following installed on your system:

- **Docker:** [Install Docker](https://www.docker.com/get-started/) (Required for running with Docker)
- **Node.js and npm (or yarn):** [Install Node.js](https://nodejs.org/) (If you want to run the application without Docker for development)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <your-project-directory>
    ```

    (Replace `<repository_url>` with the actual URL of your Git repository and `<your-project-directory>` with the name of your project directory.)

2.  **Environment Configuration:**

    Create a `.env` file in the root of the project and configure the following environment variables:

    ```
    DB_USER=poll_admin
    DB_PASSWORD=secure123
    DB_NAME=teampolls_db
    REDIS_USER=default
    REDIS_PASSWORD=redis123
    JWT_SECRET=jwt123
    # Add other environment variables as needed
    ```

### Running the Application with Docker

This is the recommended way to run the application.

1.  **Build and run the Docker containers:**

    ```bash
    docker compose up --build -d
    ```

    This command will build the Docker image for the application and start the `team-polls-app-1` (application), `team-polls-db-1` (PostgreSQL), and `team-polls-redis-1` (Redis) containers in the background.

2.  **Access the application:**

    The application should be accessible at `http://localhost:3000` in your web browser or via API requests, served by the `team-polls-app-1` container.

### Configuration

The application's behavior is primarily configured through the `.env` file located in the project root. Ensure the database credentials and other settings are correctly configured here. These environment variables are used by the Docker containers.

### Database Migrations

The application uses `pg-migrate` for managing PostgreSQL database schema changes. Migration files are located in the `migrations` directory.

- **Running Migrations:** Database migrations are automatically attempted when the `team-polls-app-1` Docker container starts, as defined in the `docker-compose.yml` file.

- **Creating New Migrations (for development):**

  If you need to create new database migrations, you can typically use a command like:

  ```bash
  docker exec -it team-polls-app-1 pg-migrate create <migration_name>
```

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.