# Deploy Whatiket con Docker

## Requisitos previos
- Docker
- Docker Compose

## Pasos rápidos

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Editar .env con tus valores (URLs, contraseñas, JWT secrets)

# 3. Construir y levantar
docker-compose up -d --build

# 4. Ejecutar migraciones (primera vez)
docker-compose exec backend npx sequelize db:migrate
```

## Servicios
- **Backend:** puerto 4010 (o BACKEND_PORT)
- **Frontend:** puerto 80 (o FRONTEND_PORT)
- **PostgreSQL:** puerto 5432
- **Redis:** puerto 6379

## Notas
- El backend necesita que PostgreSQL y Redis estén listos antes de iniciar
- Para producción, usa un proxy reverso (nginx, traefik) con SSL
