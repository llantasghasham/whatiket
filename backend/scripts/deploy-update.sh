#!/bin/bash
# Despliegue rápido: pull, build, restart limpio (evita EADDRINUSE puerto 4000)
# Uso: cd /home/deploy/empresa && bash backend/scripts/deploy-update.sh

set -e
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

echo "=== 1. Git pull ==="
git pull origin main

echo "=== 2. Build backend ==="
cd backend
npm run build

echo "=== 3. Reinicio limpio (backend en puerto 4001) ==="
pm2 delete empresa-backend 2>/dev/null || true
pkill -9 -f "dist/server.js" 2>/dev/null || true
fuser -k 4000/tcp 2>/dev/null || true
fuser -k 4001/tcp 2>/dev/null || true
sleep 8
pm2 start ecosystem.config.js
pm2 save

echo "=== 4. Estado ==="
pm2 list
echo ""
echo "Listo. Ver logs: pm2 logs empresa-backend --lines 0"
