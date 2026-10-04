.PHONY: up down logs bootstrap-vault db-migrate dev build test help

help:
	@echo "Immersion German Aggregator - DevOps/SRE Makefile"
	@echo ""
	@echo "Available commands:"
	@echo "  make up               Start the local SRE docker-compose stack (ETL, Vault, Prometheus, Grafana, Ollama)"
	@echo "  make down             Stop the local docker-compose stack and clean resources"
	@echo "  make logs             Tail the ETL Python daemon logs in JSON format"
	@echo "  make bootstrap-vault  Run the script to bootstrap Vault's KV engine and seed secrets template"
	@echo "  make dev              Start Next.js frontend local development server"
	@echo "  make build            Build Next.js production web bundle"
	@echo "  make test             Run automated Python and frontend tests"
	@echo ""

up:
	docker compose -f backend_etl/docker-compose.yml up -d --build

down:
	docker compose -f backend_etl/docker-compose.yml down -v

logs:
	docker logs -f etl_daemon

bootstrap-vault:
	bash backend_etl/scripts/bootstrap-vault.sh

dev:
	npm run dev

build:
	npm run build

test:
	pytest backend_etl/tests/
