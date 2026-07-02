# 🚀 DEPLOYMENT GUIDE - Huellitas Barinas

Guía completa para desplegar Huellitas Barinas a producción en Render.

## 📋 Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
3. [Validación de Producción](#validación-de-producción)
4. [Deploy en Render](#deploy-en-render)
5. [Verificación Post-Deploy](#verificación-post-deploy)
6. [Rollback](#rollback)
7. [Monitoreo](#monitoreo)

---

## 📦 Pre-requisitos

### Cuentas y Servicios Requeridos

- ✅ GitHub Account con acceso al repo
- ✅ Render Account ([render.com](https://render.com))
- ✅ Neon Database ([neon.tech](https://neon.tech))
- ✅ Redis (Render lo proporciona)
- ✅ Cloudflare R2 ([cloudflare.com](https://cloudflare.com)) - Opcional
- ✅ Sentry ([sentry.io](https://sentry.io)) - Opcional pero recomendado
- ✅ Gmail App Password para email

### Herramientas Locales

```bash
# Verificar Git
git --version

# Verificar Python 3.12+
python --version

# Verificar Node 20+
node --version
```

---

## 🔐 Configuración de Variables de Entorno

### Paso 1: Generar SECRET_KEY

```bash
cd backend
python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copiar el valor generado.

### Paso 2: Preparar Variables de Entorno

Crear archivo `.env.production` con todos los valores (NUNCA commitear):

```bash
cp .env.example .env.production
# Editar .env.production con valores reales
```

### Paso 3: Variables Requeridas Checklist

```
DJANGO CORE:
☐ SECRET_KEY = [Generated in Step 1]
☐ DEBUG = false
☐ ALLOWED_HOSTS = yourdomain.com,www.yourdomain.com,api.yourdomain.com

DATABASE:
☐ DATABASE_URL = postgresql://[user]:[REDACTED]@[neon-host]:5432/huellitas_barinas?sslmode=require

REDIS:
☐ REDIS_URL = [From Render Redis service]

STORAGE:
☐ AWS_ACCESS_KEY_ID = [Cloudflare R2]
☐ AWS_SECRET_ACCESS_KEY = [Cloudflare R2]
☐ AWS_STORAGE_BUCKET_NAME = huellitas-barinas
☐ AWS_S3_ENDPOINT_URL = [Cloudflare R2 endpoint]

EMAIL:
☐ EMAIL_HOST_USER = [Gmail address]
☐ EMAIL_HOST_PASSWORD = [Gmail App Password]

CORS:
☐ CORS_ALLOWED_ORIGINS = https://yourdomain.com,https://www.yourdomain.com

FRONTEND:
☐ NEXT_PUBLIC_API_URL = https://api.yourdomain.com

MONITORING:
☐ SENTRY_DSN = [From Sentry dashboard]
```

---

## ✅ Validación de Producción

### Paso 1: Instalar Setup Script

```bash
chmod +x scripts/setup-production.sh
./scripts/setup-production.sh
```

### Paso 2: Ejecutar Validación

```bash
# Validar all settings
python scripts/validate_production_settings.py

# Validar incluyendo búsqueda de secretos
python scripts/validate_production_settings.py --check-secrets
```

**Debe mostrar:**
```
✅ READY FOR PRODUCTION
```

Si hay ❌ **ERRORS**, corregir antes de continuar.

### Paso 3: Revisar Cambios

```bash
# Ver cambios en git
git status

# Ver que NO hay .env
git ls-files | grep -E "\.env$|\.env\.production"  # Debe estar vacío

# Ver que production.py NO tiene secretos
grep -n "password\|secret\|token" backend/config/settings/production.py  # Debe estar vacío
```

---

## 🚀 Deploy en Render

### Paso 1: Conectar GitHub a Render

1. Ir a [Render Dashboard](https://dashboard.render.com)
2. Click en "New" → "Blueprint"
3. Conectar GitHub repo
4. Seleccionar branch: `main`

### Paso 2: Configurar Variables de Entorno en Render

1. En Render Dashboard, ir a cada servicio
2. Settings → Environment
3. Agregar todas las variables de `.env.production`

**NO copiar/pegar el archivo .env** - Usar Render UI

### Paso 3: Crear Servicios en Orden

**Orden importante:**

1. **Database (Neon)**: Crear primero, obtener CONNECTION_STRING
2. **Redis**: Crear, obtener CONNECTION_STRING
3. **API (Django)**: Crear con DATABASE_URL y REDIS_URL
4. **Worker (Celery)**: Apunta al mismo Redis
5. **Beat (Scheduler)**: Apunta al mismo Redis
6. **Frontend (Next.js)**: Apunta al API

### Paso 4: Deploy Inicial

Usando `render.yaml` (recomendado):

```bash
# El render.yaml está en raíz
# Render lo detecta automáticamente

# Trigger deployment desde GitHub:
git push origin main

# O desde Render UI:
# Dashboard → Trigger Deploy
```

**Tiempo estimado:** 10-15 minutos

### Paso 5: Monitorear Deploy

```
Render Dashboard:
┌─────────────────────────────────┐
│ huellitas-api (Building...)     │  ← Watch this
│ huellitas-worker (Pending)      │
│ huellitas-beat (Pending)        │
│ huellitas-web (Pending)         │
└─────────────────────────────────┘
```

Ver logs:
- Click en cada servicio
- Pestaña "Logs"
- Buscar errores

---

## ✨ Verificación Post-Deploy

### Paso 1: Health Check API

```bash
# Reemplazar con tu URL
curl -I https://huellitas-api.onrender.com/api/health/

# Debe retornar 200 OK
```

### Paso 2: Test Endpoints

```bash
# Test login
curl -X POST https://huellitas-api.onrender.com/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Test pets list (public)
curl https://huellitas-api.onrender.com/api/v1/pets/?page_size=1
```

### Paso 3: Test Frontend

1. Abrir https://yourdomain.com
2. Verificar que se carga
3. Intenta login
4. Revisar Network tab en DevTools

### Paso 4: Database Migrations

```bash
# SSH a API service o usar Render Shell
# (Render → huellitas-api → Shell)

python manage.py migrate
python manage.py createsuperuser
```

### Paso 5: Monitoreo Inicial

Primeras 24 horas:

```
☐ Verificar Sentry - No hay errores críticos
☐ Verificar logs API - Sin errores HTTP 500
☐ Verificar database - Conexión activa
☐ Verificar Redis - Conectado
☐ Verificar Celery - Tasks ejecutándose
☐ Verificar Email - Si aplica
☐ Verificar Storage R2 - Si se suben archivos
```

---

## 🔄 Rollback (Si algo falla)

### Opción 1: Rollback a Deploy Anterior

```
Render Dashboard:
1. Ir a huellitas-api
2. Pestaña "Deploys"
3. Click en deploy anterior
4. "Redeploy"
```

Tiempo: 5 minutos

### Opción 2: Revertir en GitHub

```bash
# Si el problema está en código
git revert HEAD
git push origin main

# Render detecta nuevo push y redeploy automático
```

### Opción 3: Emergency (Si BD está corrupta)

```
1. STOP todo en Render (Pause cada servicio)
2. Backup en Neon:
   - Neon Dashboard → Branches → Create from latest
   - Genera una rama backup
3. Drop y recrear database desde Render Shell
4. Run migrations
5. Restore data si es posible
6. Reactivar servicios uno por uno
```

---

## 📊 Monitoreo Continuo

### Logs

```bash
# Ver logs en Render Dashboard
# Cada servicio tiene pestaña "Logs"
# Click para ver output en tiempo real
```

### Métricas Importantes

```
Memory Usage:
  API: < 512MB
  Worker: < 256MB
  Beat: < 128MB

CPU Usage:
  Picos OK, pero promedio < 10%

Network:
  No errors en conexión DB/Redis
```

### Alertas Automáticas (Sentry)

Si tiene Sentry_DSN configurado:

1. Errores se reportan automáticamente
2. Ir a [sentry.io](https://sentry.io) → Project → Issues
3. Recibir notificaciones por email

### Logs Queries

```bash
# Ver errores de login
grep "401" logs

# Ver errores de database
grep "OperationalError\|ProgrammingError" logs

# Ver errores de Celery
grep "celery" logs
```

---

## 🛡️ Security Checklist Post-Deploy

```
☐ DEBUG = false
☐ ALLOWED_HOSTS correcto (no localhost)
☐ CORS_ALLOWED_ORIGINS limitado
☐ SECRET_KEY es único y largo (50+ chars)
☐ Database password es fuerte
☐ SSL/HTTPS activado (Render lo hace auto)
☐ Email credentials rotadas (app password)
☐ Backup automático en Neon (gratuito)
☐ Logs monitoreados (Sentry)
☐ No hay .env en git
```

---

## 📞 Soporte & Troubleshooting

### Errores Comunes

#### Error: "502 Bad Gateway"

```
Causas:
- API no iniciado
- Error en manage.py shell
- Database no accesible

Solución:
1. Render UI → huellitas-api → Logs
2. Buscar error específico
3. Si es DATABASE_URL, verificar en Render Settings
```

#### Error: "Database connection refused"

```
Solución:
1. Verificar DATABASE_URL en Render
2. En Neon, crear IP whitelist para Render
3. Render → huellitas-api → IP: agregar a Neon
```

#### Error: "Email not configured"

```
Solución:
1. EMAIL_HOST_USER y EMAIL_HOST_PASSWORD en Render
2. Para Gmail, usar App Password (no account password)
3. https://myaccount.google.com/apppasswords
```

#### Error: "Static files not found"

```
Solución:
1. python manage.py collectstatic
2. Verificar AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
3. O usar local storage si R2 no configurado
```

---

## 📚 Referencias Útiles

- [Render Docs](https://render.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Django Production](https://docs.djangoproject.com/en/5.0/howto/deployment/)
- [Next.js Production](https://nextjs.org/docs/going-to-production)
- [Sentry Setup](https://docs.sentry.io/platforms/python/integrations/django/)

---

## ✅ Checklist Final

Antes de dar por completado el deploy:

```
PRE-DEPLOY:
☐ Validación pasada (python scripts/validate_production_settings.py)
☐ Commits en main
☐ Secrets NO en git
☐ .env.example actualizado con keys

DURANTE DEPLOY:
☐ Monitoring logs en Render
☐ Esperar ~15min para completarse
☐ Ver cada servicio en verde (running)

POST-DEPLOY:
☐ Health check exitoso
☐ API endpoints respondiendo
☐ Frontend carga
☐ Login funciona
☐ Sentry sin errores críticos
☐ Logs sin excepciones

24 HORAS:
☐ Monitor continuado
☐ Usuarios reportan issues?
☐ Performance aceptable?
☐ Backups automáticos OK?
```

---

**Última actualización:** 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Ready for Production
