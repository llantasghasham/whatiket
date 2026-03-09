# Comando de despliegue en el servidor

**Ruta del proyecto:** `/home/deploy/empresa`

## Un solo comando (copiar y pegar)

```bash
cd /home/deploy/empresa && bash deploy-all.sh
```

## O todo en una línea (sin script)

```bash
cd /home/deploy/empresa && git pull origin main && cd backend && npm install --legacy-peer-deps && npm run build && cd ../frontend && npm install --legacy-peer-deps && npm run build && cd ../backend && pm2 delete empresa-backend 2>/dev/null; pm2 start ecosystem.config.js && pm2 save
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

cd ../backend
pm2 restart empresa-backend
pm2 save
```

> **Nota:** Se usa `--legacy-peer-deps` en backend y frontend por conflictos de dependencias (jimp/baileys y React/MUI).
