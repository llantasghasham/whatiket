# Integración Facebook e Instagram - Whaticket

## Resumen de correcciones realizadas

### 1. Problemas identificados y solucionados

| Problema | Causa | Solución |
|----------|-------|----------|
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

### Configuración del producto
1. **Facebook Login** → Configuración → Valid OAuth Redirect URIs:  
   `https://tu-backend.com/facebook-callback`  
   `https://tu-backend.com/instagram-callback`

2. **Webhooks** → Configurar:
   - URL de callback: `https://tu-backend.com/webhook`
   - Verify token: `whaticket` (o el valor de `VERIFY_TOKEN`)
   - Suscribir: `messages`, `messaging_postbacks`, `message_deliveries`, `message_reads`, `message_echoes`

3. **Instagram** (si usas Instagram):
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
