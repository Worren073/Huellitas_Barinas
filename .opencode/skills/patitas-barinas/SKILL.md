---
name: patitas-barinas
description: Use when working on the Huellitas Barinas adoption center management system. Covers Django+DRF backend, Next.js+Tailwind frontend, MVP pattern, Docker deployment, JWT auth, adoption flow, and all project-specific architecture decisions.
---

# Huellitas Barinas - Sistema de Gestión de Centros de Adopción

## Resumen del Proyecto

Aplicación web para el control de centros de adopción en el estado Barinas, Venezuela.

## Stack Tecnológico

### Backend
- **Framework**: Django 5.x + Django REST Framework (DRF)
- **Auth**: JWT (djangorestframework-simplejwt) - 15min access, 7 días refresh
- **ORM**: Django ORM + PostgreSQL (Neon)
- **Archivos**: Django FileSystemStorage + Render disk
- **Imágenes**: Pillow + WebP automático (calidad 85%, max 1200px)
- **Tareas**: Celery + Redis
- **Auditoría**: django-simple-history
- **Docs API**: drf-spectacular (OpenAPI 3)

### Frontend
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS
- **Auth**: JWT management (localStorage + axios interceptors)
- **State**: Zustand

### Infraestructura
- **DB**: PostgreSQL (Neon free tier - no expira)
- **Cache/Queue**: Redis 7 (Render)
- **Storage**: Local filesystem (Render disk)
- **Container**: Docker + Docker Compose
- **Deploy**: Render (Web Service + Worker + Beat)
- **CI/CD**: GitHub Actions
- **Reverse Proxy**: Nginx

## Patrón Arquitectónico: Model-View-Presenter (MVP)

### Model Layer (Django Models)
- Solo estructura de datos
- Sin lógica de negocio
- Relaciones y validaciones de integridad

### Presenter Layer (services.py)
- Toda la lógica de negocio
- Transiciones de estado
- Validaciones de dominio
- Integración con servicios externos

### View Layer (DRF ViewSets + Next.js)
- DRF: Solo delega al Presenter
- Next.js: UI y consumo de API

## Estructura del Proyecto

```
Huellitas_Barinas/
├── backend/
│   ├── apps/
│   │   ├── users/          # Modelo User, JWT auth, permisos
│   │   ├── centers/        # Centro con capacidad y geolocalización
│   │   ├── pets/           # Mascota + imágenes WebP
│   │   ├── adoptions/      # Flujo de adopción con estados
│   │   └── inquiries/      # Solicitudes de ayuda/voluntariado/centros
│   ├── config/
│   │   ├── settings/       # base.py, development.py, production.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── celery.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/     # login, register
│   │   │   ├── (dashboard)/ # dashboard, catalog
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── lib/            # api.ts, auth.ts, utils.ts, store.ts
│   ├── package.json
│   └── Dockerfile
├── nginx/nginx.conf
├── docker-compose.yml
├── docker-compose.prod.yml
├── render.yaml
└── .github/workflows/ci.yml
```

## Models Principales

### User (apps/users/models.py)
- Role: superadmin, center_admin, voluntario, adoptante
- Relación con Center (center_admin)
- Campos: phone, address, avatar, is_verified
- AbstractUser de Django

### Center (apps/centers/models.py)
- Status: active, inactive, pending
- Capacidad: capacity_total, capacity_available, capacity_in_process, capacity_adopted
- Geolocalización: latitude, longitude
- Campos: name, address, phone, email, description, image

### Pet (apps/pets/models.py)
- Species: dog, cat, rabbit, other
- Status: available, in_process, adopted, removed
- Size: small, medium, large
- Gender: male, female
- Relación con Center
- PetImage con conversión WebP automática

### Adoption (apps/adoptions/models.py)
- Status: pending → under_review → approved/rejected → completed (+ cancelled)
- Formulario: motivation, experience, home_type, has_yard, has_other_pets, family_members
- Timeline: AdoptionTimeline para historial de cambios
- Unique together: pet + applicant

## Flujo de Adopción (Estados)

```
pending ──────────→ under_review ──────────→ approved ──────────→ completed
    │                    │                      │
    │                    │                      │
    └──────────────────→ rejected              └──────────────────→ cancelled
                         (fin)                        (fin)
                         
pending ──────────→ cancelled (en cualquier momento antes de completed)
```

**Transiciones válidas:**
- `pending`: → under_review, cancelled
- `under_review`: → approved, rejected
- `approved`: → completed, cancelled
- `rejected`: (fin)
- `completed`: (fin)
- `cancelled`: (fin)

## API Endpoints

### Autenticación (apps/users/urls/auth.py)
- `POST /api/v1/auth/register/` - Registro
- `POST /api/v1/auth/login/` - Login (obtiene tokens)
- `POST /api/v1/auth/refresh/` - Refrescar token

### Usuarios (apps/users/urls/user.py)
- `GET /api/v1/users/me/` - Perfil actual
- `PUT /api/v1/users/me/` - Actualizar perfil
- `POST /api/v1/users/me/change-password/` - Cambiar contraseña

### Centros (apps/centers/urls.py)
- `GET /api/v1/centers/` - Listar centros
- `POST /api/v1/centers/` - Crear centro (admin)
- `GET /api/v1/centers/{id}/` - Detalle del centro
- `PUT /api/v1/centers/{id}/` - Actualizar centro
- `POST /api/v1/centers/{id}/activate/` - Activar centro
- `POST /api/v1/centers/{id}/deactivate/` - Desactivar centro

### Mascotas (apps/pets/urls.py)
- `GET /api/v1/pets/` - Listar mascotas (filtros: species, size, gender, status)
- `POST /api/v1/pets/` - Crear mascota
- `GET /api/v1/pets/{id}/` - Detalle de mascota
- `PUT /api/v1/pets/{id}/` - Actualizar mascota
- `POST /api/v1/pets/{id}/available/` - Marcar disponible
- `POST /api/v1/pets/{id}/in_process/` - Marcar en proceso
- `POST /api/v1/pets/{id}/adopted/` - Marcar adoptada
- `GET /api/v1/pets/stats/` - Estadísticas

### Adopciones (apps/adoptions/urls.py)
- `GET /api/v1/adoptions/` - Listar solicitudes
- `POST /api/v1/adoptions/` - Crear solicitud
- `GET /api/v1/adoptions/{id}/` - Detalle de solicitud
- `POST /api/v1/adoptions/{id}/submit/` - Enviar solicitud
- `POST /api/v1/adoptions/{id}/start_review/` - Iniciar revisión (admin)
- `POST /api/v1/adoptions/{id}/approve/` - Aprobar (admin)
- `POST /api/v1/adoptions/{id}/reject/` - Rechazar (admin)
- `POST /api/v1/adoptions/{id}/complete/` - Completar (admin)
- `GET /api/v1/adoptions/{id}/timeline/` - Ver timeline

### Health Check
- `GET /api/health/` - Estado del sistema

## Convenciones

### Backend
- Un serializer por modelo por contexto (Create, List, Detail)
- Lógica de negocio en services.py, NUNCA en views.py
- Tests por app (test_models.py, test_services.py, test_views.py)
- Spanish verbose_name en todos los models
- Permisos personalizados en permissions.py

### Frontend
- App Router con route groups: (auth), (public), (dashboard)
- Componentes en components/ui/, components/layout/, components/adoptions/
- API calls en lib/api.ts con axios
- Estado global: Zustand (authStore, uiStore)
- Auth: `auth.ts` es wrapper que delega a `authStore`
- Constants en lib/utils.ts (PET_SPECIES, PET_STATUS, etc.)
- Imágenes: usar `next/image` con `fill` + contenedor `relative`

### Docker
- Multi-stage builds para optimizar tamaño
- docker-compose.yml para dev (con volumes)
- docker-compose.prod.yml para prod (con nginx)

## Deployment en Render

### Servicios (render.yaml)
1. **huellitas-api** - Django API (web service)
2. **huellitas-worker** - Celery worker
3. **huellitas-beat** - Celery beat scheduler
4. **huellitas-redis** - Redis (managed)
5. **huellitas-web** - Next.js (static)

### Variables de Entorno Requeridas
- `DATABASE_URL` - Neon PostgreSQL connection string
- `CELERY_BROKER_URL` - Redis connection
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` - Cloudflare R2
- `SECRET_KEY` - Django secret key
- `EMAIL_HOST` / `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` - SMTP

## Comandos Útiles

```bash
# Backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
celery -A config worker -l info
celery -A config beat -l info

# Frontend
npm run dev
npm run build
npm run lint

# Docker
docker compose up -d
docker compose down
docker compose logs -f api
docker compose exec api python manage.py shell

# Tests
python manage.py test
pytest

# Ruff (linter)
ruff check apps/
ruff check apps/ --fix
ruff format apps/
ruff format apps/ --check
```

### Backend Apps
- `users/`: Modelo User custom con roles (superadmin, center_admin, voluntario, adoptante), `EmailAuthBackend` (`authentication.py`), JWT auth, permisos por rol
- `centers/`: Centro con capacidad, geolocalización, estados (active/inactive/pending)
- `pets/`: Mascota con especies, estados, imágenes WebP automáticas vía signal
- `adoptions/`: Flujo de adopción con máquina de estados, timeline, notificaciones email (`notifications.py`)
- `inquiries/`: Solicitudes de ayuda/voluntariado/registro de centros

### Frontend Pages
- `(auth)`: login, register
- `(public)`: home, centros, adoptar/[id], pets/[id], mascotas, contacto, términos, privacidad, redes
- `(dashboard)`: dashboard, pets, pets/new, adoptions, centers, users, mis-solicitudes

## Estado Actual (Jul 2026)

- **Backend**: 92 tests ✅, Ruff 0 errors ✅, `ruff format` consistente ✅
- **Frontend**: Build 0 errors ✅, ESLint 0 warnings ✅, Next.js 14.2 App Router
- **Issues resueltos**: email oracle, change_role endpoint, dual auth, notificaciones, capacity validation, inquiries validation, img→Image, UserDropdown style, ruff lint

## Credenciales (no commitear)

- **Neon DB**: Ver .env

- **Render**: Usuario Worren Barrios
- **GitHub**: repo Worren073/Huellitas_Barinas
- **Email**: worrenalexanderbz@gmail.com
