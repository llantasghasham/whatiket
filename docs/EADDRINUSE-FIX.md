# Fix EADDRINUSE puerto 4000

## Problema

El backend entra en bucle: PM2 reinicia tras cada crash, el puerto no se libera a tiempo y el nuevo proceso falla con `EADDRINUSE`.

## Solución rápida (ejecutar en el servidor)

```bash
cd /home/deploy/empresa/backend

# Parar backend
pm2 stop empresa-backend

# Liberar puerto 4000
sudo fuser -k 4000/tcp

# Esperar 5 segundos (importante)
sleep 5

# Comprobar que el puerto está libre
sudo lsof -i :4000
# No debe mostrar nada

# Arrancar
pm2 start empresa-backend --update-env

# Ver logs
pm2 logs empresa-backend --lines 30
```

## Script automático (después de git pull)

```bash
cd /home/deploy/empresa/backend
chmod +x scripts/restart-backend-clean.sh
sudo bash scripts/restart-backend-clean.sh
```

## Cambios en ecosystem.config.js

- `kill_timeout: 5000` – da 5 s al proceso anterior para cerrar
- `exp_backoff_restart_delay: 5000` – espera 5 s antes de reiniciar tras un crash

## Si el problema continúa

Puede haber otro proceso usando el puerto (no gestionado por PM2):

```bash
# Ver qué usa el puerto
sudo lsof -i :4000

# Matar por PID
sudo kill -9 <PID>
```
