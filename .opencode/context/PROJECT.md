# Huellitas Barinas - Contexto del Proyecto

## Estado Actual
- **Fase**: En Desarrollo (MVP casi completo)
- **Fecha inicio**: Julio 2026
- **Desarrollador**: Liz (Worren Barrios)
- **Email**: worrenalexanderbz@gmail.com
- **Repo**: https://github.com/Worren073/Huellitas_Barinas.git

## Decisiones Tomadas

### Arquitectura
1. ✅ Patrón MVP (Model-View-Presenter) para separación de concerns
2. ✅ Django + DRF para backend (experiencia del equipo)
3. ✅ Next.js 14 + Tailwind para frontend
4. ✅ JWT para autenticación (simplejwt)
5. ✅ Docker para contenedorización
6. ✅ Render para deployment
7. ✅ API-first design (futuro móvil)

### Base de Datos
1. ✅ PostgreSQL (Neon free tier - no expira como Render)
2. ✅ django-simple-history para auditoría
3. ✅ django-storages + Cloudflare R2 para archivos

### Frontend
1. ✅ Tailwind CSS (no Material UI, no Bootstrap)
2. ✅ App Router (no Pages Router)
3. ✅ Zustand para state management
4. ✅ Axios con interceptors para JWT

### Imágenes
1. ✅ Conversión automática a WebP
2. ✅ Calidad 85%, max 1200px width
3. ✅ Max 10MB upload
4. ✅ Cloudflare R2 storage

## Alcance MVP

### Completado ✅
- [x] Users app (modelo, auth JWT, permisos, admin)
- [x] Centers app (modelo, CRUD, activate/deactivate)
- [x] Pets app (modelo, CRUD, WebP utils, signals)
- [x] Adoptions app (modelo, state machine, timeline)
- [x] Backend config (settings base/dev/prod, urls, celery)
- [x] Docker (docker-compose.yml, docker-compose.prod.yml)
- [x] Nginx (reverse proxy config)
- [x] CI/CD (GitHub Actions)
- [x] Render Blueprint (render.yaml)
- [x] Frontend structure (Next.js, pages, lib)
- [x] .env.example, .gitignore, README.md

### Pendiente ⏳
- [ ] Tests unitarios y de integración
- [ ] Deploy a Render (probar)
- [ ] Frontend: páginas CRUD completas
- [ ] Frontend: filtros y paginación
- [ ] Frontend: upload de imágenes
- [ ] Admin dashboard con métricas reales
- [ ] Email notifications (Celery tasks)
- [ ] Validación de formularios frontend

### Excluido (futuro)
- [ ] App móvil nativa
- [ ] Notificaciones push
- [ ] Pagos en línea
- [ ] Chat en tiempo real
- [ ] Multi-tenancy (varios estados)
- [ ] ML matching de adopción

## Estructura de Apps

### users/
- **Model**: User (AbstractUser) con roles
- **Services**: register, login, get_profile, change_password
- **Endpoints**: auth (register/login/refresh), user (me/)
- **Permisos**: IsOwnerOrAdmin

### centers/
- **Model**: Center con status y capacidad
- **Services**: create, update, activate, deactivate
- **Endpoints**: CRUD + activate/deactivate
- **Permisos**: IsCenterAdminOrReadOnly

### pets/
- **Model**: Pet + PetImage
- **Services**: create, update, change_status
- **Endpoints**: CRUD + status actions + stats
- **Utils**: convert_to_webp (Pillow)
- **Signals**: pre_save para WebP automático
- **Permisos**: IsCenterMemberOrReadOnly

### adoptions/
- **Model**: Adoption + AdoptionTimeline
- **Services**: submit, start_review, approve, reject, complete, cancel
- **Endpoints**: CRUD + state actions + timeline
- **Permisos**: IsApplicantOrCenterAdmin
- **Tasks**: send_adoption_status_email (Celery)

## Credenciales

> **⚠️ IMPORTANTE**: Las credenciales reales deben ir en `.env` o en variables de entorno de Render.  
> NO commitear este archivo si contiene credenciales reales.  
> Usar el template `.env.example` como referencia.

### Neon PostgreSQL
- **URL**: `postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:5432/<DB_NAME>?sslmode=require`

### Cloudflare R2
- **Account ID**: `{{R2_ACCOUNT_ID}}`
- **Access Key ID**: `{{R2_ACCESS_KEY_ID}}`
- **Secret**: `{{R2_SECRET_ACCESS_KEY}}`
- **Bucket**: `huellitas-barinas`
- **Endpoint**: `https://{{R2_ACCOUNT_ID}}.r2.cloudflarestorage.com`

### Render
- **Username**: Worren Barrios
- **Blueprint**: render.yaml

### GitHub
- **Repo**: https://github.com/Worren073/Huellitas_Barinas.git

## Próximos Pasos (Prioridad)

1. **Inmediato**: Commit inicial y push
2. **Corto plazo**: Deploy a Render, probar Docker
3. **Medio plazo**: Completar frontend CRUD
4. **Largo plazo**: Tests completos, documentación API

## Notas Importantes

- Neon free tier no expira (vs Render que expira a 30 días)
- Cloudflare R2 tiene 10GB gratis (suficiente para MVP)
- Celery worker y beat corren en servicios separados en Render
- Nginx maneja static files y proxy reverso
- Frontend es estático (Next.js export) en Render

---

## Session Log

### Session 1 - Julio 1, 2026

**Objetivo**: Crear proyecto completo y hacer commit inicial

**Completado**:
- [x] Backend: 4 apps completas (users, centers, pets, adoptions)
- [x] Frontend: Estructura Next.js + páginas básicas
- [x] Docker: docker-compose.yml + prod + Dockerfiles
- [x] CI/CD: GitHub Actions
- [x] Deploy: render.yaml + nginx
- [x] Docs: README, AGENTS.md, SKILL.md, PROJECT.md
- [x] Git: Commit inicial + push a GitHub

**Archivos creados**: 82 archivos, 4095 líneas

---

### Session 2 - Julio 1, 2026

**Objetivo**: Configurar entorno local para desarrollo

**Problemas encontrados y corregidos**:
1. `whitenoise` faltaba en requirements.txt
2. `development.py` no parseaba DATABASE_URL correctamente
3. docker-compose.yml usaba `&&` que no funciona en sh
4. Falta archivo `.env` para desarrollo local
5. Apps sin archivos de migraciones
6. Unicode `✓` en print statements causaba error en Windows

**Archivos modificados**:
- `backend/requirements.txt` → agregado whitenoise==6.7.*
- `backend/config/settings/development.py` → parseo DB_URL + fix unicode
- `.env` → creado con valores locales
- `docker-compose.yml` → fix comando API + DB vars individuales
- `frontend/.env.local` → creado con API URL

**Migraciones generadas**:
- users.0001_initial
- centers.0001_initial, 0002_initial
- pets.0001_initial
- adoptions.0001_initial, 0002_initial

**Servicios verificados**:
- PostgreSQL: localhost:5432 ✅
- Redis: localhost:6379 ✅
- Django API: localhost:8000 ✅
- Health endpoint: `/api/v1/health/` → 200 ✅
- Login endpoint: `/api/v1/auth/login/` → JWT tokens ✅
- Admin: localhost:8000/admin/ → 200 ✅

**Admin creado**:
- Usuario: admin
- Contraseña: admin123
- Email: admin@huellitas.com
- Rol: superadmin

**Próximos pasos**:
1. Iniciar frontend (`cd frontend && npm run dev`)
2. Probar conexión frontend-backend
3. Crear centro de prueba
4. Agregar mascota de prueba
5. Probar flujo de adopción completo

**Notas técnicas**:
- Windows PowerShell tiene execution policy restrictions
- Usar `cmd /c` para comandos npm
- Next.js necesita `.env.local` con `NEXT_PUBLIC_API_URL`
- Django usa `DB_*` vars individuales en development (no DATABASE_URL)
