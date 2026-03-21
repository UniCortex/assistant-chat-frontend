.PHONY: app app-build app-build-nc app-restart app-down

app:
	docker compose up -d

app-build:
	docker compose build

app-build-nc:
	docker compose build --no-cache

app-restart:
	docker compose down && docker compose up -d

app-down:
	docker compose down
