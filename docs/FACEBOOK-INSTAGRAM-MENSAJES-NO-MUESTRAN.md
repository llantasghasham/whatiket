# Facebook e Instagram: mensajes no se muestran o no se envían

## Problema 1: Mensajes no se muestran (solo WhatsApp sí)

### Causa más frecuente: suscripción incorrecta en Meta

Si tienes **feed** y **likes** suscritos en Meta Developer Console, Meta envía eventos de publicaciones de la página, **no de conversaciones de Messenger**. El backend espera `entry.messaging` con los mensajes; con feed/likes ese campo viene vacío.

---

## Solución: cambiar la suscripción en Meta Developer Console

### Paso 1: Entrar a la configuración del webhook

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Selecciona tu **App**
3. En el menú izquierdo: **Productos** → **Webhooks** (o **Configuración** → **Básica** → **Webhooks**)

### Paso 2: Configurar la suscripción de Page (Facebook Messenger)

1. En la sección **Webhooks**, busca **Page**
2. Haz clic en **Configurar** o **Editar suscripción**
3. **Callback URL:** `https://api.shakarbakar.com/webhook`
4. **Verify Token:** `whaticket` (o el valor de `VERIFY_TOKEN` en tu `.env`)
5. En **Campos suscritos** (Subscribed Fields), **quita** si están:
   - `feed`
   - `likes`
6. **Añade** estos campos:
   - `messages`
   - `messaging_postbacks`
   - `message_deliveries`
   - `message_reads`
   - `message_echoes`
7. Guarda los cambios

### Paso 3: Configurar la suscripción de Instagram (si usas Instagram)

1. En la misma sección **Webhooks**, busca **Instagram**
2. Si no aparece, añade el producto **Instagram** a tu app
3. Configura el webhook con la misma URL y Verify Token
4. Suscríbete a los campos de mensajes de Instagram

### Paso 4: Suscribir la página al webhook

Aunque el webhook esté configurado, la **página** debe estar suscrita. Al conectar Facebook por OAuth en Whaticket, esto suele hacerse automáticamente. Si no:

- En Meta: **Configuración** → **Básica** → **Páginas** → asegúrate de que la página está vinculada
- O vuelve a conectar la página de Facebook desde Whaticket (Conexiones → Facebook → Conectar)

---

## Verificación con logs

Tras cambiar la suscripción, reinicia el backend y envía un mensaje de prueba desde Facebook o Instagram.

```bash
pm2 restart empresa-backend
pm2 logs empresa-backend --lines 0
```

### Si la suscripción es correcta (messages):

```
[WEBHOOK] POST /webhook - object: page | entries: 1 | hasMessaging: true | fields: messaging
[WEBHOOK] Page found, processing messages
```

### Si la suscripción es incorrecta (feed/likes):

```
[WEBHOOK] POST /webhook - object: page | entries: 1 | hasMessaging: false | fields: changes:feed
[WEBHOOK] AVISO: Meta envió evento pero SIN messaging. Si tienes feed/likes suscritos...
```

En ese caso, cambia la suscripción como en el Paso 2.

### Si no aparece ningún log

- Meta no está enviando eventos al webhook
- Revisa: URL del webhook, Verify Token, que la página esté suscrita
- Prueba la verificación: `curl "https://api.shakarbakar.com/webhook?hub.mode=subscribe&hub.verify_token=whaticket&hub.challenge=test123"` → debe responder `test123`

---

## Filtro en la app

En la pantalla de atendimientos, usa los iconos de canal:

- **Facebook** (círculo azul con "f") para ver solo conversaciones de Facebook
- **Instagram** para ver solo conversaciones de Instagram

Por defecto pueden mostrarse solo conversaciones de WhatsApp.

---

## Problema 2: Recibe mensajes pero no envía (solo una conexión recibe)

Si una conexión de Facebook/Instagram **recibe** mensajes en Whaticket pero al responder **no llegan** al cliente en Messenger/Instagram:

### Diagnóstico con logs

1. Reinicia el backend y envía un mensaje de prueba desde la app hacia Facebook/Instagram:
   ```bash
   pm2 restart empresa-backend
   pm2 logs empresa-backend --lines 0
   ```

2. Al intentar enviar, busca en los logs:
   - `[graphAPI] sendText FAIL` → Meta rechazó el envío. El mensaje indica la causa.
   - `[sendFacebookMessage] Conexión sin token` → La conexión no tiene token guardado.
   - `ERR_FB_SEND: facebookUserToken vacío` → Token nulo o expirado.

### Errores frecuentes de Meta

| Mensaje en log | Causa | Solución |
|----------------|-------|----------|
| `Invalid OAuth access token` | Token expirado o inválido | Reconectar la página: Conexiones → Desconectar → Volver a conectar Facebook |
| `(#100) The parameter recipient is required` | ID del contacto incorrecto | Revisar que el contacto tenga el PSID correcto |
| `(#551) This person is not in your audience` | Ventana de 24h cerrada (Instagram) | En Instagram solo puedes responder dentro de 24h tras el último mensaje del usuario |
| `pages_messaging` permission | Permisos insuficientes | En Meta Developer Console, solicitar `pages_messaging` y `pages_manage_metadata` |

### Solución: reconectar la conexión

1. En Whaticket: **Conexiones** → busca la conexión de Facebook/Instagram que falla.
2. Haz clic en **Desconectar**.
3. Vuelve a **Conectar** con la misma página.
4. Completa el flujo OAuth de Meta.
5. Prueba enviar un mensaje de nuevo.

Reconectar genera un token nuevo y suele resolver tokens expirados o permisos insuficientes.

---

## Resumen de campos

| Para conversaciones (mensajes) | Para publicaciones (NO usar) |
|--------------------------------|-----------------------------|
| `messages`                     | `feed`                      |
| `messaging_postbacks`          | `likes`                     |
| `message_deliveries`           |                             |
| `message_reads`                |                             |
| `message_echoes`               |                             |
