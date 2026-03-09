# Integración Facebook e Instagram - Whaticket

## Resumen de correcciones realizadas

### 1. Problemas identificados y solucionados

| Problema | Causa | Solución |
|----------|-------|----------|
| **ERR_SESSION_EXPIRED en callback** | Las rutas OAuth dentro de `routes` podían ser interceptadas por otro router con `isAuth` antes de llegar al callback | Rutas OAuth montadas directamente en `app.ts` ANTES de `app.use(routes)`; así nunca pasan por ningún middleware de auth |
| **Internal server error al Guardar** | Al agregar conexión nueva, `whatsAppId` es undefined; PUT /whatsapp/undefined falla | Botón Guardar deshabilitado cuando no hay whatsAppId; validación antes de llamar API |
| **Dominio no incluido en la app** | api.shakarbakar.com no está en App Domains de Meta | Añadir en Meta: Configuración → Básica → Dominios de la app |
| **FB.login() called before FB.init()** | El menú usaba `FacebookLogin` que llama a `FB.login()` antes de que el SDK cargue | Reemplazado por flujo OAuth: clic abre modal → botón redirige a Facebook OAuth → backend recibe callback |
| **Modal no abría** | Los botones Facebook/Instagram ejecutaban `FB.login()` directamente | Ahora abren `FacebookInstagramModal` que usa OAuth redirect (sin SDK) |
| **Error 500 en hub-channel** | ListChannels podía fallar con token faltante | Ya devolvía `[]` en catch; se mantiene el manejo |
| **Plan useFacebook/useInstagram** | Bloqueaba si el plan no tenía permisos | Verificación relajada: si es false, se permite igual (log de advertencia) |
| **Webhook forEach async** | `forEach` con async no esperaba | Cambiado a `for...of` con `await handleMessage` |
| **Socket emit incorrecto** | `io.to(room)` no actualizaba frontend | Cambiado a `io.of(companyId).emit(company-${companyId}-whatsapp, ...)` |
| **Duplicados al reconectar** | Creaba nueva conexión siempre | Verificación de existencia por `facebookPageUserId` + `channel`; actualiza si existe |

---

## Archivos modificados

### Frontend
- **`frontend/src/pages/Canais/index.js`**
  - Eliminado `FacebookLogin` y `responseFacebook`/`responseInstagram`
  - Añadido `handleOpenFacebookModal(channel)` que abre el modal
  - Menú: Facebook e Instagram son `MenuItem` que abren el modal
  - `useEffect` para mostrar toast en redirect OAuth (`?success=` / `?error=`)

- **`frontend/src/components/FacebookInstagramModal/index.js`**
  - Props: `channel`, `companyId`
  - `oauthState` = companyId desde props o localStorage
  - Validación de companyId antes de redirigir
  - `backendUrl` sin barra final para `redirect_uri`
  - `activeTab` según `channel` (facebook=0, instagram=1)

- **`frontend/src/translate/languages/es.js`** y **`pt.js`**
  - `connections.facebook.success`
  - `connections.facebook.error`

### Backend
- **`backend/src/app.ts`**
  - Rutas OAuth montadas directamente: `app.get("/facebook-callback", ...)`, `app.get("/instagram-callback", ...)`, más `/api/facebook-callback` y `/api/instagram-callback` (por si el proxy añade prefijo)
  - Montadas ANTES de `app.use(routes)` para que nunca pasen por isAuth
  - `app.set("trust proxy", 1)` para correcto manejo detrás de nginx

- **`backend/src/controllers/FacebookOAuthController.ts`**
  - Plan: si `useFacebook`/`useInstagram` es false, se permite (solo log)
  - `backendUrl` sin barra final
  - Duplicados: busca por `facebookPageUserId` + `channel`; actualiza si existe
  - Emit: `io.of(companyId).emit(company-${companyId}-whatsapp, { action, whatsapp })`
  - Errores: redirect a `/canais?error=...` en lugar de JSON
  - `for...of` en lugar de `for await`

- **`backend/src/controllers/WebHookController.ts`**
  - `forEach` async reemplazado por `for...of` con `await handleMessage`
  - Logs de error más claros

- **`backend/src/services/FacebookServices/graphAPI.ts`**
  - Log de error en `getPageProfile`

---

## Endpoints utilizados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/facebook-callback` | Callback OAuth Facebook (code → token → páginas → conexiones) |
| GET | `/instagram-callback` | Callback OAuth Instagram |
| GET | `/webhook` | Verificación y recepción de webhooks Meta (Facebook + Instagram) |
| POST | `/webhook` | Eventos de mensajes de Meta |
| POST | `/facebook` | Crear conexión desde token (legacy, usado por CompanyWhatsapps/AllConnections) |

---

## Variables de entorno necesarias

```env
# Meta / Facebook
FACEBOOK_APP_ID=tu_app_id
FACEBOOK_APP_SECRET=tu_app_secret

# URLs (sin barra final)
BACKEND_URL=https://api.tudominio.com
FRONTEND_URL=https://app.tudominio.com

# Webhook (opcional, default: whaticket)
VERIFY_TOKEN=whaticket

# Frontend
REACT_APP_FACEBOOK_APP_ID=tu_app_id
REACT_APP_BACKEND_URL=https://api.tudominio.com
```

**Importante:** `REACT_APP_BACKEND_URL` y `BACKEND_URL` deben ser la misma URL del backend.

---

## Permisos de Meta (Facebook App)

En [developers.facebook.com](https://developers.facebook.com) → Tu App → App Review:

### Facebook
- `pages_messaging` - Mensajes de Messenger
- `pages_show_list` - Listar páginas
- `pages_manage_metadata` - Metadatos
- `pages_read_engagement` - Engagement
- `business_management` - Gestión de negocio
- `public_profile` - Perfil básico

### Instagram
- `instagram_basic` - Datos básicos
- `instagram_manage_messages` - Mensajes de Instagram Direct
- Los mismos de páginas que arriba

### Configuración del producto (CRÍTICO para evitar errores)

#### 1. Dominios de la app (evita "El dominio de esta URL no está incluido en los dominios de la app")
- **Configuración** → **Básica** → **Dominios de la app**
- Añadir EXACTAMENTE (uno por línea, sin https://):
  ```
  api.shakarbakar.com
  chatwoot.shakarbakar.com
  shakarbakar.com
  ```

#### 2. URIs de redirección OAuth
- **Facebook Login** → **Configuración** → **URIs de redirección OAuth válidos**, añadir:
  ```
  https://api.shakarbakar.com/facebook-callback
  https://api.shakarbakar.com/instagram-callback
  ```
- Si tu proxy usa /api, añadir también:
  ```
  https://api.shakarbakar.com/api/facebook-callback
  https://api.shakarbakar.com/api/instagram-callback
  ```

#### 3. Webhooks
- **Webhooks** → Configurar:
   - URL de callback: `https://api.shakarbakar.com/webhook`
   - Token de verificación: `whaticket` (debe coincidir con VERIFY_TOKEN en .env)
   - Suscribir: `messages`, `messaging_postbacks`, `message_deliveries`, `message_reads`, `message_echoes`

#### 4. Instagram (si usas Instagram)
   - Añadir producto "Instagram Graph API"
   - Webhook igual que Facebook (misma URL)
   - La página debe tener cuenta Instagram Business vinculada

---

## Flujo de conexión

1. Usuario: Canales → + → Facebook o Instagram
2. Se abre `FacebookInstagramModal` con la pestaña correspondiente
3. Usuario hace clic en "Conectar Facebook" o "Conectar Instagram"
4. Redirección a `https://www.facebook.com/v18.0/dialog/oauth?...&state={companyId}`
5. Usuario inicia sesión en Meta y autoriza
6. Meta redirige a `{BACKEND_URL}/facebook-callback` o `instagram-callback` con `code`
7. Backend intercambia `code` por access token
8. Backend obtiene páginas con `getPageProfile`
9. Backend crea/actualiza conexiones en `Whatsapp`
10. Backend llama a `subscribeApp` para webhooks
11. Backend emite por socket y redirige a `{FRONTEND_URL}/canais?success=facebook-connected`
12. Frontend muestra toast y recarga conexiones

---

## Webhook

- **GET /webhook**: Meta valida con `hub.mode`, `hub.verify_token`, `hub.challenge`
- **POST /webhook**: Recibe eventos con `object: "page"` (Facebook) o `object: "instagram"`
- Se busca `Whatsapp` por `facebookPageUserId` = `entry.id` y `channel`
- Para cada mensaje se llama a `handleMessage`

---

## Pendiente para 100% operativo

1. **App de Meta en modo Live**: La app debe estar en producción para usuarios finales
2. **Dominio verificado**: En Meta for Developers, verificar el dominio del backend
3. **Plan useFacebook/useInstagram**: Si quieres restringir por plan, activar en la tabla `Plans`
4. **Pruebas**: Enviar mensajes de prueba desde Messenger e Instagram Direct
