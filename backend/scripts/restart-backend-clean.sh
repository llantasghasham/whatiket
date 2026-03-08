#!/bin/bash
# Arranque limpio del backend - libera puerto 4000 antes de iniciar
# Uso: ./scripts/restart-backend-clean.sh
# O desde /home/deploy/empresa: cd backend && bash scripts/restart-backend-clean.sh

set -e
cd "$(dirname "$0")/.."
APP_NAME="${PM2_APP_NAME:-empresa-backend}"

echo "1. Parando $APP_NAME..."
pm2 stop "$APP_NAME" 2>/dev/null || true

echo "2. Liberando puerto 4000..."
sudo fuser -k 4000/tcp 2>/dev/null || true
sudo kill -9 $(sudo lsof -t -i:4000) 2>/dev/null || true

echo "3. Esperando 5 segundos..."
sleep 5

echo "4. Verificando puerto libre..."
if lsof -i:4000 >/dev/null 2>&1; then
  echo "ERROR: Puerto 4000 sigue ocupado:"
  lsof -i:4000
  exit 1
fi

echo "5. Iniciando $APP_NAME..."
pm2 start "$APP_NAME" --update-env

echo "6. Estado:"
pm2 list
echo ""
echo "Logs (Ctrl+C para salir):"
pm2 logs "$APP_NAME" --lines 20
