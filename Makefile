.PHONY: setup

setup:
	touch database.sqlite3
	cp .env.example .env
	yarn
	yarn migrate
	yarn seed

dev-up:
	docker-compose up -d
	yarn dev

dev-down:
	docker compose down

prod-up:
	docker-compose up -d
	yarn prod:up

prod-down:
	docker-compose down
	yarn prod:down

prod-ls:
	yarn prod:ls
