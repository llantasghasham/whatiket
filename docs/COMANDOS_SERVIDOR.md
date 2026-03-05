# Comandos para desplegar en el servidor

## 1. En tu PC (antes de desplegar)

Sube los cambios a GitHub para que el servidor pueda jalarlos:

```bash
cd E:\whatiket
git add .
git commit -m "Tu mensaje"
git push origin main
```

## 2. En el servidor (SSH)

Conéctate y ejecuta **estos comandos en este orden**:

```bash
cd /home/deploy/empresa

# Jalar últimos cambios
git pull origin main

# Backend: instalar con legacy-peer-deps (evita error de jimp/baileys), compilar
cd backend
npm run install:server
npm run build
cd ..

# Frontend: instalar con legacy-peer-deps (evita conflicto React/MUI) y compilar
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

# Reiniciar
pm2 restart all
```

### Todo en una sola línea (copiar y pegar)

```bash
cd /home/deploy/empresa && git pull origin main && cd backend && npm install --legacy-peer-deps && npm run build && cd ../frontend && npm install --legacy-peer-deps && npm run build && cd .. && pm2 restart all
```

## Notas

- **"Already up to date"**: Si sale eso y no ves cambios, es que en tu PC no has hecho `git push`. Haz push primero y vuelve a hacer `git pull` en el servidor.
- **Error de npm en backend**: Si `npm install` falla por conflicto de dependencias (jimp/baileys), usa `npm run install:server` (usa `--legacy-peer-deps`).
- **No ejecutes** `sudo systemctl restart tu-servicio-backend` si usas PM2; ese comando era solo un ejemplo. Con PM2 basta `pm2 restart all`.
