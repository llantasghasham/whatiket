# Fix Redis: descuadre .env (5000) vs Redis real (6379)

## 0. Referencias exactas (archivo: línea)

| Búsqueda | Archivo | Línea | Notas |
|----------|---------|-------|-------|
| `REDIS_URI` | `backend/src/config/redis.ts` | 1 | `REDIS_URI_CONNECTION = process.env.REDIS_URI \|\| ""` |
| `REDIS_URI` | `backend/src/queues.ts` | 56 | `connection = process.env.REDIS_URI \|\| ""` |
| `REDIS_URI` | `backend/src/queues/userMonitor.ts` | 10 | `connection = process.env.REDIS_URI \|\| ""` |
| `REDIS_URI` | `backend/src/userMonitor.ts` | 9 | `connection = process.env.REDIS_URI \|\| ""` |
| `REDIS_URI` | `backend/src/config/dispatchQueue.ts` | 2 | Fallback en `DISPATCH_QUEUE_REDIS_URI` |
| `new Redis(` | `backend/src/libs/cache.ts` | 99 | `new Redis(REDIS_URI_CONNECTION)` |
| `ioredis` | `backend/src/libs/cache.ts` | 2 | `import Redis from "ioredis"` |
| Bull | `backend/src/libs/queue.ts` | 28 | `new BullQueue(job.key, REDIS_URI_MSG_CONN, ...)` |
| Bull | `backend/src/queues.ts` | 85-91 | `new BullQueue("UserMonitor", connection)` etc. |
| `connect-redis` | - | - | No se usa en este proyecto |
| `ERR_SESSION_EXPIRED` | `backend/src/middleware/isAuth.ts` | 26, 78 | Lanzado cuando no hay token |
| `ERR_SESSION_EXPIRED` | `backend/src/middleware/isAuthCompany.ts` | 14, 22, 26 | Idem |
| `ERR_SESSION_EXPIRED` | `backend/src/middleware/tokenAuth.ts` | 14, 23, 27 | Idem |

**Por qué el backend usa 6379 si el .env dice 5000:** Si `process.env.REDIS_URI` no se carga (por cwd incorrecto o .env no encontrado), queda `""`. ioredis y Bull con string vacío usan el default `127.0.0.1:6379`.

**Relación con /facebook-callback:** Ninguna. El callback OAuth no usa Redis. `ERR_SESSION_EXPIRED` viene de middlewares de auth que exigen `Authorization`, no de Redis.

---

## 1. Resumen del problema

| Origen | Puerto | Password | Estado |
|--------|--------|----------|--------|
| `.env` | 5000 | Sí | `REDIS_URI=redis://:8Q0hysgyZbw8plK@127.0.0.1:5000` |
| Redis real | 6379 | No | Instalado y activo en 127.0.0.1:6379 |
| Logs backend | 6379 | - | Intenta conectar a 127.0.0.1:6379 |

**Conclusión:** El backend usa 6379 porque `REDIS_URI` no se está cargando correctamente. Cuando queda vacío, ioredis/Bull usan el default `127.0.0.1:6379`.

---

## 2. Dónde se lee REDIS_URI en el código

| Archivo | Línea | Uso |
|---------|-------|-----|
| `backend/src/config/redis.ts` | 1 | `REDIS_URI_CONNECTION = process.env.REDIS_URI \|\| ""` |
| `backend/src/config/redis.ts` | 5 | `REDIS_URI_MSG_CONN = process.env.REDIS_URI_ACK \|\| ''` |
| `backend/src/queues.ts` | 56 | `connection = process.env.REDIS_URI \|\| ""` |
| `backend/src/queues/userMonitor.ts` | 10 | `connection = process.env.REDIS_URI \|\| ""` |
| `backend/src/userMonitor.ts` | 9 | `connection = process.env.REDIS_URI \|\| ""` |
| `backend/src/config/dispatchQueue.ts` | 2 | `DISPATCH_QUEUE_REDIS_URI = process.env.REDIS_URI \|\| ""` |

---

## 3. Fallback a 127.0.0.1:6379

Cuando `REDIS_URI` es `""` o `undefined`:

- **ioredis** (`new Redis("")`): usa default `127.0.0.1:6379`
- **Bull** (`new BullQueue("name", "")`): usa default `127.0.0.1:6379`

Por eso los logs muestran 6379 aunque el .env diga 5000: **el .env no se está cargando antes de que se evalúe `config/redis.ts`**, o el proceso arranca con un `cwd` distinto y no encuentra el `.env`.

---

## 4. Orden de carga y causa del fallo

1. `server.ts` importa `import 'dotenv/config'` → carga `.env` desde `process.cwd()`
2. `app.ts` importa `import "./bootstrap"` → `bootstrap.ts` hace `dotenv.config({ path: ".env" })` → también usa `process.cwd()`
3. Si PM2 se inicia desde `/home/deploy/empresa` (raíz del proyecto), `cwd` es esa carpeta y busca `/home/deploy/empresa/.env`
4. Si el `.env` está en `/home/deploy/empresa/backend/.env`, **no se carga**
5. `process.env.REDIS_URI` queda `undefined` → fallback a `""` → ioredis/Bull usan 6379

---

## 5. ¿El callback de Facebook depende de Redis?

**No.** El `FacebookOAuthController.facebookCallback` no usa Redis ni sesiones. Usa `code` y `state` de la query. `ERR_SESSION_EXPIRED` viene de los middlewares de auth (`isAuth`, `isAuthCompany`, `tokenAuth`), no de Redis.

---

## 6. Configuración final recomendada

**Opción A (recomendada):** Usar Redis en 6379 sin password

```env
REDIS_URI=redis://127.0.0.1:6379
```

**Opción B:** Si Redis tiene password:

```env
REDIS_URI=redis://:TU_PASSWORD@127.0.0.1:6379
```

**Opción C:** Configurar Redis en puerto 5000 con password (requiere editar `redis.conf` y reiniciar Redis).

---

## 7. Fix aplicado

### 7.1 `bootstrap.ts` – path absoluto para `.env`

Se usa `path.resolve(__dirname, '..', '.env')` para cargar siempre el `.env` del directorio `backend/`, independientemente del `cwd`:

```typescript
import dotenv from "dotenv";
import path from "path";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({
  path: path.resolve(__dirname, "..", envFile)
});
```

### 7.2 `ecosystem.config.js` – `cwd` explícito

Se define `cwd` para que PM2 ejecute siempre desde `backend/`:

```javascript
module.exports = [{
  script: 'dist/server.js',
  cwd: __dirname,  // backend/
  name: 'multipremium-back',
  // ...
}];
```

### 7.3 `.env` – `REDIS_URI` correcto

```env
REDIS_URI=redis://127.0.0.1:6379
```

Y corregir el typo: `REGIS_OPT_LIMITER_DURATION` → `REDIS_OPT_LIMITER_DURATION`.

---

## 8. Comandos para aplicar

```bash
cd /home/deploy/empresa/backend
# Editar .env: REDIS_URI=redis://127.0.0.1:6379
npm run build
pm2 restart all
```

---

## 9. Verificación

```bash
# Ver variables cargadas (añadir temporalmente en bootstrap.ts):
# console.log('REDIS_URI loaded:', process.env.REDIS_URI ? 'YES' : 'NO');

# O desde el servidor:
redis-cli ping
# Debe responder: PONG
```
