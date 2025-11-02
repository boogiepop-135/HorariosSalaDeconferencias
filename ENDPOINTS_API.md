# 🔗 Endpoints API para Chatbot

Documentación completa de endpoints para integrar el chatbot con el sistema de horarios.

## 📍 URL Base

**Producción (Railway):**
```
https://horariossaladeconferencias-production.up.railway.app/api/horarios
```

**Local (Desarrollo):**
```
http://localhost:5000/api/horarios
```

---

## 📋 Endpoints Disponibles

### 1. ✅ AGREGAR Horario (POST)

**Endpoint:** `POST /api/horarios`

**Descripción:** Crea un nuevo horario en la sala de conferencias.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2024-01-15",
  "hora_inicio": "10:00",
  "hora_fin": "11:30",
  "titulo": "Reunión de equipo",
  "descripcion": "Revisión de proyectos semanales",
  "organizador": "Juan Pérez",
  "participantes": "Equipo de desarrollo",
  "estado": "activo"
}
```

**Campos requeridos:**
- `fecha` (string): Formato YYYY-MM-DD
- `hora_inicio` (string): Formato HH:MM (24 horas)
- `hora_fin` (string): Formato HH:MM (24 horas)
- `titulo` (string): Nombre del evento

**Campos opcionales:**
- `descripcion` (string)
- `organizador` (string)
- `participantes` (string)
- `estado` (string): "activo" o "cancelado" (default: "activo")

**Respuesta exitosa (201):**
```json
{
  "id": "65a1b2c3d4e5f6789abc123",
  "message": "Horario creado exitosamente"
}
```

**Error - Conflicto (409):**
```json
{
  "error": "Conflicto de horario detectado",
  "conflictos": [
    {
      "id": "65a1b2c3d4e5f6789abc456",
      "fecha": "2024-01-15",
      "hora_inicio": "10:00",
      "hora_fin": "11:00",
      "titulo": "Otra reunión"
    }
  ]
}
```

**Ejemplo (cURL):**
```bash
curl -X POST https://horariossaladeconferencias-production.up.railway.app/api/horarios \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-01-15",
    "hora_inicio": "14:00",
    "hora_fin": "15:30",
    "titulo": "Presentación de proyecto"
  }'
```

---

### 2. 🔄 MODIFICAR Horario (PUT)

**Endpoint:** `PUT /api/horarios/:id`

**Descripción:** Actualiza información de un horario existente. Solo actualiza los campos enviados.

**Parámetros:**
- `id` (string): ID del horario (ObjectId de MongoDB)

**Body:** (solo incluir los campos que se desean cambiar)
```json
{
  "titulo": "Reunión actualizada",
  "descripcion": "Nueva descripción",
  "hora_inicio": "15:00",
  "hora_fin": "16:00",
  "organizador": "María García",
  "estado": "cancelado"
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "65a1b2c3d4e5f6789abc123",
  "message": "Horario actualizado exitosamente"
}
```

**Ejemplo (cURL):**
```bash
# Cambiar solo el título
curl -X PUT https://horariossaladeconferencias-production.up.railway.app/api/horarios/65a1b2c3d4e5f6789abc123 \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Nuevo título"}'

# Cambiar múltiples campos
curl -X PUT https://horariossaladeconferencias-production.up.railway.app/api/horarios/65a1b2c3d4e5f6789abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "hora_inicio": "16:00",
    "hora_fin": "17:00",
    "organizador": "Pedro Sánchez"
  }'
```

---

### 3. ❌ ELIMINAR Horario (DELETE)

**Endpoint:** `DELETE /api/horarios/:id`

**Descripción:** Elimina un horario por su ID.

**Parámetros:**
- `id` (string): ID del horario (ObjectId de MongoDB)

**Respuesta exitosa (200):**
```json
{
  "message": "Horario eliminado exitosamente"
}
```

**Error - No encontrado (404):**
```json
{
  "error": "Horario no encontrado"
}
```

**Ejemplo (cURL):**
```bash
curl -X DELETE https://horariossaladeconferencias-production.up.railway.app/api/horarios/65a1b2c3d4e5f6789abc123
```

---

### 4. 📋 CONSULTAR Horarios (GET) - Opcional

**Endpoint:** `GET /api/horarios`

**Descripción:** Obtiene todos los horarios (opcional, para el chatbot puede no ser necesario).

**Query Parameters (opcionales):**
- `fecha`: Filtrar por fecha específica (YYYY-MM-DD)
- `estado`: Filtrar por estado ("activo" o "cancelado")

**Ejemplo:**
```bash
# Todos los horarios
curl https://horariossaladeconferencias-production.up.railway.app/api/horarios

# Filtrar por fecha
curl https://horariossaladeconferencias-production.up.railway.app/api/horarios?fecha=2024-01-15

# Filtrar por estado
curl https://horariossaladeconferencias-production.up.railway.app/api/horarios?estado=activo
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": "65a1b2c3d4e5f6789abc123",
    "fecha": "2024-01-15",
    "hora_inicio": "10:00",
    "hora_fin": "11:30",
    "titulo": "Reunión de equipo",
    "descripcion": "Revisión de proyectos",
    "organizador": "Juan Pérez",
    "participantes": "Equipo de desarrollo",
    "estado": "activo",
    "created_at": "2024-01-10T10:00:00.000Z",
    "updated_at": "2024-01-10T10:00:00.000Z"
  }
]
```

---

## ⚠️ Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Horario creado exitosamente
- `400 Bad Request`: Campos faltantes o inválidos
- `404 Not Found`: Horario no encontrado
- `409 Conflict`: Conflicto de horario detectado
- `500 Internal Server Error`: Error del servidor

---

## 🎯 Casos de Uso para el Chatbot

### Agregar un horario simple
```json
POST /api/horarios
{
  "fecha": "2024-01-20",
  "hora_inicio": "10:00",
  "hora_fin": "11:00",
  "titulo": "Reunión con cliente"
}
```

### Agregar un horario completo
```json
POST /api/horarios
{
  "fecha": "2024-01-20",
  "hora_inicio": "14:00",
  "hora_fin": "16:00",
  "titulo": "Revisión de proyecto",
  "descripcion": "Revisión mensual del proyecto X",
  "organizador": "Ana López",
  "participantes": "Equipo técnico y gerencia"
}
```

### Cambiar la hora de un horario
```json
PUT /api/horarios/{id}
{
  "hora_inicio": "15:00",
  "hora_fin": "16:30"
}
```

### Cambiar solo el título
```json
PUT /api/horarios/{id}
{
  "titulo": "Nuevo nombre del evento"
}
```

### Cambiar el organizador
```json
PUT /api/horarios/{id}
{
  "organizador": "Carlos Méndez"
}
```

### Cancelar un horario
```json
PUT /api/horarios/{id}
{
  "estado": "cancelado"
}
```

### Eliminar un horario
```
DELETE /api/horarios/{id}
```

---

## 💡 Tips para el Chatbot

1. **Siempre valida conflictos:** Si recibes un 409, informa al usuario sobre el conflicto y sugiere otro horario.

2. **Usa actualización parcial:** Al modificar, solo envía los campos que cambian.

3. **Maneja errores gracefully:** Si el horario no existe (404), informa claramente al usuario.

4. **Confirma operaciones:** Siempre confirma al usuario cuando se crea, actualiza o elimina un horario.

5. **Formato de fechas y horas:**
   - Fecha: YYYY-MM-DD (ejemplo: "2024-01-15")
   - Hora: HH:MM en formato 24 horas (ejemplo: "14:30")

6. **IDs de MongoDB:** Los IDs son ObjectId de MongoDB (24 caracteres hexadecimales), se devuelven como string.

---

## 🔐 Seguridad

- Los endpoints son públicos por defecto
- Si necesitas autenticación, agrega middleware de autenticación
- Considera rate limiting para proteger contra abuso

