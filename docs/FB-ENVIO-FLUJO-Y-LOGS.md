# Flujo de envío Facebook/Instagram y logs

## Archivos exactos del flujo saliente

| Paso | Archivo | Función | Línea aprox |
|------|---------|---------|-------------|
| 1 | `backend/src/controllers/MessageController.ts` | `store` | 548, 615 |
| 2 | `backend/src/services/FacebookServices/sendFacebookMessage.ts` | `sendFacebookMessage` | 13-45 |
| 3 | `backend/src/services/FacebookServices/graphAPI.ts` | `sendText` | 62-90 |

## Flujo

1. **MessageController.store** (línea 548): `ticket = await ShowTicketService(ticketId, companyId, userId)`
2. **MessageController.store** (línea 615): `sendFaceMessage({ body, ticket, quotedMsg })`
3. **sendFacebookMessage**: usa `ticket.contact.number` (recipient/PSID), `ticket.whatsapp.facebookUserToken`
4. **graphAPI.sendText**: `POST https://graph.facebook.com/v20.0/me/messages` con `{ recipient: { id }, message: { text } }`

## Logs que verás al enviar

### Envío exitoso
```
[FB_SEND] INICIO | channel: facebook | conexion: FB Multillantas ElPana (id: 12) | pageId: 123456789 | recipient: 3229087643779913 | token: EAAxxxxx...xxxx
[GRAPH_API] POST https://graph.facebook.com/v20.0/me/messages | payload: {"recipient":{"id":"3229087643779913"},"message":{"text":"Hola"}}
[GRAPH_API] response.status: 200 | response.data: {"recipient_id":"3229087643779913","message_id":"mid.xxx"}
[FB_SEND] OK | conexion: FB Multillantas ElPana | recipient: 3229087643779913
```

### Envío fallido
```
[FB_SEND] INICIO | channel: facebook | conexion: FB Multillantas ElPana (id: 12) | pageId: 123456789 | recipient: 3229087643779913 | token: EAAxxxxx...xxxx
[GRAPH_API] POST https://graph.facebook.com/v20.0/me/messages | payload: {...}
[GRAPH_API] FAIL | status: 400 | response.data: {"error":{"message":"Invalid OAuth access token","type":"OAuthException","code":190}}
[FB_SEND] FAIL | conexion: FB Multillantas ElPana | recipient: 3229087643779913 | code: 190 | Meta: Invalid OAuth access token
[FB_SEND] error.response.data: {"error":{"message":"Invalid OAuth access token",...}}
```

## Logs de recepción

```
[WEBHOOK] POST /webhook - object: page | entries: 1 | hasMessaging: true | fields: messaging
[FB_RECV] entry.id=123456789 | sender.id=3229087643779913 | conexion=FB Multillantas ElPana (id=12) | channel=facebook | companyId=1
[FB_RECV] handleMessage | senderPsid: 3229087643779913 | recipientPsid: 123456789 | conexion: FB Multillantas ElPana | channel: facebook
[FB_RECV] ticket listo | ticketId: 456 | whatsappId: 12 | contact.number: 3229087643779913
```

## Hipótesis a validar con los logs

| Hipótesis | Qué buscar en logs |
|-----------|--------------------|
| a) Token incorrecto | `[GRAPH_API] FAIL` con code 190, "Invalid OAuth access token" |
| b) Page id incorrecto | No aplica al envío; el token ya identifica la página |
| c) Recipient id incorrecto | `[GRAPH_API] FAIL` con "The parameter recipient is required" o "Recipient not found" |
| d) Conexión equivocada | Comparar `[FB_SEND] conexion` con `[FB_RECV] conexion` para el mismo ticket |
| e) Error no mostrado | Ahora sí se loguea `error.response.data` completo |

## Verificar conexiones en DB

```bash
# PostgreSQL
psql -U postgres -d whaticket -c "SELECT id, name, channel, \"facebookPageUserId\", \"companyId\", status, CASE WHEN \"facebookUserToken\" IS NOT NULL THEN 'SI' ELSE 'NO' END AS token FROM \"Whatsapps\" WHERE channel IN ('facebook','instagram');"
```

## Cómo probar

1. `pm2 restart empresa-backend`
2. `pm2 logs empresa-backend --lines 0`
3. Enviar un mensaje desde Whaticket a una conversación de Facebook
4. Copiar los logs `[FB_SEND]` y `[GRAPH_API]` completos
