.PHONY: build up down restart logs clean ps secret

# Build all Docker images
build:
	docker-compose build

# Build without cache
build-no-cache:
	docker-compose build --no-cache

# Start all services
up:
	docker-compose up -d

# Start all services and follow logs
up-logs:
	docker-compose up

# Stop all services
down:
	docker-compose down

# Stop and remove volumes (clean slate)
down-volumes:
	docker-compose down -v

# Restart all services
restart: down up

# View logs for all services
logs:
	docker-compose logs -f

# View logs for specific service (usage: make logs-service SERVICE=core)
logs-service:
	docker-compose logs -f $(SERVICE)

# Show running containers
ps:
	docker-compose ps

# Clean up stopped containers and unused images
clean:
	docker-compose down
	docker system prune -f

# Rebuild and restart everything
rebuild: down build up

# Rebuild without cache and restart
rebuild-no-cache: down build-no-cache up

