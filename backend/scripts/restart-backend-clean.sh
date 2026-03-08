#!/bin/bash
# Arranque limpio del backend - libera puerto 4000 antes de iniciar
# Uso: ./scripts/restart-backend-clean.sh
# O desde /home/deploy/empresa: cd backend && bash scripts/restart-backend-clean.sh

set -e
cd "$(dirname "$0")/.."
APP_NAME="${PM2_APP_NAME:-empresa-backend}"

echo "1. Eliminando $APP_NAME de PM2 (evita que PM2 reinicie al matar el proceso)..."
pm2 delete "$APP_NAME" 2>/dev/null || true

echo "2. Matando cualquier proceso node del backend..."
pkill -f "node.*dist/server.js" 2>/dev/null || true

echo "3. Liberando puerto 4000..."
sudo fuser -k 4000/tcp 2>/dev/null || true
sleep 2
sudo kill -9 $(sudo lsof -t -i:4000) 2>/dev/null || true

echo "4. Esperando 5 segundos..."
sleep 5

echo "5. Verificando puerto libre..."
if sudo lsof -i:4000 >/dev/null 2>&1; then
  echo "ERROR: Puerto 4000 sigue ocupado:"
  sudo lsof -i:4000
  exit 1
fi

echo "6. Iniciando backend desde ecosystem.config.js..."
pm2 start ecosystem.config.js

echo "7. Guardando config PM2 para que empresa-backend persista..."
pm2 save 2>/dev/null || true

echo "8. Estado:"
pm2 list
echo ""
echo "Logs (Ctrl+C para salir):"
pm2 logs --lines 20
