# Broker API

## Overview

This implementation of an example broker API demonstrates real‑time order matching and market data updates using WebSockets, Express, and TypeScript.

The API supports:

- Client subscriptions to ticker updates.
- Submission of `BUY` and `SELL` orders that are processed by a modular matching engine.
- Real‑time execution notifications and standardized messaging.
- Centralized logging, including unique client identifiers for easy tracking.
- A `/health` endpoint for monitoring.

## Approach

- **WebSocket Communication:** Clients connect via WebSockets to receive live (dummy) market data and order notifications.
- **Order Matching Engine:** A simple First-In-First-Out (FIFO) matching algorithm processes orders. The design is modular and should allow for future, more complex matching algorithms.
- **Client Management:** Each client connection is assigned a unique ID (using a dedicated client manager module), which is used in all logs and messages.
- **Logging & Messaging:** Outgoing messages are sent through a centralized `sendMessage` function that formats messages consistently, complete with timestamps and the client ID, when available.
- **Ticker Simulator:** Simulated market data is broadcast to subscribed clients.

## Running, Testing, and Building with Docker

### Prerequisites

Docker and the Docker-provided `docker compose` (not the deprecated python `docker-compose`) must be installed on your system.

### Building the Image

Docker Compose will automatically build images if they don’t already exist, but they should be rebuilt if the source code changes:

```bash
docker compose build --no-cache
````

### Running the Application (Development)

Start the development server (with hot reloading and live code mounts) by running:

```bash
docker compose up app
```

The application will start up on http://localhost:3000 or whatever the `PORT` environment variable is set to.

### Running Tests

To execute the test suite inside a container, run:

```bash
docker compose run test
```

### Building for Production

To build and run a production‑ready image, run:

```bash
docker compose up prod
```
