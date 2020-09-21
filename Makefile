.PHONY: setup dev-up dev-down prod-down prod-ls

setup:
	touch stores/word2vec.sqlite3
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
