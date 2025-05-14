# Team Polls Frontend

A minimal React application to interact with the Team Polls API.

## Features

- Create new polls with multiple options
- Cast votes on existing polls
- Real-time updates of poll results via WebSocket
- Anonymous authentication

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Usage

1. The application will automatically get an anonymous token when loaded
2. Create a new poll by filling out the form at the top
3. Cast votes by clicking on poll options
4. Watch as results update in real-time

## Development

- Built with React + TypeScript + Vite
- Uses Axios for HTTP requests
- WebSocket for real-time updates
- Minimal styling with basic CSS

## API Integration

The frontend expects the backend API to be running at http://localhost:3000 with the following endpoints:

- POST /auth/anon - Get anonymous token
- POST /poll - Create new poll
- POST /poll/:id/vote - Cast vote
- WebSocket /poll/:id - Real-time updates 