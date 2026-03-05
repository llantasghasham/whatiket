# Funcionalidad de los módulos – Whatiket

Documentación por módulo para uso profesional y soporte.

---

## 1. Facebook e Instagram (Conexiones)

### Qué hace
Permite conectar páginas de Facebook y cuentas de Instagram Business para recibir y enviar mensajes desde el sistema (canales de atención).

### Cómo funciona
1. **Configuración previa (una vez)**
   - En **Meta for Developers** (developers.facebook.com) crear una app.
   - Añadir producto **Facebook Login** y **Webhooks** (Messenger).
   - En Variables de entorno del backend:
     - `FACEBOOK_APP_ID`: ID de la app.
     - `FACEBOOK_APP_SECRET`: secreto de la app.
     - `BACKEND_URL`: URL pública del backend (ej. `https://api.tudominio.com`).  
   - La URL de redirección OAuth debe ser exactamente:  
     `{BACKEND_URL}/facebook-callback` y `{BACKEND_URL}/instagram-callback`.

2. **Flujo de conexión**
   - El usuario entra en **Canais** (Conexiones) y abre el modal **Facebook/Instagram**.
   - Elige **Conectar Facebook** o **Conectar Instagram**.
   - Se redirige a Facebook para autorizar (permisos de páginas/mensajes).
   - Facebook redirige al backend con un `code`; el backend lo intercambia por token y crea las conexiones (Facebook e Instagram si aplica).
   - Al final se redirige a `/canais?success=facebook-connected` o `?success=instagram-connected`.

3. **Importante**
   - Se usa `response_type=code` (flujo con código), no token en el front.
   - La URL de callback debe ser la del **backend**, no la del frontend.
   - El plan de la empresa debe tener **useFacebook** / **useInstagram** activos.

### Dónde se configura
- Frontend: `Canais` → botón/modal de conexión Facebook/Instagram.
- Backend: `FacebookOAuthController` (facebook/instagram callback), variables de entorno anteriores.

---

## 2. Ayuda (Helps)

### Qué hace
Módulo de ayuda para cargar y mostrar guías, enlaces y archivos (PDF, documentos, etc.) por empresa.

### Cómo funciona
1. **Gestión (admin)**
   - En **Configurações** (o pantalla donde esté **HelpsManager**):
     - **Título**: nombre del ítem de ayuda.
     - **Descripción**: texto explicativo.
     - **Vídeo**: código o URL de vídeo (ej. YouTube).
     - **Enlace / Archivo**: URL manual o archivo subido.
   - **Subir archivo de ayuda**: se elige un archivo (PDF, DOC, TXT, imágenes); se envía a `POST /helps/upload`. El backend guarda en `public/company{id}/help/` y devuelve la URL; esa URL se guarda en el campo **link** del ítem de ayuda.
   - Al guardar se crea/actualiza el registro en la tabla **Helps** (título, descripción, video, link).

2. **Consulta (usuario)**
   - La lista de ayudas se obtiene con `GET /helps/list`.
   - Cada ítem puede tener link; si existe, se muestra “Abrir archivo de ayuda” con esa URL.

3. **Página “Ayuda” (/helps)
   - En el front puede mostrarse también la lista de **vídeos tutoriales** (servicio de tutorial videos) y/o la lista de **Helps** (títulos, descripciones, enlaces/archivos). Según cómo esté montada la pantalla, se listan uno u otro o ambos.

### Dónde se configura
- Backend: `HelpController`, `helpRoutes` (incluye `POST /helps/upload`).
- Frontend: componente **HelpsManager** (formulario + lista + subida de archivo), y página **Helps** si muestra estos ítems.

---

## 3. Resumen por archivo clave

| Módulo        | Frontend                          | Backend                               |
|---------------|-----------------------------------|----------------------------------------|
| Facebook/Insta| `FacebookInstagramModal`          | `FacebookOAuthController`, `graphAPI`  |
| Ayuda + upload| `HelpsManager`                    | `HelpController`, `helpRoutes`         |

---

## 4. Variables de entorno recomendadas

- `BACKEND_URL`: URL pública del backend (para OAuth y URLs de archivos).
- `FRONTEND_URL`: URL del frontend (redirecciones tras OAuth).
- `FACEBOOK_APP_ID` y `FACEBOOK_APP_SECRET`: para Facebook/Instagram.

Si algo no funciona, revisar que las URLs de callback OAuth coincidan con `BACKEND_URL` y que el plan tenga permisos Facebook/Instagram activos.
