.PHONY: setup up down ps db

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

db:
	yarn migrate:fresh
	yarn seed
