# Backend — Academia de Proveedores Smile (ADR-0003, arquitectura.md §7.4)
# Etapas: base → builder → dev | runtime

ARG PYTHON_VERSION=3.12

# ---------- base: intérprete + uv ----------
FROM python:${PYTHON_VERSION}-slim AS base
COPY --from=ghcr.io/astral-sh/uv:0.11.8 /uv /uvx /bin/
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    UV_PROJECT_ENVIRONMENT=/app/.venv \
    TZ=America/Bogota
WORKDIR /app

# ---------- builder: dependencias de producción en /app/.venv ----------
FROM base AS builder
# Capa de dependencias separada del código: solo se reconstruye si cambia uv.lock.
# Sin `RUN --mount` para funcionar también con el builder clásico (hosts sin buildx).
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project --no-cache
COPY README.md ./
COPY src ./src
RUN uv sync --frozen --no-dev --no-editable --no-cache \
 # Poda: botocore trae modelos de ~400 servicios AWS (24 MB); solo se usan s3 y sts.
 && find /app/.venv/lib/python3.12/site-packages/botocore/data -mindepth 1 -maxdepth 1 -type d \
      ! -name s3 ! -name sts -exec rm -rf {} + \
 && find /app/.venv -type d -name tests -prune -exec rm -rf {} +

# ---------- dev: + dependencias de desarrollo y recarga en caliente ----------
FROM base AS dev
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-cache
COPY . .
RUN uv sync --frozen --no-cache
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
CMD ["uvicorn", "smile.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "/app/src"]

# ---------- runtime: imagen mínima, sin uv ni herramientas de build ----------
FROM python:${PYTHON_VERSION}-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH" \
    TZ=America/Bogota
RUN groupadd --system --gid 1001 app && useradd --system --uid 1001 --gid app --home /app app
WORKDIR /app
COPY --from=builder --chown=app:app /app/.venv /app/.venv
COPY --chown=app:app alembic.ini ./
COPY --chown=app:app migrations ./migrations
USER app
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
    CMD ["python", "-c", "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health/live', timeout=2).status == 200 else 1)"]
CMD ["uvicorn", "smile.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
