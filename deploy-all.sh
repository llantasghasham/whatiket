#!/bin/bash
# Despliegue completo: pull, install, build, restart
# Uso: cd /home/deploy/empresa && bash deploy-all.sh

set -e
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "=== 1. Git pull ==="
git pull origin main

echo "=== 2. Backend: install + build ==="
cd backend
npm install --legacy-peer-deps
npm run build
cd ..

echo "=== 3. Frontend: install + build ==="
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

echo "=== 4. Reiniciar PM2 ==="
cd backend
pm2 delete empresa-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
cd ..

echo "=== 5. Estado ==="
pm2 list
echo ""
echo "Listo. Ver logs: pm2 logs empresa-backend --lines 0"
