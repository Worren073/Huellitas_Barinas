# AGENTS.md - Instrucciones para Agentes

## Contexto del Proyecto

**Huellitas Barinas** - Sistema web para gestión de centros de adopción en Barinas, Venezuela.

## Stack

- **Backend**: Django 5.x + DRF + PostgreSQL (Neon) + Redis + Celery
- **Frontend**: Next.js 14 + Tailwind CSS + TypeScript
- **Deploy**: Docker + Render
- **Storage**: Cloudflare R2

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
- Storage: Cloudflare R2

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

## Próximos Pasos (Pendiente)

| Prioridad | Tarea | Descripción |
|-----------|-------|-------------|
| 🟢 Baja | **Fase 7** | ErrorBoundary, skeleton loaders, framer-motion animaciones, ESLint/Prettier, CHANGELOG.md |
| 🟢 Baja | **Documentación** | Actualizar PROJECT_STATUS.md, EXECUTIVE_SUMMARY.md |
| 🟢 Baja | **Tests opcionales** | pytest-cov, serializer tests, tests de integración |

## Progreso de Sesiones

### Sesión Anterior (Feb 2026)
**Completado:**
- PetSilhouette: componente SVG que muestra silueta de perro/gato cuando falla la imagen
- Seed data: descarga imágenes reales de Unsplash (5 perros + 3 gatos); fallback a placeholder con inicial
- PetCard actualizado con `onError` + `imgError` state → muestra `PetSilhouette`
- Pet detail: botón "Iniciar Solicitud" funcional, enlaza a `/adoptar/[id]`
- Formulario de postulación `(public)/adoptar/[id]`: validación cliente, POST a `/api/v1/adoptions/`
- Dashboard adoptions `/dashboard/adoptions/`: métricas, tabla con filtros, timeline/detalle/acciones modales
- Build exitoso en producción (0 errores, 0 advertencias)
- 7 fixes críticos de seguridad aplicados (credenciales a env vars, validación automática, multi-stage build, etc.)
- Documentación agents_context/ completa (8 documentos, ~58 KB)

### Sesión Actual (Jul 2026) — Refactor Completo: Permisos, Servicios, Frontend, Tests, Mejoras
**Completado:**
- Fase 1 — **Bug fixes**: `production.py` import order fixed, credentials removed from `.opencode/context/PROJECT.md` and `base.py`.
- Fase 2 — **Permission refactor**: all ViewSets (`pets`, `adoptions`, `users`) use `get_permissions()` + `@action(permission_classes=...)` pattern matching `centers/views.py`.
- **Docker infrastructure**: Fixed CRLF→LF line endings in `entrypoint.sh`, `entrypoint-worker.sh`, `entrypoint-beat.sh`. All 6 containers healthy.
- Fase 3 — **PetService instance pattern**: Changed from `@staticmethod` to `__init__(self, pet)`. Instance methods: `mark_as_adopted()`, `mark_as_in_process()`, `mark_as_available()`, `mark_as_not_available()`, `update_pet(**kwargs)`. Classmethods: `create_pet(**kwargs)`, `get_available_pets()`, `get_pets_by_center(center)`.
- Fase 4 — **Frontend**: Shared TS types (`lib/types.ts`), `Pagination` component, 4 static pages (`contacto`, `terminos`, `privacidad`, `redes`), centros map page with `react-leaflet` v4, "Mis Solicitudes" dashboard page with pagination, 5 social SVG icons in `Icon.tsx`, Navbar centros link updated.
- Fase 5 — **Zustand stores**: `authStore` (auth state, tokens, login/register/logout/fetchProfile/hydrate) and `uiStore` (sidebar, theme, modal state). Both TS-clean.
- Fase 6 — **63 new tests** (92 total, all passing): permissions (12+10+11=33 tests), views (11+9=20 tests), services (6 tests). Covers all permission classes, CRUD endpoints, approval flows.
- **Permission bug fixes**: `None` user guard (`bool(request.user and ...)`) added to `adoptions/permissions.py` and `users/permissions.py` — prevented 500 errors on unauthenticated requests.
- Fase 7 — **Mejoras menores**:
  - `ErrorBoundary` component (class-based, fallback UI con retry) en `layout.tsx`
  - `Skeleton`, `PetCardSkeleton`, `TableSkeleton` componentes reutilizables
  - `Modal` reutilizable (keyboard trap, click-outside, overflow lock)
  - `TimelineModal`, `DetailModal`, `ActionModal` refactorizados para usar `Modal`
  - ESLint reglas adicionales + `.prettierrc` + `pyproject.toml` ruff config
  - `CHANGELOG.md` con formato Keep a Changelog
  - `ScrollAnimation` añadido a páginas contacto, términos, privacidad, redes, centros

**Pendiente:**
- Docs opcionales: Update PROJECT_STATUS.md, EXECUTIVE_SUMMARY.md
- Tests opcionales: pytest-cov, serializer tests, integration tests

## Contacto

- **Repo**: https://github.com/Worren073/Huellitas_Barinas.git
- **Email**: worrenalexanderbz@gmail.com
- **Deploy**: Render
- **DB**: Neon PostgreSQL
- **Storage**: Cloudflare R2
