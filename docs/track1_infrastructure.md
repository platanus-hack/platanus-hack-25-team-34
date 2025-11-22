# Track 1: Infrastructure & Configuration

## Decisions & Implementation

### 1. Project Structure
We adopted a monorepo structure with distinct `backend` and `frontend` directories to keep concerns separated while maintaining a single repository for the hackathon.

- **Backend**: Python/FastAPI. Chosen for speed of development and strong typing support (Pydantic) which helps with the "Mock-First" data modeling.
- **Frontend**: React + TypeScript (Vite). Chosen for performance and type safety. Material UI was selected for the UI library to ensure a "minimalist" design as requested, allowing us to focus on functionality.

### 2. Dockerization
We implemented a full Docker stack to ensure consistent environments across development machines.
- **Backend**: Uses `python:3.11-slim` for a small footprint.
- **Frontend**: Uses `node:18-alpine` for development.
- **Database**: `postgres:15-alpine`. We chose PostgreSQL over SQLite for the Docker environment to better simulate a production environment, although SQLite is configured as a fallback in `config.py` for quick local testing without Docker.

### 3. Configuration
- **Environment Variables**: We use a `.env` file (and provided `.env.example`) to manage configuration like `DATABASE_URL` and `BROKER_MODE`. This allows easy switching between "mock" and future "real" modes.
- **Dependencies**:
    - Backend: Managed via `requirements.txt` for simplicity.
    - Frontend: Managed via `package.json` (npm).

## Next Steps
With the infrastructure in place, we can proceed to **Track 2: Data & Models** to define the schema and seed the database with the mock data (Pelosi, Buffett, etc.).
