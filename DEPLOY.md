# Comando de despliegue en el servidor

**Ruta del proyecto:** `/home/deploy/empresa`

## Comando completo (después de hacer push a git)

```bash
cd /home/deploy/empresa && git pull origin main && cd backend && npm install --legacy-peer-deps && npm run build && cd ../frontend && npm install --legacy-peer-deps && npm run build && pm2 restart all
```

## Paso a paso

```bash
cd /home/deploy/empresa
git pull origin main

cd backend
npm install --legacy-peer-deps
npm run build

cd ../frontend
npm install --legacy-peer-deps
npm run build

pm2 restart all
```

> **Nota:** Se usa `--legacy-peer-deps` en backend y frontend por conflictos de dependencias (jimp/baileys y React/MUI).
