#!/bin/bash
# Backup de seguridad - base de datos, .env, uploads
# Uso: cd /home/deploy/empresa/backend && sudo bash scripts/backup-empresa.sh

set -e
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y-%m-%d_%H-%M)
mkdir -p "$BACKUP_DIR"

# Cargar .env para credenciales DB
[ -f /home/deploy/empresa/backend/.env ] && export $(grep -E '^DB_' /home/deploy/empresa/backend/.env | xargs)

echo "=== Backup $(date) ==="

# 1. Base de datos PostgreSQL
echo "1. Backup DB..."
export PGPASSWORD="${DB_PASS:-}"
pg_dump -U "${DB_USER:-empresa}" -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" "${DB_NAME:-empresa}" > "$BACKUP_DIR/empresa_db_$DATE.sql" 2>/dev/null || \
  sudo -u postgres pg_dump empresa > "$BACKUP_DIR/empresa_db_$DATE.sql" 2>/dev/null || \
  echo "   (Revisar credenciales DB en .env)"

# 2. .env
echo "2. Backup .env..."
cp /home/deploy/empresa/backend/.env "$BACKUP_DIR/env_$DATE.bak" 2>/dev/null || true

# 3. Uploads (public/company*)
echo "3. Backup uploads..."
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /home/deploy/empresa/backend public/company1 public/company2 2>/dev/null || \
  tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /home/deploy/empresa/backend public 2>/dev/null || true

# 4. Resumen
echo ""
echo "Backup guardado en: $BACKUP_DIR"
ls -lh "$BACKUP_DIR"/*"$DATE"* 2>/dev/null || true
