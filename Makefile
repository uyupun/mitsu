.PHONY: up down ps sh db fix c world

setup:
	cp .env.example .env
	-docker network create social_resistance
	docker-compose build --no-cache
	docker-compose up -d
	make db
	yarn

up:
	docker-compose up

prod-up:
	yarn
	docker-compose -f docker-compose.yml -f docker-compose-prod.yml up -d

down:
	-docker-compose down

ps:
	docker-compose ps

sh:
	docker-compose exec express sh

db:
	docker-compose exec express yarn migrate:fresh
	docker-compose exec express yarn seed

fix:
	yarn lint:fix

test:
	yarn test

c:
	yarn commit

world:
	yarn world
