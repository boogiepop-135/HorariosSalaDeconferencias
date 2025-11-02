# Sistema de Administración de Horarios - Sala de Conferencias

Aplicación web completa para administrar el horario de la sala de conferencias, con interfaz visual para usuarios y API REST para integración con chatbot.

## 🚀 Características

- ✅ Interfaz web moderna y responsive para administración visual
- ✅ API REST completa para integración con chatbot
- ✅ Validación de conflictos de horarios automática
- ✅ Base de datos SQLite para almacenamiento persistente
- ✅ Sistema de estados (activo/cancelado)
- ✅ Filtrado por fecha
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)

## 📋 Requisitos Previos

- Node.js (versión 14 o superior)
- npm o yarn

## 🛠️ Instalación

### Opción 1: Instalación completa automática

```bash
npm run install-all
```

### Opción 2: Instalación paso a paso

1. **Instalar dependencias del servidor:**
```bash
npm install
```

2. **Instalar dependencias del cliente:**
```bash
cd client
npm install
cd ..
```

## 🎯 Uso

### Desarrollo

**Terminal 1 - Servidor Backend:**
```bash
npm run dev
```

**Terminal 2 - Cliente Frontend:**
```bash
npm run client
```

- Backend correrá en: `http://localhost:5000`
- Frontend correrá en: `http://localhost:3000`

### Producción

```bash
# Construir el frontend
npm run build

# Iniciar el servidor (sirve el frontend también)
npm start
```

## 📡 API REST para Chatbot

La API está disponible en `http://localhost:5000/api/horarios`

### Endpoints

#### 1. Obtener todos los horarios
```http
GET /api/horarios
```

**Query Parameters:**
- `fecha` (opcional): Filtrar por fecha específica (formato: YYYY-MM-DD)
- `estado` (opcional): Filtrar por estado (activo/cancelado)

**Ejemplo:**
```bash
curl http://localhost:5000/api/horarios
curl http://localhost:5000/api/horarios?fecha=2024-01-15
curl http://localhost:5000/api/horarios?estado=activo
```

#### 2. Obtener un horario por ID
```http
GET /api/horarios/:id
```

**Ejemplo:**
```bash
curl http://localhost:5000/api/horarios/1
```

#### 3. Crear un nuevo horario
```http
POST /api/horarios
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2024-01-15",
  "hora_inicio": "10:00",
  "hora_fin": "11:30",
  "titulo": "Reunión de equipo",
  "descripcion": "Revisión de proyectos",
  "organizador": "Juan Pérez",
  "participantes": "Equipo de desarrollo",
  "estado": "activo"
}
```

**Campos requeridos:** `fecha`, `hora_inicio`, `hora_fin`, `titulo`

**Ejemplo:**
```bash
curl -X POST http://localhost:5000/api/horarios \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-01-15",
    "hora_inicio": "10:00",
    "hora_fin": "11:30",
    "titulo": "Reunión de equipo"
  }'
```

#### 4. Actualizar un horario
```http
PUT /api/horarios/:id
Content-Type: application/json
```

**Body:** (solo incluir los campos que se desean actualizar)
```json
{
  "titulo": "Reunión actualizada",
  "descripcion": "Nueva descripción",
  "estado": "cancelado"
}
```

**Ejemplo:**
```bash
curl -X PUT http://localhost:5000/api/horarios/1 \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Reunión actualizada",
    "estado": "cancelado"
  }'
```

#### 5. Eliminar un horario
```http
DELETE /api/horarios/:id
```

**Ejemplo:**
```bash
curl -X DELETE http://localhost:5000/api/horarios/1
```

### Respuestas de Error

**400 Bad Request:** Campos faltantes o inválidos
```json
{
  "error": "Faltan campos requeridos: fecha, hora_inicio, hora_fin, titulo"
}
```

**404 Not Found:** Horario no encontrado
```json
{
  "error": "Horario no encontrado"
}
```

**409 Conflict:** Conflicto de horario detectado
```json
{
  "error": "Conflicto de horario detectado",
  "conflictos": [...]
}
```

**500 Internal Server Error:** Error del servidor
```json
{
  "error": "Mensaje de error"
}
```

## 🔗 Integración con Chatbot

El chatbot puede usar esta API para:

1. **Agregar horarios:** Usar `POST /api/horarios`
2. **Eliminar horarios:** Usar `DELETE /api/horarios/:id`
3. **Modificar horarios:** Usar `PUT /api/horarios/:id`
4. **Consultar horarios:** Usar `GET /api/horarios`

### Ejemplo de integración (Python)

```python
import requests

API_URL = "http://localhost:5000/api/horarios"

# Agregar horario
def agregar_horario(fecha, hora_inicio, hora_fin, titulo, **kwargs):
    data = {
        "fecha": fecha,
        "hora_inicio": hora_inicio,
        "hora_fin": hora_fin,
        "titulo": titulo,
        **kwargs
    }
    response = requests.post(API_URL, json=data)
    return response.json()

# Eliminar horario
def eliminar_horario(id):
    response = requests.delete(f"{API_URL}/{id}")
    return response.json()

# Actualizar horario
def actualizar_horario(id, **kwargs):
    response = requests.put(f"{API_URL}/{id}", json=kwargs)
    return response.json()

# Consultar horarios
def consultar_horarios(fecha=None, estado=None):
    params = {}
    if fecha:
        params["fecha"] = fecha
    if estado:
        params["estado"] = estado
    response = requests.get(API_URL, params=params)
    return response.json()
```

## 📁 Estructura del Proyecto

```
HorariosSalaDeconferencias/
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── services/      # Servicios API
│   │   └── App.js
│   └── package.json
├── database/              # Base de datos
│   └── db.js             # Configuración SQLite
├── routes/                # Rutas API
│   └── horarios.js       # Endpoints de horarios
├── server.js              # Servidor Express
├── package.json
└── README.md
```

## 🗄️ Base de Datos

La aplicación usa SQLite y crea automáticamente la base de datos en `database/horarios.db`.

### Esquema de la tabla `horarios`

- `id` (INTEGER, PRIMARY KEY)
- `fecha` (TEXT, NOT NULL) - Formato: YYYY-MM-DD
- `hora_inicio` (TEXT, NOT NULL) - Formato: HH:MM
- `hora_fin` (TEXT, NOT NULL) - Formato: HH:MM
- `titulo` (TEXT, NOT NULL)
- `descripcion` (TEXT)
- `organizador` (TEXT)
- `participantes` (TEXT)
- `estado` (TEXT) - Valores: "activo", "cancelado"
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

## 🛡️ Validaciones

- ✅ Validación de campos requeridos
- ✅ Detección de conflictos de horarios (no permite solapamientos)
- ✅ Validación de formato de fecha y hora
- ✅ Prevención de duplicados

## 📝 Licencia

MIT

## 👥 Autor

Proyecto desarrollado para gestión de horarios de sala de conferencias con integración de chatbot.
