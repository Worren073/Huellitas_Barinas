# Huellitas Barinas

Plataforma web para la gestión de centros de adopción de mascotas en Barinas, Venezuela.

## Arquitectura

- **Backend**: Django 5.x + Django REST Framework
- **Frontend**: Next.js 14 + Tailwind CSS + TypeScript
- **Base de Datos**: PostgreSQL (Neon)
- **Cache/Colas**: Redis + Celery
- **Almacenamiento**: Cloudflare R2
- **Despliegue**: Docker en Render

## Estructura del Proyecto

```
Huellitas_Barinas/
├── backend/                    # API Django
│   ├── apps/
│   │   ├── users/             # Gestión de usuarios
│   │   ├── centers/           # Gestión de centros
│   │   ├── pets/              # Gestión de mascotas
│   │   └── adoptions/         # Flujo de adopciones
│   ├── config/                # Configuración Django
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # Next.js Frontend
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── nginx/                      # Configuración Nginx
├── docker-compose.yml
├── docker-compose.prod.yml
└── render.yaml
```

## Modelo de Dominio

### Usuarios
- **Roles**: superadmin, center_admin, voluntario, adoptante
- **Autenticación**: JWT (15min access, 7 días refresh)

### Centros
- **Estados**: active, inactive, pending
- **Capacidad**: total, available, in_process, adopted

### Mascotas
- **Especies**: perro, gato, conejo, otro
- **Estados**: available, in_process, adopted, removed
- **Imágenes**: Conversión automática a WebP (calidad 85%)

### Adopciones
- **Estados**: pending → under_review → approved/rejected → completed (+ cancelled)
- **Timeline**: Historial completo de cambios de estado

## Instalación Local

### Requisitos
- Docker y Docker Compose
- Git

### Pasos

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Worren073/Huellitas_Barinas.git
   cd Huellitas_Barinas
   ```

2. Crear archivo `.env`:
   ```bash
   cp .env.example .env
   ```

3. Editar `.env` con tus credenciales (Neon, R2, Email)

4. Iniciar servicios:
   ```bash
   docker compose up
   ```

5. Acceder a:
   - API: http://localhost:8000
   - Admin: http://localhost:8000/admin/
   - Frontend: http://localhost:3000

## API Endpoints

### Autenticación
- `POST /api/v1/auth/register/` - Registro
- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/refresh/` - Refrescar token

### Usuarios
- `GET /api/v1/users/me/` - Perfil actual
- `PUT /api/v1/users/me/` - Actualizar perfil

### Centros
- `GET /api/v1/centers/` - Listar centros
- `POST /api/v1/centers/` - Crear centro
- `GET /api/v1/centers/{id}/` - Detalle del centro
- `PUT /api/v1/centers/{id}/` - Actualizar centro
- `POST /api/v1/centers/{id}/activate/` - Activar centro
- `POST /api/v1/centers/{id}/deactivate/` - Desactivar centro

### Mascotas
- `GET /api/v1/pets/` - Listar mascotas
- `POST /api/v1/pets/` - Crear mascota
- `GET /api/v1/pets/{id}/` - Detalle de mascota
- `PUT /api/v1/pets/{id}/` - Actualizar mascota
- `POST /api/v1/pets/{id}/available/` - Marcar disponible
- `POST /api/v1/pets/{id}/in_process/` - Marcar en proceso
- `POST /api/v1/pets/{id}/adopted/` - Marcar adoptada

### Adopciones
- `GET /api/v1/adoptions/` - Listar solicitudes
- `POST /api/v1/adoptions/` - Crear solicitud
- `POST /api/v1/adoptions/{id}/submit/` - Enviar solicitud
- `POST /api/v1/adoptions/{id}/start_review/` - Iniciar revisión
- `POST /api/v1/adoptions/{id}/approve/` - Aprobar
- `POST /api/v1/adoptions/{id}/reject/` - Rechazar
- `POST /api/v1/adoptions/{id}/complete/` - Completar
- `GET /api/v1/adoptions/{id}/timeline/` - Ver timeline

## Despliegue en Render

1. Crear cuenta en Render
2. Conectar repositorio GitHub
3. Usar Blueprint existente (`render.yaml`)
4. Configurar variables de entorno en el dashboard

## Desarrollo

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
cd backend
python manage.py test
```

## Licencia

MIT License
