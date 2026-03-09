# Backend usa puerto 4001 – Actualizar nginx

El backend ahora escucha en el **puerto 4001** (antes 4000) para evitar EADDRINUSE.

## Actualizar nginx

Edita la configuración de nginx (por ejemplo `/etc/nginx/sites-available/default` o el archivo de tu sitio):

**Antes:**
```nginx
proxy_pass http://127.0.0.1:4000;
```

**Después:**
```nginx
proxy_pass http://127.0.0.1:4001;
```

Luego:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Verificar

```bash
curl -s http://127.0.0.1:4001/
```

Si responde, el backend está escuchando en 4001.
