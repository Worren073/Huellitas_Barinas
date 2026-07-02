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
- [ ] Commit inicial y push a GitHub
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

### Neon PostgreSQL
- **URL**: postgresql://neondb_owner:npg_aiXy4NJFqSe5@ep-royal-snow-atfogk2r.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require

### Cloudflare R2
- **Account ID**: b36968d564ce65b626f75ff9a70e6f33
- **Access Key ID**: 10b3889d30123e7c436b834017a1cc16
- **Secret**: dfaf98032aae6a88f0906e21cc4bd0d417af71fc1fda1f6fd2dd546b522b01ac
- **Bucket**: huellitas-barinas
- **Endpoint**: https://b36968d564ce65b626f75ff9a70e6f33.r2.cloudflarestorage.com

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
