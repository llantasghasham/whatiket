#!/bin/bash
# Despliegue rápido: pull, build, restart
# Uso: cd /home/deploy/empresa && bash backend/scripts/deploy-update.sh

set -e
cd "$(dirname "$0")/.."
echo "=== 1. Git pull ==="
git pull origin main

echo "=== 2. Build backend ==="
npm run build

echo "=== 3. Restart PM2 ==="
pm2 restart empresa-backend
pm2 save

echo "=== 4. Estado ==="
pm2 list
echo ""
echo "Listo. Ver logs: pm2 logs empresa-backend --lines 0"
