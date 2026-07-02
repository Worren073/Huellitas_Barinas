# 🐾 Huellitas Barinas - Sistema de Adopción de Mascotas

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Worren073/Huellitas_Barinas)
[![Python](https://img.shields.io/badge/Python-3.12+-blue)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![Django](https://img.shields.io/badge/Django-5.1-darkgreen)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)

Plataforma web completa para gestión de centros de adopción de mascotas en Barinas, Venezuela.

## 🌟 Características

- 🔐 **Autenticación JWT** con roles (Admin, Voluntario, Adoptante)
- 🐕 **Gestión de Mascotas** con imágenes WebP optimizadas
- 📋 **Sistema de Adopciones** con estado máquina
- 🏢 **Gestión de Centros** con información completa
- 📱 **Responsive Design** con Tailwind CSS
- 🚀 **Celery + Redis** para tareas asincrónicas
- 💾 **Almacenamiento en Cloudflare R2** (S3-compatible)
- 📊 **API RESTful** documentada con Swagger
- ✅ **Tests** con pytest y Django testing framework

## 📚 Stack Técnico

### Backend
- **Framework**: Django 5.1 + Django REST Framework
- **Base de Datos**: PostgreSQL (Neon)
- **Cache/Queue**: Redis + Celery
- **Almacenamiento**: Cloudflare R2
- **Autenticación**: JWT (django-rest-framework-simplejwt)
- **API Docs**: drf-spectacular (OpenAPI 3.0)

### Frontend
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Componentes**: Componentes personalizados + Heroicons

### DevOps
- **Containerización**: Docker & Docker Compose
- **Deploy**: Render
- **CI/CD**: GitHub Actions (preparado)
- **Monitoreo**: Sentry (opcional)

## 🚀 Inicio Rápido

### Prerequisitos

- Python 3.12+
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clonar Repositorio

```bash
git clone https://github.com/Worren073/Huellitas_Barinas.git
cd Huellitas_Barinas
```

### 2. Configurar Variables de Entorno

```bash
# Copiar plantilla de variables
cp .env.example .env

# Editar con tus valores
nano .env  # o tu editor favorito
```

Valores mínimos requeridos:

```env
DJANGO_SETTINGS_MODULE=config.settings.development
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://postgres:postgres@db:5432/huellitas_barinas
REDIS_URL=redis://redis:6379/0
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Iniciar con Docker Compose

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Crear superuser
docker-compose exec api python manage.py createsuperuser

# Ver estado
docker-compose ps
```

### 4. Acceder a la Aplicación

```
Frontend:  http://localhost:3000
API:       http://localhost:8000
API Docs:  http://localhost:8000/api/docs/
Admin:     http://localhost:8000/admin/
```

## 📖 Documentación

### Setup Detallado

- [Backend Setup](backend/README.md)
- [Frontend Setup](frontend/README.md)
- [Database Setup](backend/MIGRATIONS.md)

### Guides

- [🚀 Deployment Guide](DEPLOYMENT.md) - Desplegar a Render
- [🛠️ Development Guide](AGENTS.md) - Convenciones y patrones
- [🔐 Security Guide](SECURITY.md) - Mejores prácticas
- [📋 API Documentation](http://localhost:8000/api/docs/) - Swagger UI

## 🏗️ Estructura del Proyecto

```
Huellitas_Barinas/
├── backend/
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py          # Configuración común
│   │   │   ├── development.py   # Settings de desarrollo
│   │   │   └── production.py    # Settings de producción
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/
│   │   ├── centers/
│   │   ├── pets/
│   │   └── adoptions/
│   ├── scripts/
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── app/           # App Router de Next.js
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilidades y configuración
│   │   └── styles/        # CSS global
│   ├── package.json
│   └── next.config.js
├── docker-compose.yml
├── docker-compose.prod.yml
├── render.yaml            # Blueprint para Render
├── DEPLOYMENT.md          # Guía de deployment
└── AGENTS.md             # Guía de desarrollo
```

## 🔄 Flujo de Desarrollo

### Crear Nueva Feature

```bash
# 1. Crear rama
git checkout -b feature/nombre-feature

# 2. Hacer cambios
# ... editar archivos ...

# 3. Commit
git add .
git commit -m "feat(app): descripción"

# 4. Push
git push origin feature/nombre-feature

# 5. Pull Request en GitHub
```

### Patrón MVP (Model-View-Presenter)

```
models.py      → Estructura de datos
services.py    → Lógica de negocio
serializers.py → Validación de datos
views.py       → Solo delega a services
```

**REGLA**: Nunca poner lógica en views.py o serializers.py

## 🧪 Testing

### Backend

```bash
# Todos los tests
docker-compose exec api python manage.py test

# Test específico
docker-compose exec api python manage.py test apps.pets

# Con coverage
docker-compose exec api pytest --cov=apps
```

### Frontend

```bash
cd frontend

# Unit tests
npm run test

# Build
npm run build

# Linting
npm run lint
```

## 🚀 Deployment

### Staging (Recommended)

```bash
# 1. Hacer commit y push
git push origin develop

# 2. Render auto-deploya desde develop branch
# 3. Test en staging
# 4. Si todo bien, mergear a main

git checkout main
git merge develop
git push origin main
```

### Production

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para guía completa.

```bash
# Validar antes de pushear a main
python scripts/validate_production_settings.py --check-secrets

# Push a main (triggers pre-push hook)
git push origin main

# Monitor en Render Dashboard
```

## 📝 Convenciones de Código

### Commits

```
feat(adoption): add status transitions
fix(pets): fix WebP conversion issue
docs(api): update endpoints documentation
refactor(users): extract auth service
test(centers): add unit tests
```

### Python (Backend)

```python
# Naming
Models:        PascalCase       (Pet, Adoption)
Functions:     snake_case       (get_pet_count)
Constants:     UPPER_SNAKE     (MAX_UPLOAD_SIZE)
Variables:     snake_case       (pet_status)
```

### TypeScript (Frontend)

```typescript
// Naming
Components:    PascalCase      (PetCard)
Functions:     camelCase       (getPetCount)
Constants:     UPPER_SNAKE     (MAX_UPLOAD_SIZE)
Types:         PascalCase      (PetType)
```

## 🔐 Seguridad

### Pre-Deploy Checklist

```bash
# 1. Validar settings
python scripts/validate_production_settings.py --check-secrets

# 2. Verificar que no hay secretos en git
git log --oneline -S 'SECRET_KEY' -S 'password' -S 'token'

# 3. Revisar variables de entorno
grep -r "password\|secret\|token" backend/config/settings/production.py
```

### Best Practices

- ✅ Usar variables de entorno para todos los secretos
- ✅ Nunca commitear .env
- ✅ Usar HTTPS en producción
- ✅ Validar input en backend y frontend
- ✅ CORS configurado para dominios específicos
- ✅ Rate limiting en endpoints sensibles
- ✅ JWT con refresh tokens

Ver [SECURITY.md](SECURITY.md) para más detalles.

## 🐛 Troubleshooting

### Errores Comunes

#### Database Connection Refused

```bash
# Verificar que DB está corriendo
docker-compose ps db

# Conectar a DB directamente
docker-compose exec db psql -U postgres -d huellitas_barinas

# Reset (⚠️ CUIDADO - borra datos)
docker-compose down -v
docker-compose up -d
```

#### Port Already in Use

```bash
# Ver qué está usando el puerto
lsof -i :8000  # Backend
lsof -i :3000  # Frontend

# Matar proceso
kill -9 <PID>
```

#### Frontend Not Connecting to API

```
Verificar:
1. API está corriendo: curl http://localhost:8000/api/health/
2. NEXT_PUBLIC_API_URL en .env es correcto
3. CORS configurado en backend
4. Network tab en DevTools muestra request a API
```

## 📞 Soporte

- 📧 **Email**: [worrenalexanderbz@gmail.com](mailto:worrenalexanderbz@gmail.com)
- 🐙 **GitHub**: [Worren073](https://github.com/Worren073)
- 💬 **Issues**: [Reportar bug](https://github.com/Worren073/Huellitas_Barinas/issues)

## 📄 License

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para detalles.

## 🙏 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el repo
2. Crear rama con tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'feat: add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## ✨ Roadmap

- [ ] Mapa interactivo de centros (react-leaflet)
- [ ] Notificaciones en tiempo real (WebSocket)
- [ ] Página de contacto
- [ ] Términos y privacidad
- [ ] Redes sociales
- [ ] Animaciones con framer-motion
- [ ] Búsqueda avanzada de mascotas
- [ ] Sistema de recomendaciones

---

**Hecho con ❤️ para los animales de Barinas**

Última actualización: Febrero 2026 | v1.0.0
