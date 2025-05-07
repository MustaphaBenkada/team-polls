# Team Polls Application

A simple application for creating and voting on polls.

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