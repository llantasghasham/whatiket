# Mensajes lentos y bot no responde

## 1. Mensajes llegan muy lento

### Posibles causas
- **Socket lento o desconectado** – la conexión en tiempo real se cae o tiene latencia
- **Backend sobrecargado** – CPU/memoria alta
- **Redis lento** (si usas Redis para sesiones)
- **Red del servidor** – latencia entre WhatsApp/API y tu servidor

### Qué revisar
```bash
pm2 list
pm2 monit
# Ver uso de CPU/memoria del backend
```

En el navegador (F12 → Console): errores de WebSocket o conexión.

### Soluciones
- Reiniciar backend: `pm2 restart empresa-backend`
- Revisar Redis si lo usas
- Comprobar que solo hay 1 instancia de empresa-backend

---

## 2. Bot no responde

### Posibles causas
- **WhatsApp desconectado** – conexión en DISCONNECTED o CONFLICT
- **Integración sin configurar** – la conexión no tiene FlowBuilder asignado
- **Flujo mal configurado** – nodo start o conexiones incorrectas
- **Error en n8n** (si usas n8n) – "No Respond to Webhook node found"

### Qué revisar
1. **Conexiones** → estado de WhatsApp (debe estar CONNECTED)
2. **Conexión** → Integración asignada (FlowBuilder)
3. **Flujo** en FlowBuilder → nodo start y conexiones correctas
4. Logs: `pm2 logs empresa-backend | grep -E "flowbuilder|ActionsWebhook|conflict"`

### Si ves "No Respond to Webhook node found"
Ese error viene de n8n. Revisa el workflow en n8n y asegúrate de tener un nodo "Respond to Webhook".

---

## 3. Mensaje no envía (queda en la caja)

### Fix aplicado
- Enter con respuestas rápidas abiertas: ahora envía si hay texto
- Debounce reducido (150ms)
- Toast de error cuando falla el envío

Si sigue fallando: abrir F12 → Console y ver si hay errores al enviar.
