# Canales: Telegram y otras redes sociales

Whatiket integra **Telegram**, **WhatsApp** y otros canales a través de **NotificaMe Hub**.

## ¿Qué es NotificaMe Hub?

Es una plataforma externa donde configuras tus bots de Telegram, WhatsApp y otros canales. Luego conectas esos canales a Whatiket usando un token.

**URL actual:** https://app.notificame.com.br/

---

## Cómo configurar Telegram y otros canales

### 1. Crear cuenta en NotificaMe Hub

1. Entra a https://app.notificame.com.br/
2. Regístrate o inicia sesión
3. Crea tu cuenta si es la primera vez

### 2. Configurar tu bot de Telegram en el Hub

1. En Telegram, habla con [@BotFather](https://t.me/BotFather)
2. Crea un bot con `/newbot` y obtén el token
3. En NotificaMe Hub, agrega un canal de tipo **Telegram**
4. Pega el token del bot y guarda

### 3. Obtener el token del Hub

1. En NotificaMe Hub, ve a la sección de configuración o perfil
2. Copia el **token de integración** (token del Hub)

### 4. Configurar el token en Whatiket

1. En Whatiket: **Configuración** → **Opciones**
2. Busca el campo **"Token NotificameHub"**
3. Pega el token del Hub
4. Guarda los cambios

### 5. Agregar el canal en Whatiket

1. Ve a **Canales**
2. Haz clic en el botón **+** (Agregar conexión)
3. Selecciona **NotificaMe Hub**
4. Elige el canal que configuraste (Telegram, WhatsApp, etc.)
5. Guarda

---

## Resumen del flujo

```
NotificaMe Hub (app.notificame.com.br)
    │
    ├── Configuras: Bot Telegram, WhatsApp, etc.
    ├── Obtienes: Token del Hub
    │
    ▼
Whatiket
    │
    ├── Configuración → Token NotificameHub
    └── Canales → NotificaMe Hub → Seleccionar canal
```

---

## Íconos en la interfaz

- **WhatsApp**: ícono verde
- **Instagram**: ícono rosa
- **Facebook**: ícono azul
- **Telegram**: ícono azul claro (cuando el canal viene del Hub)

---

## Solución de problemas

### "Ningún canal disponible"

- Verifica que el token del Hub esté guardado en **Configuración → Opciones**
- Asegúrate de haber configurado al menos un canal en NotificaMe Hub
- Revisa que el token sea el correcto (cópialo de nuevo desde el Hub)

### El canal no recibe mensajes

- Comprueba que el bot de Telegram esté activo y con el token correcto en el Hub
- En Telegram, los usuarios deben iniciar la conversación con `/start` o enviando un mensaje al bot

### Error al conectar

- Confirma que la URL del Hub sea https://app.notificame.com.br/
- Si el Hub cambió de dominio, actualiza la configuración según la documentación oficial de NotificaMe
