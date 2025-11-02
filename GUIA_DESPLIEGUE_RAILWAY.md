# 🚂 Guía de Despliegue en Railway

Guía específica para desplegar el Sistema de Administración de Horarios de Sala de Conferencias en Railway.

## 📋 Checklist Pre-Despliegue

Antes de desplegar, asegúrate de tener:

- [x] **railway.json** configurado (✅ ya está incluido)
- [ ] **Variables de entorno** listas (usa `env.example` como referencia)
- [x] **Node.js 18+** especificado en `package.json` (✅ ya configurado)
- [x] **Scripts de build y start** en `package.json` (✅ ya configurados)

## 🚀 Opción 1: Despliegue desde GitHub (Recomendado)

### Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté subido a GitHub
2. Verifica que `railway.json` esté en la raíz del proyecto
3. Verifica que `.env` y archivos de base de datos estén en `.gitignore` (✅ ya está)

### Paso 2: Conectar a Railway

1. Ve a [Railway Dashboard](https://railway.app)
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu GitHub
5. Selecciona tu repositorio `HorariosSalaDeconferencias`
6. Railway detectará automáticamente el proyecto y usará `railway.json`

### Paso 3: Configurar Variables de Entorno

1. Ve a tu servicio en Railway
2. Haz clic en la pestaña **"Variables"**
3. Agrega las siguientes variables de entorno:

**Variables Obligatorias:**

```env
PORT=5000
NODE_ENV=production
MONGODB_URL=mongodb://mongo:ThXDRjdrzlSrlcBPpaDGymWTXqKBgzIv@yamabiko.proxy.rlwy.net:37681
```

**Nota:** 
- Railway configura automáticamente el `PORT`, pero puedes especificarlo explícitamente
- `MONGODB_URL` debe ser la URL completa de tu base de datos MongoDB

### Paso 4: Configurar Dominio Público (Opcional pero Recomendado)

1. Ve a tu servicio → **"Settings"** → **"Network"**
2. Haz clic en **"Generate Domain"**
3. Railway generará un dominio público como `tu-proyecto.up.railway.app`
4. Este dominio será el endpoint para tu API

**Ejemplo de uso:**
- API Base: `https://tu-proyecto.up.railway.app`
- Endpoint de horarios: `https://tu-proyecto.up.railway.app/api/horarios`

### Paso 5: Primer Despliegue

1. Railway desplegará automáticamente cuando detecte cambios
2. O haz clic en **"Deploy"** → **"Redeploy"**
3. Ve a **"Deployments"** para ver el progreso
4. Revisa los **"Logs"** para ver el estado

**Verificación del despliegue:**
- Si todo está bien, verás: `Servidor corriendo en puerto 5000`
- La base de datos SQLite se creará automáticamente
- Puedes probar el endpoint: `https://tu-proyecto.up.railway.app/api/horarios`

### Paso 6: Verificar que Funciona

1. **Probar API directamente:**
```bash
curl https://tu-proyecto.up.railway.app/api/horarios
```

2. **Probar desde el chatbot:**
   - Usa el dominio de Railway como URL base de tu API
   - Ejemplo: `https://tu-proyecto.up.railway.app/api/horarios`

3. **Acceder al frontend:**
   - El frontend compilado estará disponible en el dominio de Railway
   - Ejemplo: `https://tu-proyecto.up.railway.app`

## 🚀 Opción 2: Despliegue con Railway CLI

### Instalación

```bash
npm i -g @railway/cli
```

### Configuración

```bash
# Iniciar sesión
railway login

# Inicializar proyecto en la carpeta actual
railway init

# Enlazar a proyecto existente o crear uno nuevo
railway link
```

### Configurar Variables

```bash
# Variables obligatorias
railway variables set PORT=5000
railway variables set NODE_ENV=production
```

### Desplegar

```bash
# Desplegar el proyecto
railway up

# Ver logs
railway logs

# Ver estado
railway status
```

## 🔧 Configuración Avanzada

### Healthcheck

Railway está configurado para verificar `/api/horarios` como healthcheck. El `railway.json` ya está configurado con:

```json
{
  "deploy": {
    "healthcheckPath": "/api/horarios",
    "healthcheckTimeout": 100
  }
}
```

### Base de Datos MongoDB

- La aplicación usa **MongoDB** para almacenamiento persistente
- Configura `MONGODB_URL` en las variables de entorno
- La conexión a MongoDB se realiza automáticamente al iniciar el servidor
- Los datos se almacenan de forma persistente en MongoDB

### Build Command

El `railway.json` está configurado con:
- **Build**: `npm run build` (compila el frontend React)
- **Start**: `npm start` (ejecuta el servidor Express)

### Node.js Version

El `package.json` especifica Node.js 18+:

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

## 🐛 Solución de Problemas

### El build falla

1. **Error: `react-scripts: not found`**
   - ✅ Ya está corregido: el script `build` instala dependencias antes de compilar
   - Verifica que `package.json` tenga: `"build": "cd client && npm install && npm run build"`

2. **Otros errores de build:**
   - Verifica que `npm run build` funcione localmente
   - Revisa los logs en Railway para ver el error específico
   - Asegúrate de que todas las dependencias estén en `package.json`

### El servicio no inicia

1. **Error de puerto:**
   - Railway configura automáticamente `PORT`
   - El código usa `process.env.PORT || 5000`, así que debería funcionar
   - Revisa los logs en Railway

2. **Error de base de datos:**
   - La base de datos SQLite se crea automáticamente
   - Verifica los permisos de escritura en Railway
   - Revisa los logs para ver el error específico

3. **Error de rutas:**
   - Verifica que el frontend esté compilado en `client/build`
   - El servidor sirve archivos estáticos en producción

### El frontend no se muestra

1. **Asegúrate de que el build se haya completado:**
   - Verifica que `client/build` exista después del build
   - Revisa los logs de build

2. **Verifica las rutas:**
   - El servidor sirve el frontend desde `client/build` en producción
   - Asegúrate de que `NODE_ENV=production` esté configurado

### La API no responde

1. **Prueba el healthcheck:**
```bash
curl https://tu-proyecto.up.railway.app/api/horarios
```

2. **Verifica los logs:**
   - Revisa los logs en Railway para ver errores
   - Verifica que el servidor esté corriendo

3. **Verifica CORS:**
   - El servidor tiene CORS habilitado
   - Si tienes problemas, verifica la configuración

## 📊 Monitoreo y Logs

### Ver Logs en Railway

1. Ve a tu proyecto en Railway
2. Haz clic en tu servicio
3. Ve a la pestaña **"Deployments"**
4. Selecciona el deployment más reciente
5. Haz clic en **"View Logs"**

### Logs en Tiempo Real

Usa Railway CLI:

```bash
railway logs --follow
```

### Métricas

Railway muestra automáticamente:
- Uso de CPU
- Uso de Memoria
- Tráfico de Red
- Logs en tiempo real

## 🔗 Integración con Chatbot

Una vez desplegado en Railway:

### URL Base de la API

```
https://tu-proyecto.up.railway.app/api/horarios
```

### Ejemplos de Uso

**Agregar horario desde el chatbot:**
```python
import requests

API_URL = "https://tu-proyecto.up.railway.app/api/horarios"

def agregar_horario(fecha, hora_inicio, hora_fin, titulo):
    data = {
        "fecha": fecha,
        "hora_inicio": hora_inicio,
        "hora_fin": hora_fin,
        "titulo": titulo
    }
    response = requests.post(API_URL, json=data)
    return response.json()
```

**Eliminar horario:**
```python
def eliminar_horario(id):
    response = requests.delete(f"{API_URL}/{id}")
    return response.json()
```

**Actualizar horario:**
```python
def actualizar_horario(id, **kwargs):
    response = requests.put(f"{API_URL}/{id}", json=kwargs)
    return response.json()
```

## 🔒 Seguridad

### Variables Sensibles

- ✅ Nunca commitees `.env` (está en `.gitignore`)
- ✅ Railway encripta variables de entorno automáticamente
- ✅ Usa diferentes configuraciones para desarrollo y producción

### API Endpoints

- Los endpoints son públicos por defecto
- Si necesitas autenticación, agrega middleware de autenticación
- Considera rate limiting para proteger contra abuso

## 🎯 Mejores Prácticas

1. **Usa Variables de Entorno**: Nunca hardcodees valores sensibles
2. **Monitorea los Logs**: Revisa regularmente para detectar problemas
3. **Configura Dominio Personalizado**: Usa un dominio propio si es necesario
4. **Habilita Auto-Deploy**: Railway despliega automáticamente desde GitHub
5. **Backup de Datos**: Considera migrar a PostgreSQL para persistencia
6. **Healthchecks**: Ya está configurado en `railway.json`

## 📝 Archivos de Configuración

Tu proyecto incluye:

- ✅ **railway.json**: Configuración de Railway
- ✅ **package.json**: Scripts y dependencias con engines
- ✅ **env.example**: Plantilla de variables
- ✅ **.gitignore**: Excluye archivos sensibles

## 🆘 ¿Necesitas Ayuda?

- [Documentación de Railway](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [GitHub Issues](https://github.com/boogiepop-135/HorariosSalaDeconferencias/issues)

---

**¡Tu proyecto está listo para desplegarse en Railway!** 🚂✨

