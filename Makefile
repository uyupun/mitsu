.PHONY: setup

setup:
	touch database.sqlite3
	cp .env.example .env
	yarn

