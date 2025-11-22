# How to run

## Run the whole application

docker-compose up


### To test the backend API:

Visit: http://localhost:8000
API docs (Swagger): http://localhost:8000/docs


### To test the frontend:

Visit: http://localhost:5173


## Some useful commands:

```
#  View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers after code changes
docker-compose up --build

# Run just the backend
docker-compose up backend

# Execute commands in running containers
docker-compose exec backend /bin/bash
```