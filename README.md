# BridgeAI

**An Online‑First AI Assistant with Automatic Offline Fallback**

Built by **Team Cyber_Samurais** for WeMakeDevs FutureStack GenAI Hackathon '25

---

## Tagline

BridgeAI prioritizes fast cloud inference (Cerebras) when internet is available and *seamlessly* falls back to a local model when connectivity drops — so users never lose access to AI assistance.

---

## Badges (suggested)

* build: `![build](https://img.shields.io/badge/build-passing-brightgreen)`
* license: `![license](https://img.shields.io/badge/license-MIT-blue)`
* docker: `![docker](https://img.shields.io/badge/docker-ready-blue)`

---

## Table of contents

1. [Overview](#overview)
2. [Key features](#key-features)
3. [Architecture & Workflow](#architecture--workflow)
4. [Quick Start (Windows)](#quick-start-windows)
5. [Repo layout](#repo-layout)
6. [Environment & .env example](#environment--env-example)
7. [Docker & Deployment](#docker--deployment)
8. [MCP Gateway API contract](#mcp-gateway-api-contract)
9. [For Judges — Demo checklist](#for-judges---demo-checklist)
10. [Contributing](#contributing)
11. [Tests & Monitoring](#tests--monitoring)
12. [Security & Privacy](#security--privacy)
13. [Assets for documentation](#assets-for-documentation)
14. [License & Acknowledgements](#license--acknowledgements)

---

## Overview

BridgeAI is a hybrid assistant that offers:

* **Online-first**: uses Cerebras `llama-3.3-70b` via API for fast, high-quality responses when connected.
* **Automatic fallback**: routes requests to a local quantized LLaMA model when network is unavailable.
* **Enhancement**: offline responses are flagged and automatically reprocessed by Cerebras when connectivity returns; results are cached.

This README is the canonical GitHub entry for the project; additional documentation files live in `/docs`.

---

## Key features

* Online-first routing (Cerebras) + Local fallback (LLaMA 7B quantized)
* Dockerized microservices (frontend, backend, mcp-gateway, local-model)
* MCP Gateway: network-aware router, metadata logging, caching, enhancement queue
* Zero-manual switching for users — automatic failure detection and seamless UX
* Offline privacy mode: data stays local when desired

---



### Architecture & Workflow

#### System Flowchart

```mermaid
flowchart TD
    A[User Query] --> B[MCP Gateway]
    B -->|Online Available| C[Cerebras API]
    B -->|Offline| D[LLaMA Local Model]
    C --> E[Response & Metadata Logged]
    D --> E[Response & Metadata Logged]
    E --> F[User Receives Answer]


### Sequence (brief)

1. Frontend sends query to MCP Gateway (`POST /api/v1/query`).
2. MCP Gateway checks network & cache and routes to Cerebras or Local model.
3. Answer returned and labeled with `provider: online | offline` and stored in metadata.
4. If offline answer is partial, MCP queues it for enhancement. When online, enhancer sends to Cerebras and updates cache.

---

## Quick Start (Windows)

> These commands assume Docker Desktop is installed.

1. Copy `.env.example` to `.env` and fill values (see env section below).
2. Download pre-quantized local model with `scripts\setup.bat` (one-time ~4GB).
3. Start containers:

```powershell
# first time (builds images)
docker-compose up --build

# or to run in background
docker-compose up -d

# to stop
docker-compose down
```

4. Open `http://localhost:5173` to view the frontend.
5. Test: send a message while online (Cerebras), then disable Wi‑Fi and send another message to see local fallback.

**See `QUICKSTART.md` for a step-by-step with screenshots and troubleshooting tips.**

---

## Repo layout (recommended)

```
/ (root)
├── README.md
├── QUICKSTART.md
├── FOR_JUDGES.md
├── CONTRIBUTING.md
├── ARCHITECTURE.md
├── DEPLOYMENT.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── frontend/       # React + Vite app
├── backend/        # FastAPI app
├── mcp-gateway/    # Router + enhancement queue
├── local-model/    # llama-cpp-python wrapper / model server
├── scripts/        # setup.bat, start.bat, download_model.py
├── docs/           # supporting docs and assets
└── LICENSE
```

---

## Environment & `.env` example

Create `.env` at repo root (never commit credentials).

```
# Cerebras
CEREBRAS_API_KEY=your_cerebras_api_key_here
CEREBRAS_API_URL=https://api.cerebras.ai/v1

# Ports
FRONTEND_PORT=5173
BACKEND_PORT=8000
MCP_GATEWAY_PORT=8080

# Local model
LOCAL_MODEL_PATH=./models/llama2-7b.gguf
MODEL_CACHE_DIR=./cache

# Misc
ENABLE_ENHANCER=true
METADATA_DB_URL=sqlite:///./metadata.db   # or mongodb://...
```

**Important**: Add `models/` and `.env` to `.gitignore`.

---

## Docker & Deployment

* Each service has its own `Dockerfile`.
* `docker-compose.yml` orchestrates them and sets up healthchecks.

**Minimal `docker-compose.yml` (conceptual)**

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - mcp-gateway
  mcp-gateway:
    build: ./mcp-gateway
    ports:
      - "8080:8080"
    volumes:
      - ./cache:/app/cache
  local-model:
    build: ./local-model
    volumes:
      - ./models:/models
    environment:
      - MODEL_PATH=/models/llama2-7b.gguf
```

**Tips**

* Use `--gpus` or accelerator flags only if hardware available. For hackathon/demo, use CPU quantized model.
* Keep healthcheck endpoints on `/health` for each service so Docker Compose can auto-restart failures.

---

## MCP Gateway API contract (suggested endpoints)

```
POST /api/v1/query
Request: { session_id?, query: string, context? }
Response: { id, answer, provider: "online" | "offline", score?, timestamp }

GET /api/v1/status
Response: { online: true|false, providers: { cerebras: status, local: status } }

GET /api/v1/logs?session_id=
Response: [{ id, query, provider, timestamp, enhanced: true|false }]

POST /api/v1/enhance
Request: { id }  # manually trigger re-enhance of an offline response
```

Include schema examples in `mcp-gateway/openapi.yaml` (auto-generated by FastAPI).

---

## For Judges — Demo checklist (FOR_JUDGES.md)

**Goal**: show offline fallback + online enhancement in under 3 minutes.

1. Pre-demo: run `scripts/setup.bat` to download model and set `.env`.
2. Start app: `docker-compose up --build -d`.
3. Demo scenario:

   * Show app online: ask a complex question → highlight `provider: Cerebras` and fast result.
   * Turn off Wi‑Fi (or run `scripts/simulate_offline.bat`) → ask same question → show `provider: Local`.
   * Turn Wi‑Fi back on → open logs/notifications → show that the offline answer was enhanced and updated.
4. Show MCP logs & enhancement queue dashboard (simple UI or `curl` output).
5. Point judges to `/docs` for architecture and to `FOR_JUDGES.md` for reproducible steps.

**Judge tips included**: timeline (1 min online, 1 min offline, 1 min enhancement) and required artifacts (pre-downloaded model, valid API key).

---

## Contributing

* Branching: `feature/<short-desc>`, `fix/<short-desc>`
* PRs: small, 1 feature per PR, include screenshots or recordings if UI changes
* CI: run `pytest` for Python and `npm test` for frontend
* Issue templates + PR template included in `.github/` folder

See `CONTRIBUTING.md` for full templates and reviewer checklist.

---

## Tests & Monitoring

* Unit tests for backend and mcp-gateway (pytest)
* Integration tests: end-to-end query routing (use TestClient in FastAPI)
* Smoke test for model server (inference request)
* Health endpoints for Prometheus scrape (optional)

---

## Security & Privacy

* Never commit model files or `.env` to Git. Add them to `.gitignore`.
* Provide an offline-privacy toggle in UI: `Use offline only` (forces local provider).
* Log only metadata — avoid storing PII or raw user messages unless consented. If stored, ensure encryption at rest.

---

## Assets for documentation (what to include in `/docs/assets`)

* UI screenshots (online / offline badges)
* GIF showing online→offline→enhancement flow
* Architecture diagrams (Mermaid + PNG export)
* Sample JSON request/response logs
* `FOR_JUDGES_demo_script.md` (one-page script for presenting)
* Small demo dataset used for RAG (preload) — include source and license

---

## License & Acknowledgements

This project is released under the **MIT License**. See `LICENSE`.

Acknowledgements: Cerebras, Meta (LLaMA), Docker, FastAPI, Vite, the OSS communities used.

---

## Next steps (for repo maintainer)

1. Add `.env.example` and `.gitignore`.
2. Add `scripts/setup.*` that downloads model to `models/` and preloads demo docs.
3. Implement FastAPI backend and the MCP gateway skeleton with routes above.
4. Implement simple React frontend with network indicator and query UI.
5. Create `FOR_JUDGES.md` with exact demo script and timings.

---


