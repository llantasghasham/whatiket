#!/bin/bash
# Arranque limpio del backend - libera puerto 4000 antes de iniciar
# Uso: cd /home/deploy/empresa/backend && sudo bash scripts/restart-backend-clean.sh

set -e
cd "$(dirname "$0")/.."
APP_NAME="${PM2_APP_NAME:-empresa-backend}"

echo "1. Eliminando $APP_NAME de PM2..."
pm2 delete "$APP_NAME" 2>/dev/null || true

echo "2. Matando procesos node del backend..."
pkill -9 -f "dist/server.js" 2>/dev/null || true

echo "3. Liberando puerto 4000..."
sudo fuser -k 4000/tcp 2>/dev/null || true
sleep 3
PIDS=$(sudo lsof -t -i:4000 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo "   Matando PIDs en 4000: $PIDS"
  echo "$PIDS" | xargs -r sudo kill -9 2>/dev/null || true
fi

echo "4. Esperando 10 segundos..."
sleep 10

echo "5. Verificando puerto libre..."
if sudo lsof -i:4000 2>/dev/null | grep -q .; then
  echo "ERROR: Puerto 4000 sigue ocupado:"
  sudo lsof -i:4000
  exit 1
fi

echo "6. Iniciando backend..."
pm2 start ecosystem.config.js

echo "7. pm2 save..."
pm2 save 2>/dev/null || true

echo "8. Estado:"
pm2 list
echo ""
echo "Listo. Ver logs: pm2 logs empresa-backend --lines 0"
