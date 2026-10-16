# ==========================================================
# Academia Proveedores Smile — interfaz única del monorepo (ADR-0003)
# `make` o `make help` lista los comandos.
# ==========================================================
SHELL := /bin/bash
.DEFAULT_GOAL := help

ENV_FILE ?= infra/.env
COMPOSE  := docker compose -f infra/docker-compose.yml --env-file $(ENV_FILE)
COMPOSE_DEV := docker compose -f infra/docker-compose.yml -f infra/docker-compose.dev.yml --env-file $(ENV_FILE) --profile dev

# BuildKit obligatorio: los Dockerfiles usan cache mounts (arquitectura.md §7.4)
export DOCKER_BUILDKIT := 1
export COMPOSE_BAKE := true

s ?=
m ?=
f ?=

.PHONY: help env doctor up up-dev down clean reset-demo build build-dev logs ps migrate migration \
        shell-backend psql test test-backend test-frontend test-docker lint \
        lint-backend lint-frontend smoke image-size backup restore config openapi

help: ## Lista los comandos disponibles
	@awk 'BEGIN {FS = ":.*##"; printf "\nUso: make \033[36m<comando>\033[0m [s=servicio] [m=mensaje] [f=archivo]\n\n"} \
	  /^[a-zA-Z_-]+:.*##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

env: ## Crea infra/.env desde infra/.env.example si no existe
	@if [ -f $(ENV_FILE) ]; then echo "$(ENV_FILE) ya existe (no se sobrescribe)"; \
	else cp infra/.env.example $(ENV_FILE) && echo "Creado $(ENV_FILE). Revisa JWT_SECRET."; fi

$(ENV_FILE):
	@$(MAKE) --no-print-directory env

doctor: ## Verifica Docker Compose y buildx (BuildKit)
	@docker compose version >/dev/null 2>&1 || (echo 'Falta docker compose v2' && exit 1)
	@docker buildx version >/dev/null 2>&1 || (echo 'Falta docker buildx (BuildKit). Arch: sudo pacman -S docker-buildx · Debian/Ubuntu: apt install docker-buildx-plugin' && exit 1)
	@echo "docker compose y buildx OK"

config: $(ENV_FILE) ## Valida la configuración de compose (base y dev)
	@$(COMPOSE) config --quiet && echo "compose base OK"
	@$(COMPOSE_DEV) config --quiet && echo "compose dev OK"

up: doctor $(ENV_FILE) ## Levanta el stack con imágenes de producción (runtime/runner)
	$(COMPOSE) up -d --build
	@echo "Frontend http://localhost:3000 · API http://localhost:8000/docs · S3 (SeaweedFS) http://localhost:9000"

up-dev: doctor $(ENV_FILE) ## Levanta el stack de desarrollo (hot reload + mailpit)
	$(COMPOSE_DEV) up -d --build
	@echo "Frontend http://localhost:3000 · API http://localhost:8000/docs · Mailpit http://localhost:8025"

down: ## Detiene los contenedores (conserva volúmenes)
	$(COMPOSE_DEV) down

clean: ## Detiene todo y BORRA volúmenes (base de datos y archivos)
	@read -r -p "Se borrarán los volúmenes db-data y storage-data. Escribe 'borrar': " ok; \
	if [ "$$ok" = "borrar" ]; then $(COMPOSE_DEV) down -v --remove-orphans; else echo "Cancelado."; fi

reset-demo: ## Borra volúmenes y vuelve a levantar con los datos de demo iniciales
	$(COMPOSE_DEV) down -v --remove-orphans
	@$(MAKE) --no-print-directory up

build: doctor $(ENV_FILE) ## Construye las imágenes de producción
	$(COMPOSE) build

build-dev: doctor $(ENV_FILE) ## Construye las imágenes de desarrollo
	$(COMPOSE_DEV) build

logs: ## Sigue los logs (todos o s=<servicio>)
	$(COMPOSE_DEV) logs -f --tail=200 $(s)

ps: ## Estado de los servicios
	$(COMPOSE_DEV) ps

migrate: $(ENV_FILE) ## Aplica migraciones (alembic upgrade head)
	$(COMPOSE) run --rm migrate

migration: $(ENV_FILE) ## Crea una migración: make migration m="mensaje"
	@test -n "$(m)" || (echo 'Uso: make migration m="descripcion"' && exit 1)
	$(COMPOSE_DEV) run --rm migrate alembic revision --autogenerate -m "$(m)"

shell-backend: ## Shell dentro del contenedor backend
	$(COMPOSE_DEV) exec backend bash || $(COMPOSE_DEV) exec backend sh

psql: ## Consola psql en la base de datos
	$(COMPOSE) exec db sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

test: test-backend test-frontend ## Corre todas las pruebas (local con uv/npm)

test-backend: ## Pruebas del backend (uv)
	cd backend && uv run pytest

test-frontend: ## Pruebas del frontend (npm)
	cd frontend && npm test --silent

test-docker: $(ENV_FILE) ## Pruebas dentro de los contenedores de desarrollo
	$(COMPOSE_DEV) run --rm --no-deps backend pytest
	$(COMPOSE_DEV) run --rm --no-deps frontend npm test --silent

lint: lint-backend lint-frontend ## Linters y verificaciones estáticas

lint-backend: ## ruff + mypy + import-linter
	cd backend && uv run ruff check . && uv run ruff format --check . && uv run mypy src && uv run lint-imports

lint-frontend: ## eslint + typecheck + tokens de diseño
	cd frontend && npm run lint && npm run typecheck && npm run design:check

openapi: ## Regenera contracts/openapi.json desde FastAPI (HU-PLAT-05)
	cd backend && uv run python scripts/export_openapi.py

smoke: ## Prueba de humo del stack levantado
	infra/scripts/smoke.sh

image-size: ## Tamaño descomprimido y usuario de las imágenes locales (STRICT=1 falla)
	infra/scripts/image-size.sh smile/backend:local 250
	infra/scripts/image-size.sh smile/frontend:local 200

backup: ## Backup de PostgreSQL en infra/backups/
	infra/scripts/backup-db.sh

restore: ## Restaura un backup: make restore f=infra/backups/x.dump
	@test -n "$(f)" || (echo 'Uso: make restore f=infra/backups/archivo.dump' && exit 1)
	infra/scripts/restore-db.sh $(f)
