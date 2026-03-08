# Verificación: mensajes de Facebook/Instagram no entran

## 1. Filtro en la app

En la pantalla de conversaciones hay iconos de filtro (WhatsApp, Facebook, Instagram). **Por defecto pueden mostrarse solo conversaciones de WhatsApp.**

- Haz clic en el icono de **Facebook** (círculo azul con "f") para ver solo conversaciones de Facebook.
- Haz clic en el icono de **Instagram** para ver solo conversaciones de Instagram.

---

## 2. Webhook configurado en Meta Developer Console

Para que Meta envíe mensajes al backend, el webhook debe estar configurado:

1. Entra en [developers.facebook.com](https://developers.facebook.com) → tu app.
2. **Productos** → **Webhooks** (o **Configuración** → **Básica** → **Webhooks**).
3. En **Webhooks**, configura:

| Campo | Valor |
|-------|-------|
| **Callback URL** | `https://api.shakarbakar.com/webhook` |
| **Verify Token** | `whaticket` (o el valor de `VERIFY_TOKEN` en tu `.env`) |

4. Suscripciones necesarias:
   - **Page** (Facebook): `messages`, `messaging_postbacks`, `message_deliveries`, `message_reads`, `message_echoes`
   - **Instagram** (si usas Instagram): suscripción a Instagram con los campos de mensajes

---

## 3. Comprobar que Meta llama al webhook

Con el backend en marcha:

```bash
pm2 logs empresa-backend --lines 0
```

Envía un mensaje de prueba desde Facebook o Instagram. En los logs deberías ver algo como:

```
[WEBHOOK] POST /webhook - object: page | entries: 1
[WEBHOOK] Page found, processing messages
```

Si no aparece nada, Meta no está enviando eventos al webhook (URL incorrecta, webhook no verificado o suscripciones mal configuradas).

---

## 4. Probar el webhook manualmente

```bash
curl -X GET "https://api.shakarbakar.com/webhook?hub.mode=subscribe&hub.verify_token=whaticket&hub.challenge=test123"
```

Debe responder con `test123`. Si responde 403, el `VERIFY_TOKEN` no coincide.

---

## 5. Checklist rápido

| Paso | Comprobar |
|------|-----------|
| 1 | En la app, filtrar por Facebook/Instagram (iconos en la barra de conversaciones) |
| 2 | En Meta: Callback URL = `https://api.shakarbakar.com/webhook` |
| 3 | En Meta: Verify Token = `whaticket` |
| 4 | En Meta: suscripción a **Page** activa |
| 5 | En Meta: suscripción a **Instagram** activa (si usas Instagram) |
| 6 | Backend en ejecución y accesible desde internet |
| 7 | Nginx/proxy reenvía correctamente las peticiones a `/webhook` |

---

## 6. Errores frecuentes

- **Solo ves WhatsApp:** usa el filtro de Facebook/Instagram.
- **Meta no envía eventos:** webhook no configurado o URL incorrecta.
- **403 en verificación:** `VERIFY_TOKEN` distinto al configurado en Meta.
- **Página no suscrita:** al conectar con OAuth se llama `subscribeApp`, pero el webhook de la app debe estar configurado antes.
