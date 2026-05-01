# 🏢 CoWork — Sistema de Gestión de Espacios de Coworking

Stack: **React + Vite** | **Node.js + Express** | **MariaDB** | **JWT**

---

## 📁 Estructura del proyecto

```
coworking/
├── backend/          # API REST (Node.js + Express + Knex)
│   ├── src/
│   │   ├── config/   # database.js, migrate.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── .env.example
│   └── package.json
│
└── frontend/         # React + Vite
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   └── styles/
    ├── .env.example
    └── package.json
```

---

## ⚙️ Instalación local

### 1. Base de datos MariaDB

```sql
CREATE DATABASE coworking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'coworking_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON coworking_db.* TO 'coworking_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tus datos
npm install
npm run migrate     # Crea tablas e inserta datos iniciales
npm run dev         # Inicia en modo desarrollo (puerto 4000)
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Editar VITE_API_URL si el backend está en otro puerto/host
npm install
npm run dev         # Inicia en localhost:5173
```

---

## 🌐 Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `4000` |
| `DB_HOST` | Host de MariaDB | `localhost` |
| `DB_PORT` | Puerto de MariaDB | `3306` |
| `DB_USER` | Usuario de la BD | `coworking_user` |
| `DB_PASSWORD` | Contraseña de la BD | `mi_password` |
| `DB_NAME` | Nombre de la BD | `coworking_db` |
| `JWT_SECRET` | Clave secreta JWT | Cadena larga y aleatoria |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `FRONTEND_URL` | URL del frontend (CORS) | `https://midominio.com` |
| `WHATSAPP_NUMBER` | Número WhatsApp | `521234567890` |

### Frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `https://api.midominio.com/api` |
| `VITE_WHATSAPP_NUMBER` | Número WhatsApp | `521234567890` |
| `VITE_WHATSAPP_MESSAGE` | Mensaje predefinido de WA | `Hola, quiero reservar...` |

---

## 🚀 Despliegue en producción

### Backend (servidor Linux con PM2)

```bash
# Instalar PM2 globalmente
npm install -g pm2

cd backend
cp .env.example .env
# Configurar variables de producción
npm install --production
npm run migrate

# Iniciar con PM2
pm2 start src/index.js --name coworking-api
pm2 save
pm2 startup   # Para reinicio automático
```

### Frontend (build estático)

```bash
cd frontend
# Asegúrate de configurar VITE_API_URL correctamente
npm run build
# La carpeta dist/ contiene los archivos estáticos
# Sirve con Nginx, Vercel, Netlify, etc.
```

### Nginx (ejemplo)

```nginx
# API
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/coworking/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔐 Credenciales por defecto (admin)

Después de ejecutar `npm run migrate`:

- **Email:** `admin@coworking.com`
- **Contraseña:** `Admin123!`

> ⚠️ **Cambia estas credenciales inmediatamente en producción.**

---

## 📡 API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/auth/me` | Perfil del usuario (🔒) |

### Tipos de espacio
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/space-types` | Lista activos (público) |
| GET | `/api/space-types/admin` | Lista todos (🔒 admin) |
| POST | `/api/space-types` | Crear tipo (🔒 admin) |
| PUT | `/api/space-types/:id` | Editar tipo (🔒 admin) |
| DELETE | `/api/space-types/:id` | Desactivar tipo (🔒 admin) |

### Reservas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/reservations/my` | Mis reservas (🔒) |
| GET | `/api/reservations/all` | Todas las reservas (🔒 admin) |
| GET | `/api/reservations/availability` | Disponibilidad (🔒) |
| POST | `/api/reservations` | Crear reserva (🔒) |
| PATCH | `/api/reservations/:id/cancel` | Cancelar reserva (🔒) |
| PUT | `/api/reservations/:id` | Editar reserva (🔒 admin) |

### Contacto
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/contact` | Enviar mensaje (público) |
| GET | `/api/contact` | Ver mensajes (🔒 admin) |
| PATCH | `/api/contact/:id/read` | Marcar leído (🔒 admin) |

---

## 🗓️ Funcionalidades

- **Calendario** con vistas día/semana/mes (L-V 9:00-18:00)
- **Validación de conflictos** al reservar (sin doble reserva)
- **Costo en tiempo real** al seleccionar horario
- **Panel admin** con gestión de reservas, espacios y mensajes
- **Mapa interactivo** con Leaflet + OpenStreetMap
- **Botón WhatsApp** con mensaje predefinido
- **Autenticación JWT** con roles (user / admin)

---

## 🛠️ Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Estilos | CSS puro con variables (sin frameworks) |
| Calendario | date-fns + componente propio |
| Mapa | React-Leaflet + OpenStreetMap |
| HTTP client | Axios |
| Backend | Node.js + Express |
| ORM/Query | Knex.js |
| Base de datos | MariaDB / MySQL |
| Auth | JWT + bcryptjs |
| Proceso | PM2 (producción) |
