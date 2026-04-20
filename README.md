# Enterprise Fleet Management System

A full-stack haulage truck management system built with **Django REST Framework** (backend) and **React + TypeScript + Tailwind CSS** (frontend). Blue and white enterprise UI with a particle.js landing page, DataTable-style grids with CSV export, JWT authentication, and full CRUD for trucks, drivers, and delivery jobs.

---

## Folder Structure

```
haulage/
│
├── docker-compose.yml                  # Orchestrates Postgres + backend + frontend
│
├── backend/                            # Django project
│   ├── Dockerfile
│   ├── manage.py
│   ├── requirements.txt
│   ├── haulage.log                     # Auto-generated at runtime
│   │
│   ├── haulage_project/                # Django project package
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py                 # JWT, CORS, SQLite/Postgres toggle, logging
│   │   ├── urls.py                     # Root URL conf + Swagger docs
│   │   └── wsgi.py
│   │
│   └── fleet/                          # Main Django app
│       ├── __init__.py
│       ├── admin.py                    # Django admin registrations
│       ├── apps.py
│       ├── models.py                   # Truck, Driver, Job (UUID PKs)
│       ├── pagination.py               # StandardPagination (split to avoid circular import)
│       ├── serializers.py              # DRF serializers
│       ├── urls.py                     # Router + /auth/login/ /auth/register/
│       ├── views.py                    # All ViewSets + Auth views
│       │
│       ├── migrations/
│       │   ├── __init__.py
│       │   └── 0001_initial.py
│       │
│       └── management/
│           ├── __init__.py
│           └── commands/
│               ├── __init__.py
│               └── seed_data.py        # ← Local dev data seeder
│
└── frontend/                           # React + TypeScript + Vite
    ├── Dockerfile
    ├── index.html                      # DM Sans font loaded here
    ├── nginx.conf                      # SPA routing + /api/ proxy
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js              # Blue/white dash colour tokens
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    │
    └── src/
        ├── main.tsx
        ├── App.tsx                     # Router, Sidebar, Header, ProtectedRoute
        ├── index.css                   # DM Sans import, Tailwind, CSS vars
        │
        ├── contexts/
        │   └── AuthContext.tsx         # JWT decode, expiry check, login/logout
        │
        ├── lib/
        │   ├── api.ts                  # Typed fetch client for all endpoints
        │   └── utils.ts                # cn() helper
        │
        ├── components/
        │   ├── ConfirmationModal.tsx   # Reusable delete/confirm dialog
        │   └── Pagination.tsx          # Sliding-window page controls
        │
        └── pages/
            ├── Landing.tsx             # Particle canvas, hero, features, CTA
            ├── Login.tsx               # Split-panel + particles
            ├── Register.tsx            # Matching split-panel design
            ├── Dashboard.tsx           # KPI cards + animated bar charts
            ├── Trucks.tsx              # DataTable — sort, filter, CSV export
            ├── Drivers.tsx             # DataTable — sort, search, CSV export
            └── Jobs.tsx                # DataTable — status chips, dispatch actions
```

---

## Quick Start — Local Dev (SQLite, no Docker)

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed demo data  ← creates admin user + 7 trucks + 6 drivers + 5 jobs
python manage.py seed_data

# Start dev server
python manage.py runserver
# API running at http://localhost:8000/api/
```

**Seed command options:**
```bash
python manage.py seed_data           # Safe: skips existing records (idempotent)
python manage.py seed_data --flush   # Wipe all fleet data first, then re-seed
```

**Demo credentials after seeding:**
| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create local env file
echo "VITE_API_URL=http://localhost:8000/api" > .env.local

# Start dev server
npm run dev
# App running at http://localhost:5173/
```

---

## Quick Start — Docker (PostgreSQL)

```bash
# Copy and edit env file
cp .env.example .env

# Build and run all services
docker-compose up --build

# In a separate terminal, seed the database
docker-compose exec backend python manage.py seed_data
```

| Service  | URL                            |
|----------|--------------------------------|
| Frontend | http://localhost:3000          |
| Backend  | http://localhost:8000          |
| API Docs | http://localhost:8000/api/docs |
| Admin    | http://localhost:8000/admin    |

---

## Environment Variables

### `.env` (project root — used by Docker)

```env
SECRET_KEY=your-very-long-secret-key-change-in-production
DEBUG=False
USE_POSTGRES=True
DB_NAME=haulage_db
DB_USER=haulage_user
DB_PASSWORD=haulage_pass
DB_HOST=db
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### `frontend/.env.local` (local dev only)

```env
VITE_API_URL=http://localhost:8000/api
```

> In Docker, the nginx proxy rewrites `/api/` → `http://backend:8000` so no env var is needed for production.

---

## Database Toggle

The backend supports **SQLite** (dev) and **PostgreSQL** (production) via a single env var:

```python
# backend/haulage_project/settings.py
USE_POSTGRES = os.environ.get('USE_POSTGRES', 'False') == 'True'
```

| Mode         | `USE_POSTGRES` | Storage             |
|--------------|---------------|---------------------|
| Local dev    | `False` (default) | `backend/db.sqlite3` |
| Docker / Prod | `True`        | PostgreSQL container |

---

## API Endpoints

All endpoints require `Authorization: Bearer <token>` except auth routes.

```
POST   /api/auth/register/          Register a new dispatcher
POST   /api/auth/login/             Get JWT token

GET    /api/trucks/                 List trucks (paginated, ?search=, ?status=)
POST   /api/trucks/                 Create truck
GET    /api/trucks/{id}/            Get truck
PATCH  /api/trucks/{id}/            Update truck
DELETE /api/trucks/{id}/            Delete truck

GET    /api/drivers/                List drivers (paginated, ?search=)
POST   /api/drivers/                Create driver
GET    /api/drivers/{id}/           Get driver
PATCH  /api/drivers/{id}/           Update driver
DELETE /api/drivers/{id}/           Delete driver

GET    /api/jobs/                   List jobs (paginated, ?search=, ?status=)
POST   /api/jobs/                   Create job (enforces business rules)
GET    /api/jobs/{id}/              Get job
PATCH  /api/jobs/{id}/              Update job
DELETE /api/jobs/{id}/              Delete job
PATCH  /api/jobs/{id}/status/       Advance job status (updates truck availability)
GET    /api/jobs/stats/             Dashboard KPI counts

GET    /api/docs/                   Swagger UI
GET    /api/redoc/                  ReDoc
GET    /api/schema/                 OpenAPI schema (JSON)
GET    /admin/                      Django admin
```

---

## Business Rules

- A truck can only be assigned if its status is `Available`
- A driver can only have one active job (`Pending` or `In Transit`) at a time
- Setting a job to `In Transit` automatically sets the truck to `In Transit`
- Setting a job to `Completed` automatically sets the truck back to `Available`
- Deleting a truck or driver with active jobs is blocked with a `409 Conflict`

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS, Motion |
| UI Icons  | Lucide React                                    |
| Font      | DM Sans (Google Fonts)                          |
| Backend   | Django 5, Django REST Framework                 |
| Auth      | JWT via `djangorestframework-simplejwt`         |
| Database  | SQLite (dev) / PostgreSQL (prod)                |
| API Docs  | drf-spectacular (Swagger + ReDoc)               |
| Container | Docker + Docker Compose + Nginx                 |
