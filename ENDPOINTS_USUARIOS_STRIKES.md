# 👥 Endpoints de Usuarios y Sistema de Strikes

## 📍 URL Base Usuarios

```
https://horariossaladeconferencias-production.up.railway.app/api/usuarios
```

## 📍 URL Base Horarios (Actualizado)

```
https://horariossaladeconferencias-production.up.railway.app/api/horarios
```

---

## 👤 Endpoints de Usuarios

### 1. Crear Usuario

**Endpoint:** `POST /api/usuarios`

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "telefono": "+1234567890"
}
```

**Respuesta:**
```json
{
  "id": "65a1b2c3d4e5f6789abc123",
  "message": "Usuario creado exitosamente",
  "usuario": {
    "id": "65a1b2c3d4e5f6789abc123",
    "nombre": "Juan Pérez",
    "telefono": "+1234567890",
    "strikes": 0
  }
}
```

### 2. Obtener Usuario por Teléfono

**Endpoint:** `GET /api/usuarios/telefono/:telefono`

**Ejemplo:**
```
GET /api/usuarios/telefono/+1234567890
```

### 3. Agregar Strike a Usuario

**Endpoint:** `POST /api/usuarios/:id/strikes`

**Body:**
```json
{
  "motivo": "No respetó el horario asignado",
  "horario_id": "65a1b2c3d4e5f6789abc456"
}
```

**Respuesta:**
```json
{
  "id": "65a1b2c3d4e5f6789abc123",
  "strikes": 1,
  "tiene_muchos_strikes": false,
  "message": "Strike agregado exitosamente"
}
```

**Nota:** Si un usuario tiene 3 o más strikes, `tiene_muchos_strikes: true` y no podrá reservar la sala.

---

## 📅 Endpoints de Horarios (Actualizados)

### 1. Crear Horario (AHORA REQUIERE usuario_telefono)

**Endpoint:** `POST /api/horarios`

**Body (Actualizado):**
```json
{
  "fecha": "2024-01-15",
  "hora_inicio": "10:00",
  "hora_fin": "11:30",
  "titulo": "Reunión de equipo",
  "usuario_telefono": "+1234567890",
  "usuario_nombre": "Juan Pérez",
  "descripcion": "Revisión de proyectos",
  "organizador": "Juan Pérez",
  "participantes": "Equipo de desarrollo"
}
```

**Campos requeridos:**
- `fecha` (string): YYYY-MM-DD
- `hora_inicio` (string): HH:MM (24h)
- `hora_fin` (string): HH:MM (24h)
- `titulo` (string): Nombre del evento
- `usuario_telefono` (string): Teléfono del usuario que reserva

**Campos opcionales:**
- `usuario_nombre` (string): Solo si el usuario no existe, se creará automáticamente
- `descripcion`, `organizador`, `participantes`, `estado`

**Respuesta:**
```json
{
  "id": "65a1b2c3d4e5f6789abc456",
  "message": "Horario creado exitosamente",
  "usuario": {
    "id": "65a1b2c3d4e5f6789abc123",
    "nombre": "Juan Pérez",
    "telefono": "+1234567890",
    "strikes": 0
  }
}
```

**Error - Usuario con muchos strikes (403):**
```json
{
  "error": "Usuario tiene 3 o más strikes. No puede reservar la sala.",
  "strikes": 3
}
```

---

### 2. Marcar Uso Sin Reserva

**Endpoint:** `POST /api/horarios/:id/uso-sin-reserva`

**Descripción:** Registra que alguien usó la sala sin haber hecho reserva. Agrega un strike automáticamente.

**Body:**
```json
{
  "usuario_telefono": "+1234567890",
  "usuario_nombre": "Juan Pérez"
}
```

**Respuesta:**
```json
{
  "message": "Uso sin reserva registrado",
  "strike_agregado": true,
  "usuario": {
    "id": "65a1b2c3d4e5f6789abc123",
    "nombre": "Juan Pérez",
    "strikes": 1
  }
}
```

**Uso:** Cuando el bot detecta que alguien está usando la sala sin haber hecho reserva.

---

### 3. Marcar No Asistencia

**Endpoint:** `POST /api/horarios/:id/no-asistio`

**Descripción:** Marca que el usuario no asistió a su reserva sin cancelar. Agrega un strike automáticamente.

**Body:** No requiere body, usa el usuario_id del horario.

**Respuesta:**
```json
{
  "message": "No asistencia registrada y strike agregado",
  "usuario": {
    "id": "65a1b2c3d4e5f6789abc123",
    "nombre": "Juan Pérez",
    "strikes": 1,
    "tiene_muchos_strikes": false
  }
}
```

**Uso:** Cuando el bot detecta que pasó el horario y nadie asistió a la reserva.

---

### 4. Registrar Strike por No Respetar Horario

**Endpoint:** `POST /api/horarios/:id/strike`

**Descripción:** Agrega un strike manualmente cuando el usuario no respetó el horario (llegó tarde, se excedió del tiempo, etc.).

**Body:**
```json
{
  "motivo": "Llegó 30 minutos tarde sin avisar"
}
```

**Respuesta:**
```json
{
  "message": "Strike registrado exitosamente",
  "usuario": {
    "id": "65a1b2c3d4e5f6789abc123",
    "nombre": "Juan Pérez",
    "strikes": 2,
    "tiene_muchos_strikes": false
  }
}
```

**Uso:** Cuando el bot detecta que el usuario no respetó el horario (llegó tarde, se quedó más tiempo, etc.).

---

## 🎯 Flujo Completo del Sistema

### 1. Reservar Sala

```
Usuario → Bot: "Quiero reservar la sala mañana a las 10:00"
Bot → Usuario: "Necesito tu número de teléfono"
Usuario → Bot: "+1234567890"
Bot → POST /api/horarios {
  fecha: "2024-01-16",
  hora_inicio: "10:00",
  hora_fin: "11:00",
  titulo: "Reunión",
  usuario_telefono: "+1234567890",
  usuario_nombre: "Juan Pérez"
}
→ Si usuario no existe, se crea automáticamente
→ Si usuario tiene 3+ strikes, rechaza la reserva
```

### 2. Detectar Uso Sin Reserva

```
Bot detecta uso de sala sin reserva
Bot → POST /api/horarios/:id/uso-sin-reserva {
  usuario_telefono: "+1234567890",
  usuario_nombre: "Juan Pérez"
}
→ Agrega strike automáticamente
```

### 3. Detectar No Asistencia

```
Bot detecta que pasó el horario sin asistencia
Bot → POST /api/horarios/:id/no-asistio
→ Agrega strike automáticamente
→ Marca horario como "no_asistio"
```

### 4. Detectar No Respeto de Horario

```
Bot detecta que usuario no respetó horario
Bot → POST /api/horarios/:id/strike {
  motivo: "Llegó 30 minutos tarde"
}
→ Agrega strike
```

---

## ⚠️ Reglas del Sistema de Strikes

1. **3 strikes = Bloqueo:** Usuario con 3 o más strikes no puede reservar
2. **Strikes automáticos:**
   - Uso sin reserva = 1 strike
   - No asistencia = 1 strike
3. **Strikes manuales:**
   - No respetar horario = 1 strike (con motivo)
4. **Historial:** Cada strike se guarda con fecha y motivo

---

## 💡 Casos de Uso para el Chatbot

### Caso 1: Usuario nuevo quiere reservar
```
1. Pedir nombre y teléfono
2. POST /api/horarios con usuario_telefono y usuario_nombre
3. Si el usuario no existe, se crea automáticamente
4. Confirmar reserva
```

### Caso 2: Usuario existente quiere reservar
```
1. Pedir teléfono
2. Verificar si tiene 3+ strikes (GET /api/usuarios/telefono/:telefono)
3. Si tiene 3+ strikes, rechazar
4. Si no, POST /api/horarios
5. Confirmar reserva
```

### Caso 3: Detectar uso sin reserva
```
1. Bot detecta uso de sala
2. Identificar usuario (pedir teléfono)
3. POST /api/horarios/:id/uso-sin-reserva
4. Informar al usuario sobre el strike
```

### Caso 4: Detectar no asistencia
```
1. Bot verifica horarios pasados sin asistencia
2. POST /api/horarios/:id/no-asistio para cada uno
3. Notificar al usuario sobre el strike
```

### Caso 5: Detectar no respeto de horario
```
1. Bot detecta llegada tarde o exceso de tiempo
2. POST /api/horarios/:id/strike con motivo
3. Informar al usuario
```

---

## 🔐 Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Campos faltantes o inválidos
- `403 Forbidden`: Usuario con 3+ strikes (bloqueado)
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (usuario duplicado, conflicto de horario)
- `500 Internal Server Error`: Error del servidor

