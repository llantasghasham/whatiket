# WhatsApp: Stream Errored (conflict) / type: replaced

## Qué significa

```
"tag": "conflict",
"attrs": { "type": "replaced" }
"message": "Stream Errored (conflict)"
```

**El mismo número de WhatsApp está conectado en más de un lugar.** WhatsApp cierra la sesión anterior cuando detecta una nueva.

---

## Causas habituales

1. **Dos conexiones en Whaticket con el mismo número**
   - Ej.: conexión "26662727" y "88164228" usando el mismo WhatsApp
   - Solución: dejar solo UNA conexión activa por número

2. **WhatsApp Web abierto en otro navegador/pestaña**
   - Solución: cerrar todas las sesiones de WhatsApp Web excepto la de Whaticket

3. **App de WhatsApp en el celular + Whaticket**
   - Normalmente no da conflicto si no se escanea el QR en otro lado
   - El conflicto aparece cuando se conecta el mismo número desde otro dispositivo/sesión

4. **Múltiples instancias del backend**
   - Si hay varios procesos intentando conectar el mismo número
   - Solución: una sola instancia de empresa-backend en PM2

---

## Qué hacer

### 1. Revisar conexiones en Whaticket

En **Conexiones**:
- Si hay 2 conexiones con el mismo número → **Desconectar** una
- Usar solo 1 conexión por número de WhatsApp

### 2. Cerrar otras sesiones de WhatsApp Web

- Ir a WhatsApp en el celular
- **Ajustes** → **Dispositivos vinculados**
- Cerrar sesión en los dispositivos que no sean Whaticket

### 3. Reconectar desde cero

1. En Whaticket: **Desconectar** la conexión problemática
2. Esperar 1–2 minutos
3. **Conectar** de nuevo y escanear el QR
4. No abrir WhatsApp Web en otro lado con ese número

---

## Logs de referencia

Si ves en los logs:
```
Socket 26662727 Connection Update close Stream Errored (conflict)
[WhatsApp] Reintento 1 en 10s - 26662727
```

Es el ciclo de conflicto: una sesión reemplaza a la otra y se repite.
