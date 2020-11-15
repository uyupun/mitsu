.PHONY: setup up down prod-down prod-ls ps db

setup:
	cp .env.example .env
	docker network create social_resistance
	docker-compose build --no-cache
	docker-compose up -d
	make db
	yarn

up:
	docker-compose up -d
	yarn dev

down:
	docker compose down

prod-up:
	docker-compose up -d
	yarn prod:up

prod-down:
	-docker-compose down
	yarn prod:down

prod-ls:
	yarn prod:ls

ps:
	docker-compose ps

db:
	yarn migrate:fresh
	yarn seed
