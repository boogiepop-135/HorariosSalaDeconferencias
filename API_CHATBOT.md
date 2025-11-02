# Documentación API para Chatbot

Esta documentación está específicamente diseñada para la integración del chatbot con el sistema de horarios.

## 🔗 URL Base

**Producción (Railway):**
```
https://horariossaladeconferencias-production.up.railway.app/api/horarios
```

**Local (desarrollo):**
```
http://localhost:5000/api/horarios
```

---

> 📌 **NOTA:** Para una configuración rápida del chatbot, revisa `PROMPT_CHATBOT.md` que contiene un prompt listo para copiar y pegar.

## 📋 Operaciones Disponibles para el Chatbot

El chatbot puede realizar las siguientes operaciones:
- ✅ **Agregar** horarios
- ✅ **Eliminar** horarios  
- ✅ **Modificar** horarios (cambiar información)
- ❌ **No puede consultar** (solo para uso interno)

---

## 1. Agregar Horario

**Endpoint:** `POST /api/horarios`

**Descripción:** Crea un nuevo horario en la sala de conferencias.

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
  "id": 1,
  "message": "Horario creado exitosamente"
}
```

**Error - Conflicto de horario (409):**
```json
{
  "error": "Conflicto de horario detectado",
  "conflictos": [
    {
      "id": 5,
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
curl -X POST http://localhost:5000/api/horarios \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-01-15",
    "hora_inicio": "14:00",
    "hora_fin": "15:30",
    "titulo": "Presentación de proyecto"
  }'
```

---

## 2. Eliminar Horario

**Endpoint:** `DELETE /api/horarios/:id`

**Descripción:** Elimina un horario existente por su ID.

**Parámetros:**
- `id` (path parameter): ID del horario a eliminar

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
curl -X DELETE http://localhost:5000/api/horarios/1
```

---

## 3. Modificar Horario

**Endpoint:** `PUT /api/horarios/:id`

**Descripción:** Actualiza información de un horario existente. Solo se actualizan los campos enviados.

**Parámetros:**
- `id` (path parameter): ID del horario a actualizar

**Body:** (incluir solo los campos que se desean cambiar)
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

**Todos los campos son opcionales** (excepto que se valida conflicto si cambias fecha/hora)

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "message": "Horario actualizado exitosamente"
}
```

**Error - No encontrado (404):**
```json
{
  "error": "Horario no encontrado"
}
```

**Error - Conflicto de horario (409):** (si cambias fecha/hora y hay conflicto)
```json
{
  "error": "Conflicto de horario detectado",
  "conflictos": [...]
}
```

**Ejemplo (cURL):**
```bash
# Cambiar solo el título
curl -X PUT http://localhost:5000/api/horarios/1 \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Nuevo título"}'

# Cambiar múltiples campos
curl -X PUT http://localhost:5000/api/horarios/1 \
  -H "Content-Type: application/json" \
  -d '{
    "hora_inicio": "16:00",
    "hora_fin": "17:00",
    "organizador": "Pedro Sánchez"
  }'

# Cancelar un horario
curl -X PUT http://localhost:5000/api/horarios/1 \
  -H "Content-Type: application/json" \
  -d '{"estado": "cancelado"}'
```

---

## 🎯 Casos de Uso Comunes para el Chatbot

### Caso 1: Agregar un horario simple
```json
POST /api/horarios
{
  "fecha": "2024-01-20",
  "hora_inicio": "10:00",
  "hora_fin": "11:00",
  "titulo": "Reunión con cliente"
}
```

### Caso 2: Agregar un horario completo
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

### Caso 3: Cambiar la hora de un horario
```json
PUT /api/horarios/5
{
  "hora_inicio": "15:00",
  "hora_fin": "16:30"
}
```

### Caso 4: Cambiar solo el título
```json
PUT /api/horarios/5
{
  "titulo": "Nuevo nombre del evento"
}
```

### Caso 5: Cambiar el organizador
```json
PUT /api/horarios/5
{
  "organizador": "Carlos Méndez"
}
```

### Caso 6: Cancelar un horario
```json
PUT /api/horarios/5
{
  "estado": "cancelado"
}
```

### Caso 7: Eliminar un horario
```
DELETE /api/horarios/5
```

---

## ⚠️ Validaciones Importantes

1. **Conflictos de horario:** El sistema detecta automáticamente si hay solapamiento de horarios en la misma fecha. Si hay conflicto, devuelve error 409.

2. **Formato de fecha:** Debe ser YYYY-MM-DD (ejemplo: "2024-01-15")

3. **Formato de hora:** Debe ser HH:MM en formato 24 horas (ejemplo: "14:30")

4. **Campos requeridos al crear:** `fecha`, `hora_inicio`, `hora_fin`, `titulo`

---

## 🔍 Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Horario creado exitosamente
- `400 Bad Request`: Campos faltantes o inválidos
- `404 Not Found`: Horario no encontrado
- `409 Conflict`: Conflicto de horario detectado
- `500 Internal Server Error`: Error del servidor

---

## 💡 Tips para el Chatbot

1. **Siempre valida conflictos:** Si recibes un 409, informa al usuario sobre el conflicto y sugiere otro horario.

2. **Usa actualización parcial:** Al modificar, solo envía los campos que cambian.

3. **Maneja errores gracefully:** Si el horario no existe (404), informa claramente al usuario.

4. **Confirma operaciones:** Siempre confirma al usuario cuando se crea, actualiza o elimina un horario.

