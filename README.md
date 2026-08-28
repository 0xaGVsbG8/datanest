# DataNest - Cloud Storage & File Management Platform

A full-stack cloud storage and file management platform built with Next.js, FastAPI, PostgreSQL, and Nginx. This application provides secure user authentication, file storage, sharing capabilities, and a modern web interface.

## 🏗️ Architecture Overview

The project follows a microservices architecture with four main services orchestrated through Docker Compose:

```
┌─────────────────────────────────────────────────────────┐
│                   NGINX Proxy (:9000)                   │
│              Reverse Proxy & Load Balancer              │
└────────────┬─────────────────────────────┬──────────────┘
             │                             │
   ┌─────────▼──────────┐       ┌─────────▼──────────┐
   │  Next.js Frontend  │       │  FastAPI Backend   │
   │    Port: 9001      │       │    Port: 9002      │
   │  (React 19 + TS)   │       │  (Python + SQLAlch) │
   └────────────────────┘       └─────────┬───────────┘
                                          │
                                 ┌────────▼─────────┐
                                 │  PostgreSQL DB   │
                                 │   Port: 9003     │
                                 │  (datanestDB)    │
                                 └──────────────────┘
```

---

## 📁 Project Structure

### Root Directory

```
ai test/
├── docker-compose.yaml          # Main orchestration file
├── backend_fastapi/             # FastAPI backend service
├── frontend_next/               # Next.js frontend service
├── nginx/                       # Nginx reverse proxy
├── postgres_db_docker/          # PostgreSQL database
├── sql_vm/                      # SQL VM directory
└── sql_yoyo/                    # SQL Yoyo directory
```

---

## 🚀 Services

### 1. **NGINX Reverse Proxy** (`nginx/`)

**Container Name:** `nginx-app-proxy`  
**Port:** `9000`  
**Purpose:** Acts as the main entry point, routing traffic to frontend and backend services.

#### Key Files:
- `default.conf` - Nginx configuration with proxy rules
- `dockerfile` - Nginx container build configuration

#### Routes:
- `/datanest/backend/*` → FastAPI Backend (port 9002)
- `/datanest/drive/*` → Next.js Frontend (port 9001)
- `/datanest/assets/*` → Static assets from frontend
- `/datanest/_next/*` → Next.js build assets
- `/datanest/` → Redirector endpoint

#### Features:
- WebSocket support (Connection upgrade)
- Request buffering disabled for real-time operations
- 120-second timeout for long-running requests
- Logs disabled for performance (`access_log off`)

---

### 2. **Frontend - Next.js** (`frontend_next/`)

**Container Name:** `next_frontend`  
**Port:** `9001`  
**Framework:** Next.js 15.4.6 with React 19 and TypeScript

#### Directory Structure:

```
frontend_next/
├── app_self/
│   ├── app/                     # Next.js App Router
│   │   ├── drive/              # Main drive application
│   │   │   ├── auth/           # Authentication pages (20 files)
│   │   │   ├── dev/            # Developer tools (18 files)
│   │   │   ├── home/           # Home/dashboard (55 files)
│   │   │   └── layout.tsx
│   │   ├── config.tsx
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── public/                  # Static assets
│   │   └── assets/             # 40 images (PNG, WebP, JPG)
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
└── Dockerfile
```

#### Key Dependencies:
- **Next.js:** ^15.4.6 (React framework)
- **React:** ^19.1.0
- **React Window:** ^2.2.1 (Virtualization for large lists)
- **Tailwind CSS:** ^4 (Styling)
- **TypeScript:** ^5

#### Features:
- Server-side rendering (SSR)
- App Router architecture
- Authentication system (`/drive/auth`)
- File management interface (`/drive/home`)
- Developer tools (`/drive/dev`)
- Responsive design with Tailwind CSS
- Virtual scrolling for performance

---

### 3. **Backend - FastAPI** (`backend_fastapi/`)

**Container Name:** `fastapi_backend`  
**Port:** `9002`  
**Framework:** FastAPI with Python

#### Directory Structure:

```
backend_fastapi/
├── app_self/
│   ├── __STORAGE_VAULT/         # User file storage
│   │   ├── config.json
│   │   └── USERS/
│   │       └── root@dash.io/    # User-specific storage
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── db_conn.py           # Database connection
│   │   ├── overseer.py          # Application oversight
│   │   ├── app_independencies.py
│   │   ├── modules/             # Core modules (11 Python files)
│   │   ├── views/               # API endpoints
│   │   │   ├── auth_creds.py    # Authentication
│   │   │   ├── assign_user_id.py
│   │   │   ├── models.py        # Data models
│   │   │   ├── non_auth/        # Public endpoints (8 files)
│   │   │   ├── personal/        # User-specific endpoints (23 files)
│   │   │   └── for_devs/        # Developer endpoints (10 files)
│   │   └── templates/
│   │       └── index.html       # Template for redirector
│   └── deploy.py
├── Dockerfile
└── requirements.txt
```

#### Key Dependencies:
- **FastAPI:** 0.116.1 (Web framework)
- **SQLAlchemy:** 2.0.41 (ORM)
- **Psycopg2:** 2.9.10 (PostgreSQL adapter)
- **Pydantic:** 2.11.7 (Data validation)
- **Uvicorn:** 0.35.0 (ASGI server)
- **Gunicorn:** 23.0.0 (Process manager)
- **Bcrypt:** 4.3.0 (Password hashing)
- **Redis:** 6.2.0 (Caching/sessions)
- **Channels:** 4.2.2 (WebSocket support)

#### API Routers:
1. **Main Router:** `/backend/` - Test and redirector endpoints
2. **Auth Router:** Authentication and authorization
3. **Non-Auth Router:** Public endpoints (registration, login)
4. **Personal Router:** User-specific file operations (protected)
5. **Dev Router:** Developer tools and debugging (protected)

#### Features:
- RESTful API with FastAPI
- JWT/Token-based authentication
- File upload/download handling
- User storage management in `__STORAGE_VAULT`
- WebSocket support for real-time features
- Database ORM with SQLAlchemy
- CORS middleware configured
- Protected routes with middleware

---

### 4. **Database - PostgreSQL** (`postgres_db_docker/`)

**Container Name:** `datanestDB_postgres`  
**Port:** `9003` (mapped to 5432 internally)  
**Database:** `datanestDB`

#### Directory Structure:

```
postgres_db_docker/
├── data/                        # Persistent database data
│   ├── base/                    # Database files
│   ├── global/                  # Global cluster data
│   ├── pg_wal/                  # Write-Ahead Logs
│   ├── postgresql.conf          # PostgreSQL configuration
│   └── pg_hba.conf             # Host-based authentication
├── db_template.sql              # Database schema template
└── Dockerfile
```

#### Database Schema:

**Tables:**
1. **`users`** - User accounts
   - `id` (bigint, primary key)
   - `email` (text, unique)
   - `password` (text, hashed)
   - `creation_date` (timestamp)
   - `isDev` (boolean)
   - `user_token` (UUID)

2. **`ITEMSINFO`** - File/folder metadata
   - `id` (bigint, primary key)
   - `path` (text)
   - `owner` (text, FK to users.email)
   - `type` (text)
   - `url_token` (text)
   - `isFavourite` (boolean)
   - `last_change` (bigint, timestamp)

3. **`shared_items`** - Shared file access
   - `id` (bigint, primary key)
   - `path` (text)
   - `type` (text)
   - `local_token` (text)
   - `access_type` (text)
   - `overall_access` (text)
   - `owner` (text, FK to users.email)
   - `parent` (boolean)
   - `allowed_by` (text[])
   - `FavouriteOf` (text[])
   - `last_change` (bigint)

4. **`passcodes_info`** - Authentication codes
   - `id` (bigint, primary key)
   - `passcode` (bigint)
   - `auth_token` (UUID)
   - `type` (text: login/register/reset_password)
   - `for_user_token` (text)

5. **`zipinfo`** - Zip file tracking
   - `id` (bigint, primary key)
   - `zip_token` (text)
   - `user_token` (text)
   - `crt_date` (timestamp)

#### Database Features:
- Auto-incrementing IDs with sequences
- UUID generation for tokens (`gen_random_uuid()`)
- Triggers for `last_change` timestamp updates
- Foreign key constraints with CASCADE delete
- Default root user: `root@dash.io`

#### Credentials (Default):
- **User:** `postgres`
- **Password:** `postgres`
- **Database:** `datanestDB`

---

## 🔧 Configuration Files

### Docker Compose (`docker-compose.yaml`)

Orchestrates all services with:
- **Network:** `datanest_net` (bridge driver)
- **Service Dependencies:** nginx → frontend + backend → postgres
- **Volume Mounts:** 
  - PostgreSQL data persistence
  - Backend storage vault

### Environment Variables

**PostgreSQL:**
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`
- `POSTGRES_DB=datanestDB`

---

## 🚦 Getting Started

### Prerequisites
- Docker & Docker Compose
- Git (for cloning)

### Installation

1. **Clone the repository**
   ```bash
   cd "E:\workspace\ai test"
   ```

2. **Build and start all services**
   ```bash
   docker-compose up -d --build
   ```

3. **Verify services are running**
   ```bash
   docker-compose ps
   ```

4. **Access the application**
   - **Main Application:** http://localhost:9000/datanest/
   - **Frontend Direct:** http://localhost:9001
   - **Backend API:** http://localhost:9002/backend/
   - **Database:** localhost:9003

### Stopping Services

```bash
docker-compose down
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f fastapi_backend
docker-compose logs -f next_frontend
docker-compose logs -f nginx-app-proxy
docker-compose logs -f postgres
```

---

## 🛠️ Development

### Backend Development

```bash
cd backend_fastapi/app_self
pip install -r ../requirements.txt
cd app
uvicorn main:app --reload --port 9002 --host 0.0.0.0
```

### Frontend Development

```bash
cd frontend_next/app_self
npm install
npm run dev
```

### Database Access

```bash
# Connect to PostgreSQL
docker exec -it datanestDB_postgres psql -U postgres -d datanestDB

# View tables
\dt

# Exit
\q
```

---

## 🔐 Security Features

- **Password Hashing:** Bcrypt for secure password storage
- **Token-based Auth:** UUID tokens for user sessions
- **Passcode System:** 6-digit passcodes for registration/login
- **Protected Routes:** Middleware protection on sensitive endpoints
- **CORS Configuration:** Controlled cross-origin access
- **User Isolation:** Individual storage vaults per user

---

## 📊 API Endpoints

### Public Endpoints (`/backend/`)
- `GET/POST /test/` - Test endpoint
- `/redirector/` - HTML redirector

### Authentication (`/backend/auth/`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /reset-password` - Password reset

### Personal Endpoints (`/backend/personal/`) [Protected]
- File operations (upload, download, delete)
- Folder management
- Favourites management
- Sharing functionality

### Developer Endpoints (`/backend/dev/`) [Protected, Dev Only]
- System diagnostics
- Database management
- User management

---

## 📦 Storage Structure

```
__STORAGE_VAULT/
├── config.json              # Storage configuration
├── it_works.txt            # System check file
└── USERS/
    └── {user_email}/       # User-specific storage
        └── [user files]    # Uploaded files and folders
```

---

## 🌐 Network Architecture

All services communicate through the `datanest_net` bridge network:

- **External Access:** Port 9000 (Nginx)
- **Internal Communication:**
  - Frontend → Backend (internal port 9002)
  - Backend → PostgreSQL (internal port 5432)
  - Nginx → Frontend (internal port 9001)
  - Nginx → Backend (internal port 9002)

---

## 📝 Additional Directories

### `sql_vm/`
SQL Virtual Machine directory (purpose TBD)

### `sql_yoyo/`
SQL Yoyo directory (purpose TBD)

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :9000

# Change port in docker-compose.yaml
ports:
  - "9999:9000"  # Use different external port
```

### Database Connection Issues
```bash
# Restart PostgreSQL container
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

### Frontend Not Loading
```bash
# Rebuild frontend
docker-compose up -d --build next_frontend

# Check if Next.js compiled successfully
docker-compose logs next_frontend
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License


---




---

## 🔄 Version History

- **Current Version:** Development Phase
- **PostgreSQL:** 17.5
- **Next.js:** 15.4.6
- **React:** 19.1.0
- **FastAPI:** 0.116.1

---

## 📚 Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Proxy** | Nginx | Latest |
| **Frontend** | Next.js | 15.4.6 |
| **UI Library** | React | 19.1.0 |
| **Styling** | Tailwind CSS | 4.x |
| **Language** | TypeScript | 5.x |
| **Backend** | FastAPI | 0.116.1 |
| **Language** | Python | 3.x |
| **ORM** | SQLAlchemy | 2.0.41 |
| **Database** | PostgreSQL | 17.5 |
| **Server** | Uvicorn/Gunicorn | Latest |
| **Containerization** | Docker | Latest |

---

