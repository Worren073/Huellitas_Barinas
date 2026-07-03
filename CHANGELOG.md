# Changelog

## [0.2.0] - 2026-07-02

### Añadido
- **Fase 3 — PetService**: refactor completo a patrón de instancia (`PetService(pet).mark_as_adopted()`)
- **Fase 4 — Frontend**: tipos compartidos TypeScript, componente Pagination, páginas de contacto, términos, privacidad, redes sociales, mapa de centros con react-leaflet, vista "Mis Solicitudes" para adoptantes
- **Fase 5 — Estado global**: stores Zustand para autenticación (`authStore`) e interfaz (`uiStore`)
- **Fase 6 — Tests**: 63 nuevas pruebas (92 total) cubriendo permisos, vistas y servicios de todas las apps
- **Fase 7 — Mejoras**: ErrorBoundary, componentes Skeleton reutilizables, Modal genérico, config Prettier + ESLint mejorado, CHANGELOG
- Iconos sociales (Instagram, Facebook, Twitter, WhatsApp, Email) en componente Icon

### Corregido
- Error crítico en `production.py`: imports base al final sobrescribían config de CORS, caché y Celery
- Permisos `has_permission()`: guard contra `None` user en `adoptions/permissions.py` y `users/permissions.py` (prevenía 500 en requests no autenticados)
- Entrypoints Docker: conversión CRLF→LF en `entrypoint.sh`, `entrypoint-worker.sh`, `entrypoint-beat.sh`
- Credenciales sensibles eliminadas de archivos de contexto

### Refactorizado
- Permisos en todas las apps: patrón `get_permissions()` + `@action(permission_classes=...)` estandarizado
- Modales de adopciones (TimelineModal, DetailModal, ActionModal): ahora usan componente `Modal` reutilizable

## [0.1.0] - 2026-02-15

### Añadido
- Configuración inicial del proyecto: Django + DRF + Next.js 14 + Tailwind CSS + Docker
- Modelos: Pet, PetImage, Center, Adoption, User (con roles)
- CRUD básico de mascotas, centros y adopciones
- Autenticación JWT (login/register)
- Dashboard administrativo con métricas y tabla de adopciones
- Formulario de postulación de adopción
- Página pública de mascotas con tarjetas y filtros
- Componente PetSilhouette (fallback SVG para imágenes rotas)
- Seed data con imágenes reales de Unsplash
- Infraestructura Docker completa (api, web, worker, beat, db, redis)
- Configuración de producción para Render
- Seguridad: multi-stage build, validación automática, entorno aislado
