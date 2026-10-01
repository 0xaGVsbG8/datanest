# DataNest
Live-demo: https://berkehut.ddns.net/datanest/drive/home/me

Self-hosted file storage: Next.js frontend, FastAPI backend, PostgreSQL, Nginx. Run it with Docker Compose. Put a TLS reverse proxy on 443 in front of port 9000 for HTTPS.

## Architecture

Only **port 9000** is published. Frontend, backend, and Postgres stay on the Docker network.

```
Browser
  │
  │  (optional) your TLS proxy :443
  │   X-Forwarded-Proto: https
  ▼
Nginx :9000  (this repo)
  ├─ /datanest/drive/*     → Next.js :9001
  ├─ /datanest/backend/*   → FastAPI :9002
  ├─ /datanest/drive       → 302 /datanest/drive/home/me
  ├─ /datanest/drive/      → 302 /datanest/drive/home/me
  └─ /datanest/            → redirector → /datanest/drive/home/me
         │
         ▼
    PostgreSQL :5432  (not published)
```

App Nginx forwards `X-Forwarded-Proto` from the 443 proxy (`$http_x_forwarded_proto`). If that header is empty (direct `http://localhost:9000`), it falls back to HTTP so session cookies still work locally.

Open **http://localhost:9000/datanest/** or **/datanest/drive** — both send you to `/datanest/drive/home/me`. Nginx uses a **relative** 302 (same host/port). Next.js also has `app/drive/page.tsx` for `/drive/`.

## Run

```bash
cd datanest
docker compose up -d --build
```

Open **http://localhost:9000/datanest/drive/auth/login**

```bash
docker compose logs -f
docker compose down
```

On a domain: terminate TLS on 443 and `proxy_pass` to `http://127.0.0.1:9000` with:

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header Host $host;
```

## Auth

Not JWT. Identity is an httponly `session_token` cookie (14 days, SameSite=lax, `Secure` when the request is HTTPS).

| Flow | What happens |
|------|----------------|
| Login | Email + password → 6-digit email code → POST `/verify_op/` → session |
| Register | Password is **bcrypt-hashed before** it is stored in `passcodes_info`. After the code, the hash is copied into `users` (not hashed twice). |
| Reset | Same passcode flow; new password is sent in the POST body, not the URL |
| Logout / reset / delete | Session row(s) revoked |

Passcodes:

- Expire after **15 minutes**
- **5** wrong guesses → row deleted, request a new code
- **10** requests / minute / IP on login, register, reset, and verify (`modules/passcodes.py`)
- Global FastAPI cap: **40 requests / 6 seconds** per client IP (`views/Request_timeouter.py`, uses `X-Real-IP` behind Nginx)

Demo login (`ALLOW_TEST_ACC_FOR_DEV_PURPOSES`): `temp@gmail.com` with any password sets cookie `test_acc`. That cookie **only** maps to the shared demo disk. It cannot open a real account. Do not put private files on that user.

Config lives in `backend_fastapi/app_self/app/app_dependencies.py` (root login, mail, CORS, demo flag). FastAPI docs are off (`docs_url=None`).

## Layout

```
datanest/
├── docker-compose.yaml
├── nginx/default.conf
├── frontend_next/app_self/     # Next.js 15, React 19, basePath /datanest
├── backend_fastapi/app_self/
│   ├── app/
│   │   ├── app_dependencies.py
│   │   ├── modules/sessions.py
│   │   ├── modules/passcodes.py
│   │   └── views/
│   └── __STORAGE_VAULT/        # files on disk (compose volume)
└── postgres_db_docker/
    ├── db_template.sql
    └── data/                   # DB volume
```

Public app path: `/datanest/drive/…`  
API prefix: `/datanest/backend/…` (Nginx strips to FastAPI `/backend/`).

## Database

Postgres user/password/db in compose: `postgres` / `postgres` / `datanestDB` (internal only).

Tables: `users`, `user_sessions`, `ITEMSINFO`, `shared_items`, `passcodes_info` (`expires_at`, `attempts`), `zipinfo`.

`users.password` is bcrypt. `user_sessions.token` is the cookie value.

## Storage

```
__STORAGE_VAULT/
├── config.json
├── ZIP_ARCS/
└── USERS/{email}/
```

## Rebuild one service

```bash
docker compose up -d --build next_frontend
docker compose up -d --build fastapi_backend
docker compose up -d --build nginx-app-proxy
```

## Notes

- Dev routes (`/dev/` in the URL) require `users.isDev`.
- Redis is in `requirements.txt` but sessions are in Postgres, not Redis.
- Do not commit real Gmail app passwords or root passwords; keep them out of git.
