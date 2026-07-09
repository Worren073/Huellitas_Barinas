# AGENTS.md - Instrucciones para Agentes

## Contexto del Proyecto

**Huellitas Barinas** - Sistema web para gestión de centros de adopción en Barinas, Venezuela.

## Stack

- **Backend**: Django 5.x + DRF + PostgreSQL (Render) + Redis + Celery
- **Frontend**: Next.js 14 + Tailwind CSS + TypeScript
- **Deploy**: Docker + Render
- **filesystem**: Local filesystem (Render disk)

## Reglas Principales

### 1. Patrón MVP (Model-View-Presenter)

```
models.py  → Solo estructura y relaciones
services.py → Toda la lógica de negocio (Presenter)
views.py   → Solo delega al service, NUNCA lógica
serializers.py → Validación y transformación de datos
```

**NUNCA poner lógica de negocio en views.py o serializers.py.**

### 2. Convenciones de Código

#### Backend (Django)
- Spanish `verbose_name` en todos los models
- Un serializer por contexto: `CreateSerializer`, `ListSerializer`, `DetailSerializer`
- Permisos en `permissions.py` por app
- Services como clases: `class PetService: def __init__(self, pet): ...`
- Celery tasks en `tasks.py` por app

#### Frontend (Next.js)
- App Router con route groups: `(auth)`, `(dashboard)`, `(public)`
- API client en `lib/api.ts` con axios
- Constants en `lib/utils.ts`
- Components en `components/ui/`, `components/layout/`
- Estado global con Zustand

### 3. Estructura de Apps

```
apps/{app_name}/
├── __init__.py
├── apps.py
├── models.py          # Estructura de datos
├── admin.py           # Django admin personalizado
├── services.py        # Lógica de negocio (Presenter)
├── serializers.py     # DRF serializers
├── views.py           # DRF ViewSets
├── permissions.py     # Permisos custom
├── urls.py            # URL patterns
├── tasks.py           # Celery tasks (si aplica)
├── utils.py           # Utilidades (si aplica)
├── signals.py         # Django signals (si aplica)
└── tests/
    ├── __init__.py
    ├── test_models.py
    ├── test_services.py
    └── test_views.py
```

### 4. Naming Conventions

| Tipo | Convention | Ejemplo |
|------|-----------|---------|
| Models | PascalCase | `Pet`, `Adoption`, `PetImage` |
| Services | PascalCase + Service | `PetService`, `AdoptionService` |
| Serializers | PascalCase + Context | `PetCreateSerializer`, `PetListSerializer` |
| ViewSets | PascalCase + ViewSet | `PetViewSet`, `AdoptionViewSet` |
| Files | snake_case | `pet_service.py`, `adoption_tasks.py` |
| Variables | snake_case | `pet_status`, `adoption_count` |
| Constants | UPPER_SNAKE | `PET_STATUS`, `ADOPTION_TRANSITIONS` |

### 5. Transiciones de Estado

**Adopciones:**
```python
VALID_TRANSITIONS = {
    'pending': ['under_review', 'cancelled'],
    'under_review': ['approved', 'rejected'],
    'approved': ['completed', 'cancelled'],
    'rejected': [],
    'completed': [],
    'cancelled': [],
}
```

**Mascotas:**
```python
# available → in_process → adopted
# available → removed
# in_process → available (si adopción cancelada)
```

### 6. Permisos (Patrón estandarizado)

Todas las apps usan el mismo patrón en `views.py`:

```python
def get_permissions(self):
    """Define qué acciones son públicas y cuáles requieren roles específicos."""
    public_actions = {"list", "retrieve"}
    if self.action in public_actions:
        return [permissions.AllowAny()]
    return [IsSuperAdmin()]

@action(detail=True, methods=["post"], permission_classes=[IsSuperAdmin])
def activate(self, request, pk=None):
    ...
```

- **`get_permissions()`**: controla permisos a nivel de acción con conjuntos (`public_actions`, `admin_actions`)
- **`@action(permission_classes=[...])`**: documenta explícitamente qué rol requiere cada acción custom
- **Clases de permiso**: en `permissions.py` por app, granulares por rol (`IsSuperAdmin`, `IsCenterAdmin`, etc.)

| Rol | PuedeCrear | PuedeVer | PuedeEditar | PuedeEliminar |
|-----|-----------|----------|-------------|---------------|
| superadmin | Todo | Todo | Todo | Todo |
| center_admin | Su centro | Su centro | Su centro | No |
| voluntario | No | Su centro | No | No |
| adoptante | Solicitud | Propias | No | No |

### 7. Imágenes WebP

```python
# En pets/utils.py
def convert_to_webp(image_file, quality=85, max_width=1200):
    # Conversión automática
    # Retorna BytesIO con imagen WebP
```

- Se ejecuta en `pre_save` signal
- Calidad: 85%
- Max width: 1200px
- Max upload: 10MB
- **Storage**: Local filesystem

### 8. Docker Commands

```bash
# Desarrollo
docker compose up -d
docker compose down
docker compose logs -f api
docker compose exec api python manage.py shell

# Producción
docker compose -f docker-compose.prod.yml up -d
```

### 9. Django Commands

```bash
# Migraciones
python manage.py makemigrations
python manage.py migrate

# Superuser
python manage.py createsuperuser

# Static files
python manage.py collectstatic --noinput

# Shell
python manage.py shell
python manage.py shell -c "from apps.pets.models import Pet; print(Pet.objects.count())"

# Tests
python manage.py test
python manage.py test apps.pets
pytest
```

### 10. Git Workflow

```bash
# Features
git checkout -b feature/nombre-feature
git add .
git commit -m "feat(app): descripción"
git push origin feature/nombre-feature

# Commits
feat(adoptions): add state machine
fix(pets): fix WebP conversion
docs(readme): update API endpoints
refactor(users): extract auth services
test(centers): add unit tests
```

## Errores Comunes a Evitar

1. **NO** poner lógica en views.py → usar services.py
2. **NO** hardcodear strings → usar constants
3. **NO** commitear credenciales → usar .env
4. **NO** usar `User.objects.create_user()` en views → usar services
5. **NO** crear modelos sin `verbose_name` en español
6. **NO** usar `request.user.is_authenticated` directamente → usar permisos

## Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `config/settings/base.py` | Configuración principal |
| `config/settings/development.py` | Settings dev |
| `config/settings/production.py` | Settings prod |
| `.env.example` | Variables de entorno |
| `render.yaml` | Blueprint Render |
| `docker-compose.yml` | Dev containers |
| `docker-compose.prod.yml` | Prod containers |
| `frontend/src/components/PetSilhouette.tsx` | SVG silhouette fallback (dog/cat) |
| `frontend/src/app/(public)/adoptar/[id]/page.tsx` | Adoption form page |
| `frontend/src/app/(dashboard)/adoptions/page.tsx` | Dashboard adoptions management |

## Estado del Proyecto — Jul 2026 (Desplegado en Render)

### Backend: 102 tests ✅ — Ruff: 0 errors ✅
- Migraciones: al día ✅ (14 migraciones + apps propias al día)
- `ruff check apps/` → All checks passed ✅
- `ruff format apps/` → 93 files, estilo consistente ✅
- **Desplegado en**: `https://huellitas-api.onrender.com`
- **Health endpoint**: `/api/health/` (verifica DB + Redis)
- Apps: `users`, `centers`, `pets`, `adoptions`, `inquiries`

### Frontend: Build exitoso ✅ — ESLint: 0 warnings ✅
- **20 rutas estáticas**, 2 dinámicas (`/mascotas`, `/pets/[id]`, `/adoptar/[id]`)
- 22 componentes UI en `components/ui/`, `components/adoptions/`, `components/layout/`
- Stores Zustand: `authStore.ts`, `uiStore.ts`
- **Desplegado en**: `https://huellitasvenezuela-web.onrender.com`

### Infraestructura (Render)
| Servicio | Tipo | URL/Config |
|----------|------|------------|
| API | web (Docker) | `https://huellitas-api.onrender.com` |
| Frontend | web (Docker) | `https://huellitasvenezuela-web.onrender.com` |
| Redis | interno | Cache + Celery broker |
| DB | Render PostgreSQL | PostgreSQL 15, SSL require |

### Issues resueltos en auditoría integral (Jul 2026)

| Severidad | Cantidad | Área |
|-----------|----------|------|
| 🔴 CRÍTICO | 9 | Backend: WebP signal, entrypoint, SSL, inquiries, adoption orphan, dockerignore, render.yaml, Suspense, contacto form |
| 🟡 MEDIO | 14 | Lógica movida a services, permisos, bugs inquiries, species, normalización de URLs, Celery task, voluntario role |
| 🟢 BAJO | 7 | Renombrar IsAdminUser, select_reduntante, Secure cookies, tests inquiries, AGENTS.md, dead code |
| **Total** | **30** | |

### Fixes de infraestructura para deploy (14 issues)

| # | Issue | Archivo | Solución |
|---|-------|---------|----------|
| 1 | 🔴 Credenciales hardcodeadas | `production.py` | `validate_required_env()` para todas las vars |
| 2 | 🔴 SECRET_KEY no validado | `production.py` | Lanza ValueError si falta |
| 3 | 🔴 ALLOWED_HOSTS vacío | `production.py` | Validación requerida, wildcard `.onrender.com` |
| 4 | 🔴 CORS con localhost | `base.py` + `production.py` | `CORS_ALLOWED_ORIGINS` desde env var |
| 5 | 🔴 DATABASE_URL parsing roto | `production.py` | Regex con puerto opcional, fallback a vars |
| 6 | 🔴 REDIS_URL no validado | `production.py` | Validación + django_redis config |
| 7 | 🔴 Docker COPY paths incorrectos | `Dockerfile`s, `docker-compose.yml` | Paths relativos a raíz del repo |
| 8 | 🔴 entrypoint.sh ignora CMD | `entrypoint.sh` | `exec "$@"` + gunicorn workers 3 |
| 9 | 🔴 render.yaml con servicios no soportados | `render.yaml` | Solo redis+api+web, free tier |
| 10 | 🟡 Health check sin validación | `users/views.py`, `urls.py` | Verifica DB + Redis, responde 503 |
| 11 | 🟡 Frontend con --turbo | `package.json` | `--turbo` removido, webpack estable |
| 12 | 🟡 .dockerignore excluye configs | `frontend/.dockerignore` | `tailwind.config.js` y `postcss.config.js` removidos |
| 13 | 🟡 psycopg2 falla en Docker | `requirements.txt` | `psycopg2` → `psycopg2-binary` |
| 14 | 🟢 django_celery_beat no configurado | `base.py` | Agregado a INSTALLED_APPS |

### Fixes específicos aplicados (auditoría)

| # | Severidad | Issue | Archivo | Solución |
|---|-----------|-------|---------|----------|
| 1 | 🔴 | WebP signal nunca registrado | `pets/apps.py:9` | `ready()` ahora importa `apps.pets.signals` |
| 2 | 🔴 | Adoption se guarda antes de validar | `adoptions/views.py:106` | Nueva clase `AdoptionService.create_and_submit()` atómica |
| 3 | 🔴 | HelpRequest sin `id` en response | `inquiries/views.py:29` | `perform_create` llama `serializer.save()` + service |
| 4 | 🔴 | entrypoint.sh ignora CMD | `entrypoint.sh:19` | `exec "$@"` si hay args, fallback a runserver |
| 5 | 🔴 | render.yaml sin RUN_MIGRATIONS | `render.yaml` | Variable `RUN_MIGRATIONS: "true"` en api service |
| 6 | 🔴 | SSL redirect loop sin proxy header | `production.py:49` | `SECURE_PROXY_SSL_HEADER` antes de `SECURE_SSL_REDIRECT` |
| 7 | 🔴 | Contacto form no funciona | `contacto/page.tsx` | `onSubmit` + `name` inputs + fetch a API |
| 8 | 🔴 | useSearchParams sin Suspense | `login/page.tsx:13` | `LoginForm` envuelto en `<Suspense>` |
| 9 | 🔴 | Dockerignore excluye configs build | `frontend/.dockerignore:9-10` | Eliminados `tailwind.config.js` y `postcss.config.js` |
| 10 | 🟡 | Export permissions inconsistentes | `adoptions/views.py:44` | `export` agregado a `admin_actions` |
| 11 | 🟡 | inquiries address mapea state | `inquiries/services.py:33` | Address generado desde state |
| 12 | 🟡 | inquiries phone causa 500 | `inquiries/services.py:29` | Fallback `"Sin teléfono"` si phone vacío |
| 13 | 🟡 | Stats en view en vez de service | `pets/views.py:94` | Movido a `PetService.get_stats()` |
| 14 | 🟡 | Export pets Word en view | `pets/views.py:110` | Movido a `PetService.export_to_docx()` |
| 15 | 🟡 | Export adoptions Word en view | `adoptions/views.py:78` | Movido a `AdoptionService.export_to_docx()` |
| 16 | 🟡 | mark_read en view | `inquiries/views.py:33` | Movido a `HelpRequestService.mark_as_read()` |
| 17 | 🟡 | partial_update query extra DB | `users/views.py:115` | Refactorizado sin `self.get_object()` duplicado |
| 18 | 🟡 | Voluntario no asignable vía API | `users/serializers.py:106` | Agregado `("voluntario", "Voluntario")` |
| 19 | 🟡 | Celery task nunca llamada | `adoptions/tasks.py` | Notifications ahora delega a task async con fallback sync |
| 20 | 🟡 | Species binario en dashboard | `pets/page.tsx:123` | Mapa `{dog: 'Perro', cat: 'Gato', other: 'Otro'}` |
| 21 | 🟡 | normalizeImageUrl para rutas relativas | `utils.ts:6-9` | URLs relativas se mantienen, Next.js rewrite proxy |
| 22 | 🟡 | selectedCenter unused state | `centros/page.tsx:41` | Estado y onClick removidos |
| 23 | 🟡 | Navbar variant prop muerta | `Navbar.tsx:16` | Prop `variant` removida |
| 24 | 🟡 | Adoptar usa fetch en vez de axios | `adoptar/[id]/page.tsx:66` | Cambiado a `api.get()` |
| 25 | 🟡 | server.ts GET hardcodeado | `server.ts:29` | `method: 'GET'` removido |
| 26 | 🟢 | IsAdminUser sombrea DRF | `pets/permissions.py:25` | Renombrado a `IsAdminRole` |
| 27 | 🟢 | select_related redundante | `centers/views.py:109` | Eliminado `.select_related("center")` |
| 28 | 🟢 | Cookies sin Secure flag | `cookies.ts:4` | `Secure` agregado en HTTPS |
| 29 | 🟢 | AGENTS.md desactualizado | `AGENTS.md` | Actualizado con estado post-fix |
| 30 | 🟢 | Sin tests para inquiries | `inquiries/tests/` | Creados: 2 model + 4 service + 4 view |

## Contacto

- **Repo**: https://github.com/Worren073/Huellitas_Barinas.git
- **Email**: worrenalexanderbz@gmail.com
- **Deploy**: Render
- **DB**: Render PostgreSQL
- **Storage**: Local filesystem
- **API**: https://huellitas-api.onrender.com
- **Web**: https://huellitasvenezuela-web.onrender.com
