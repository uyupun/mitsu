.PHONY: up down ps sh db

setup:
	cp .env.example .env
	docker network create social_resistance
	docker-compose build --no-cache
	docker-compose up -d
	make db
	yarn

up:
	docker-compose up -d

down:
	-docker-compose down

ps:
	docker-compose ps

sh:
	docker-compose exec express sh

db:
	docker-compose exec express yarn migrate:fresh
	docker-compose exec express yarn seed
