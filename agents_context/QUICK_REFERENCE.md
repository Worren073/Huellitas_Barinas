# 🚀 QUICK REFERENCE - COMANDOS PARA PRODUCCIÓN

## 📋 Instalación y Setup

```bash
# 1. Setup inicial (solo una vez)
chmod +x scripts/setup-production.sh scripts/pre-push scripts/pre-deploy-checklist.sh
./scripts/setup-production.sh

# 2. Editar variables
nano .env  # o tu editor favorito

# 3. Verificar que está listo
python scripts/validate_production_settings.py --check-secrets
bash scripts/pre-deploy-checklist.sh
```

## 🔍 Validación Pre-Deploy

```bash
# Validar settings sin buscar secretos
python scripts/validate_production_settings.py

# Validar settings + buscar secretos hardcodeados
python scripts/validate_production_settings.py --check-secrets

# Checklist interactivo completo
bash scripts/pre-deploy-checklist.sh
```

## 🐳 Desarrollo Local (Docker)

```bash
# Iniciar todo
docker compose up -d

# Ver logs
docker compose logs -f api      # Backend
docker compose logs -f web      # Frontend
docker compose logs -f worker   # Celery worker

# Crear admin
docker compose exec api python manage.py createsuperuser

# Acceder
Frontend:  http://localhost:3000
API:       http://localhost:8000
Admin:     http://localhost:8000/admin/
Docs:      http://localhost:8000/api/docs/

# Parar
docker compose down
```

### Linter y Formato (Backend)
```bash
# Ruff check
docker compose exec api ruff check apps/

# Ruff auto-fix (I, W2, F4)
docker compose exec api ruff check apps/ --fix --select I,W2,F4

# Ruff format
docker compose exec api ruff format apps/
docker compose exec api ruff format apps/ --check
```

### Linter y Build (Frontend)
```bash
# ESLint
docker compose exec web npm run lint

# Build
docker compose exec web npm run build
```

### Tests
```bash
# Todos los tests
docker compose exec api python -m pytest -v

# Por app
docker compose exec api python -m pytest apps/pets -v
docker compose exec api python -m pytest apps/adoptions -v
docker compose exec api python -m pytest apps/centers -v
docker compose exec api python -m pytest apps/users -v
```

## 📦 Deploy a Producción

```bash
# 1. Último check antes de push
python scripts/validate_production_settings.py --check-secrets

# 2. Verificar rama
git branch -v

# 3. Push (ejecuta pre-push hook automático)
git push origin main

# 4. Monitorear en Render Dashboard
# Render → huellitas-api → Logs

# 5. Verificar health
curl -I https://huellitas-api.onrender.com/api/health/

# 6. Test endpoints
curl https://huellitas-api.onrender.com/api/v1/pets/?page_size=1
```

## 🔄 Rollback (Si necesario)

```bash
# Opción 1: Revert código en Git
git revert HEAD
git push origin main
# (Render auto-redeploya)

# Opción 2: Desde Render UI
# Render Dashboard → huellitas-api → Deploys → Click en deploy anterior → Redeploy
```

## 🛠️ Fixes Rápidos

### Si SECRET_KEY está vacío
```bash
python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Copiar valor a variable NEXT_PUBLIC_API_URL en Render
```

### Si DATABASE_URL falla
```bash
# Verificar en Neon
# 1. Neon Dashboard → SQL Editor
# 2. SELECT version();
# 3. Copy CONNECTION_STRING desde dashboard
# 4. Pegar en Render → huellitas-api → Settings → Environment
```

### Si Redis no conecta
```bash
# Desde Render Shell (API service)
redis-cli -u $REDIS_URL ping
# Debe retornar PONG
```

### Si Static files no cargan
```bash
# Backend shell
python manage.py collectstatic --noinput

# Verificar R2 config
# AWS_ACCESS_KEY_ID debe estar set
# AWS_S3_ENDPOINT_URL debe ser HTTPS
```

## 📊 Monitoreo

```bash
# Ver logs en Render
# Render UI → Service → Logs tab

# Ver métricas
# Render UI → Service → Metrics tab

# Sentry (si está configurado)
# https://sentry.io → Project → Issues

# Health check manual
curl https://yourdomain.com/api/health/
# Debe retornar 200 OK
```

## 🔐 Security Quick Check

```bash
# Verificar que no hay secretos en git
git log --oneline -S 'password' -S 'secret' -S 'token'
# Debe estar vacío

# Verificar que .env NO está committed
git ls-files | grep \.env
# Debe estar vacío o solo .env.example

# Verificar production.py no tiene hardcoded values
grep -n "password\|secret\|token" backend/config/settings/production.py
# Debe estar vacío
```

## 📝 Notas Importantes

1. **Pre-push hook** se ejecuta automáticamente antes de `git push origin main`
   - Valida settings
   - Busca secretos
   - Corre tests (pausable con -y)

2. **Variables obligatorias** (si falta una, falla el deploy):
   - SECRET_KEY
   - ALLOWED_HOSTS
   - DATABASE_URL (o DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)
   - REDIS_URL
   - CORS_ALLOWED_ORIGINS
   - NEXT_PUBLIC_API_URL

3. **Variables opcionales** (sin estas, solo falla la feature):
   - EMAIL_HOST_USER, EMAIL_HOST_PASSWORD (email disabled)
   - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (local storage)
   - SENTRY_DSN (sin error tracking)

## 🆘 Emergencia

```bash
# Si algo explota en producción:

# 1. Ver logs
curl https://api.yourdomain.com/api/health/

# 2. Check Sentry
# https://sentry.io → Project → Issues

# 3. Rollback rápido
git revert HEAD
git push origin main

# 4. Monitor
# Render Dashboard → Logs

# Si la BD está corrupta:
# Neon → Branches → Create from latest backup
# Restore data
# Retry
```

## 📚 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `.env.example` | Plantilla de variables (commit esto) |
| `.env` | Variables reales (NUNCA commit) |
| `backend/config/settings/production.py` | Settings producción (validado) |
| `frontend/Dockerfile.prod` | Build optimizado frontend |
| `render.yaml` | Blueprint Render (commit esto) |
| `DEPLOYMENT.md` | Guía completa (40+ páginas) |
| `FIXES_SUMMARY.md` | Resumen de fixes críticos |
| `scripts/validate_production_settings.py` | Validador automático |
| `scripts/pre-push` | Git hook pre-push |
| `scripts/setup-production.sh` | Setup script |
| `scripts/pre-deploy-checklist.sh` | Checklist interactivo |

## 🎯 Flujo Typical Deploy

```
1. git checkout -b feature/xyz
2. ... hacer cambios ...
3. git add . && git commit -m "feat: xyz"
4. git push origin feature/xyz
5. Pull Request en GitHub
6. Review & Merge a develop
7. git checkout main
8. git merge develop
9. python scripts/validate_production_settings.py --check-secrets
10. git push origin main  ← Pre-push hook corre aquí
11. Render auto-deploya
12. Monitor: Render Dashboard → Logs
13. Verificar: curl health check
```

## ✅ Checklist Final Antes de Push a Main

```
☐ Código testeado localmente
☐ docker-compose up funciona
☐ No hay .env staged (git status)
☐ Production settings pasan validación
☐ No hay secretos en production.py
☐ ALLOWED_HOSTS no tiene localhost
☐ CORS no tiene http://localhost
☐ BASE URL es https en producción
☐ Email configurado o deshabilitado
☐ Database accesible (curl health)
☐ Redis conecta (redis-cli ping)
☐ Frontend variables correctas
☐ README.md actualizado
☐ CHANGELOG.md actualizado (opcional)
☐ Último commit message claro
☐ Render settings configurados

LISTO → git push origin main
```

---

**Versión**: 1.0.0 | **Última actualización**: Febrero 2026
