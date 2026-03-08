# Trazabilidad ERR_SESSION_EXPIRED - Facebook OAuth Callback

## 1. Archivos donde se lanza ERR_SESSION_EXPIRED

| Archivo | Línea | Condición |
|---------|-------|-----------|
| `middleware/isAuth.ts` | 25 | `!authHeader` |
| `middleware/isAuth.ts` | 76 | Error al renovar token |
| `middleware/isAuthCompany.ts` | 13 | `!authHeader` |
| `middleware/isAuthCompany.ts` | 21 | `!getToken` |
| `middleware/isAuthCompany.ts` | 25 | `getToken !== token` |
| `middleware/tokenAuth.ts` | 13 | `!authHeader` |
| `middleware/tokenAuth.ts` | 22 | `!getToken` |
| `middleware/tokenAuth.ts` | 26 | `getToken !== token` |
| `controllers/SessionController.ts` | 87, 106 | Token refresh (cookies) |
| `services/AuthServices/RefreshTokenService.ts` | 37, 46 | Token refresh |

**FacebookOAuthController NO lanza ERR_SESSION_EXPIRED.** No usa req.user, req.session ni auth.

## 2. Logs de trazabilidad añadidos

### En app.ts (antes de las rutas OAuth)
- `[TRACE] REQUEST TO OAUTH PATH` - Cualquier petición cuyo path contenga `facebook-callback` o `instagram-callback`

### En los handlers app.get("/facebook-callback") etc.
- `[TRACE] HIT APP /facebook-callback` - La ruta de app.ts recibió la petición

### En FacebookOAuthController.facebookCallback
- `[TRACE] HIT FACEBOOK CONTROLLER CALLBACK` - El controller se ejecutó
- `[TRACE] QUERY:` - code, state recibidos

### En isAuth.ts (antes del throw)
- `[TRACE] ABOUT TO THROW ERR_SESSION_EXPIRED FROM isAuth.ts LINE 25`

### En isAuthCompany.ts
- `[TRACE] ABOUT TO THROW ERR_SESSION_EXPIRED FROM isAuthCompany.ts LINE 13`

### En tokenAuth.ts
- `[TRACE] ABOUT TO THROW ERR_SESSION_EXPIRED FROM tokenAuth.ts LINE 13`

## 3. Cómo interpretar los logs

### Escenario A: Ves `[TRACE] HIT APP /facebook-callback` y `[TRACE] HIT FACEBOOK CONTROLLER CALLBACK`
→ La petición llegó al controller correcto. El error NO viene de isAuth. Revisar si el error sale dentro del controller (ShowCompanyService, getPageProfile, etc.).

### Escenario B: Ves `[TRACE] REQUEST TO OAUTH PATH` pero NO ves `[TRACE] HIT APP /facebook-callback`
→ La petición llega con un path diferente (ej: `/api/v1/facebook-callback`). El path no coincide con nuestras rutas.

### Escenario C: Ves `[TRACE] ABOUT TO THROW ERR_SESSION_EXPIRED FROM isAuth.ts`
→ La petición fue interceptada por una ruta que usa isAuth. Nuestras rutas OAuth en app.ts NO se ejecutaron. **Causa: dist/app.js está desactualizado** (no tiene las rutas OAuth).

### Escenario D: No ves ningún log [TRACE]
→ La petición no llega al backend, o el código desplegado es muy antiguo.

## 4. CAUSA PROBABLE: dist/app.js desactualizado

**El archivo `backend/dist/app.js` actual NO contiene las rutas OAuth.** Solo tiene:
```javascript
app.use(routes_1.default);
```

Faltan las líneas:
```javascript
app.get("/facebook-callback", ...);
app.get("/instagram-callback", ...);
app.get("/api/facebook-callback", ...);
app.get("/api/instagram-callback", ...);
```

**Solución:** Ejecutar `npm run build` en el servidor DESPUÉS de `git pull`. El build compila `src/app.ts` → `dist/app.js`.

## 5. Comandos para rebuild y restart

```bash
cd /home/deploy/empresa
git pull origin main
cd backend
npm install --legacy-peer-deps
npm run build
pm2 restart all
```

## 6. Verificar que la versión desplegada es la nueva

```bash
# Ver si dist/app.js tiene las rutas OAuth
grep -n "facebook-callback" /home/deploy/empresa/backend/dist/app.js
```

Debe mostrar líneas con `app.get("/facebook-callback"` y `FacebookOAuthController`. Si no aparece, el build no se ejecutó correctamente.

## 7. Ver logs en tiempo real

```bash
pm2 logs
# o
pm2 logs backend --lines 100
```

Al hacer la prueba de "Conectar Facebook", buscar en los logs:
- `[TRACE] REQUEST TO OAUTH PATH`
- `[TRACE] HIT APP /facebook-callback`
- `[TRACE] HIT FACEBOOK CONTROLLER CALLBACK`
- `[TRACE] ABOUT TO THROW ERR_SESSION_EXPIRED FROM`
