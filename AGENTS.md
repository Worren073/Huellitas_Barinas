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

### 6. Permisos

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

## Próximos Pasos (Pendiente)

| Prioridad | Tarea | Descripción |
|-----------|-------|-------------|
| 🔴 Alta | **Imágenes reales** | Reemplazar placeholders de inicial por fotos reales (Unsplash/Pexels) o siluetas de mascota |
| 🔴 Alta | **Formulario de postulación** | Página `(public)/adoptar/[id]` con formulario (datos personales, motivo, experiencia). POST a `/api/v1/adoptions/` |
| 🔴 Alta | **Flujo de adopciones** | Dashboard: listar solicitudes, cambiar estado (pending→under_review→approved/rejected→completed), timeline |
| 🟡 Media | **Mapa de centros** | Agregar `lat`/`lng` a `Center`, `react-leaflet`, página `/centros` |
| 🟡 Media | **Vista de Contacto** | Modal o página `(public)/contacto` |
| 🟡 Media | **Vista de Términos** | Modal o página `(public)/terminos` |
| 🟡 Media | **Vista de Privacidad** | Modal o página `(public)/privacidad` |
| 🟡 Media | **Vista de Redes Sociales** | Modal o página `(public)/redes` |
| 🟢 Baja | **Animaciones** | `framer-motion`: fade-in scroll, transiciones de ruta, hover cards, skeleton animado |
| 🟢 Baja | **Placeholder visual** | Silueta SVG de perro/gato en vez de letras |

### Notas por tarea

- **Postulación**: requiere endpoint `POST /api/v1/adoptions/` con validaciones
- **Mapa**: `react-leaflet` + OpenStreetMap (gratuito, sin API key)
- **Modales**: componente `Modal.tsx` reutilizable en `components/ui/` con portal
- **Animaciones**: instalar `framer-motion`, wrapper `AnimatedSection.tsx`
- **Imágenes**: seed puede descargar de Unsplash o usar `https://placehold.co` como fallback

## Contacto

- **Repo**: https://github.com/Worren073/Huellitas_Barinas.git
- **Email**: worrenalexanderbz@gmail.com
- **Deploy**: Render
- **DB**: Neon PostgreSQL
- **Storage**: Cloudflare R2
