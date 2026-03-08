# Fix ERR_SESSION_EXPIRED en Facebook/Instagram OAuth Callback

## 1. Causa exacta del error

El callback de Meta (`https://api.shakarbakar.com/facebook-callback?code=...&state=...`) devolvía `{"error":"ERR_SESSION_EXPIRED"}` porque:

- La petición **no incluye** el header `Authorization: Bearer <token>` (es una redirección del navegador desde Facebook).
- Algún router con middleware `isAuth` estaba interceptando la petición **antes** de llegar al handler del callback.
- `isAuth` exige `Authorization`; si no existe, lanza `ERR_SESSION_EXPIRED`.

El flujo OAuth **no debe** usar sesión ni cookies. El `state` (con `companyId`) viaja en la URL y Meta lo devuelve tal cual.

## 2. Archivos modificados

### `backend/src/app.ts`
- Import de `FacebookOAuthController`
- `app.set("trust proxy", 1)` para uso detrás de nginx
- Rutas OAuth montadas **antes** de `app.use(routes)`:
  - `app.get("/facebook-callback", ...)`
  - `app.get("/instagram-callback", ...)`
  - `app.get("/api/facebook-callback", ...)`
  - `app.get("/api/instagram-callback", ...)`

### `backend/src/routes/index.ts`
- Eliminado `facebookOAuthRoutes` (ahora se usan las rutas en `app.ts`)

### `backend/src/controllers/FacebookOAuthController.ts`
- Log de diagnóstico al recibir el callback

## 3. Código exacto añadido en app.ts

```typescript
// Trust proxy (nginx/reverse proxy)
app.set("trust proxy", 1);

// ... (middlewares existentes) ...

// OAUTH FACEBOOK/INSTAGRAM - Montado ANTES de routes para evitar isAuth
app.get("/facebook-callback", FacebookOAuthController.facebookCallback);
app.get("/instagram-callback", FacebookOAuthController.instagramCallback);
app.get("/api/facebook-callback", FacebookOAuthController.facebookCallback);
app.get("/api/instagram-callback", FacebookOAuthController.instagramCallback);

// Rotas
app.use(routes);
```

## 4. Por qué ocurría

Las rutas OAuth estaban dentro de `routes` junto con el resto. En Express, el orden de los routers importa. Algún router montado antes podía coincidir con la petición (por ejemplo, rutas con parámetros dinámicos) y aplicar `isAuth`, provocando el error.

Al montar las rutas OAuth directamente en `app` y **antes** de `app.use(routes)`, se garantiza que:

1. No pasan por ningún middleware de autenticación.
2. Se procesan antes que el resto de rutas.
3. El callback funciona sin `Authorization` ni cookies.

## 5. Solución implementada

- Rutas OAuth en `app.ts` antes de `app.use(routes)`.
- Rutas duplicadas en `/api/...` por si el proxy añade el prefijo `/api`.
- `trust proxy` activado para uso detrás de nginx.
- El flujo usa solo `state` (companyId) en la URL, sin sesión ni cookies.

## 6. Variables de entorno

No se requieren cambios. Las existentes siguen siendo válidas:

```env
BACKEND_URL=https://api.shakarbakar.com
FRONTEND_URL=https://chatwoot.shakarbakar.com
FACEBOOK_APP_ID=958222771865716
FACEBOOK_APP_SECRET=...
VERIFY_TOKEN=whaticket
```

## 7. Comandos para reiniciar

```bash
cd /home/deploy/empresa && git pull origin main && cd backend && npm install --legacy-peer-deps && npm run build && pm2 restart all
```

## 8. Pasos para probar

1. Canales → + → Facebook (o Instagram).
2. Clic en "Conectar Facebook".
3. Autorizar en Meta.
4. Comprobar redirección a `/canais?success=facebook-connected`.
5. Verificar que la conexión aparece en la lista.

## 9. Migraciones

No se requieren migraciones ni limpieza de conexiones anteriores.
