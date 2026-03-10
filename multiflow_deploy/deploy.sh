#!/usr/bin/env bash
# Deploy Whatiket con Docker
# Uso: ./deploy.sh

set -e

echo "[Whatiket] Iniciando deploy..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker no está instalado."
    exit 1
fi

# Verificar Docker Compose
if ! docker compose version 2>/dev/null && ! docker-compose version 2>/dev/null; then
    echo "[ERROR] Docker Compose no está instalado."
    exit 1
fi

# Verificar .env
if [ ! -f .env ]; then
    echo "[INFO] Creando .env desde .env.example..."
    cp .env.example .env
    echo "[IMPORTANTE] Edita .env con tus valores antes de continuar."
    exit 1
fi

# Construir y levantar
echo "[INFO] Construyendo imágenes..."
docker compose build --no-cache 2>/dev/null || docker-compose build --no-cache

echo "[INFO] Levantando contenedores..."
docker compose up -d 2>/dev/null || docker-compose up -d

echo "[OK] Deploy completado."
echo ""
echo "Servicios:"
echo "  - Frontend: http://localhost:80"
echo "  - Backend:  http://localhost:4010"
echo ""
echo "Para ejecutar migraciones:"
echo "  docker compose exec backend npx sequelize db:migrate"
