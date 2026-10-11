# Immer(s)German

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python)](https://www.python.org/)
[![Docker Compose](https://img.shields.io/badge/Docker_Compose-SRE_Stack-2496ED?style=flat&logo=docker)](https://docs.docker.com/compose/)
[![HashiCorp Vault](https://img.shields.io/badge/HashiCorp_Vault-Secrets-FFEC6E?style=flat&logo=vault)](https://www.vaultproject.io/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Metrics-E6522C?style=flat&logo=prometheus)](https://prometheus.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

An AI-driven German language immersion web platform and video aggregator. Categorizes YouTube content by CEFR difficulty levels (A1–C1), speech speed (WPM), and grammatical tags. Built with a production-grade SRE infrastructure, isolated local LLM inference via Ollama, and full compatibility with **Yomitan** and **asbplayer** for instant Anki card mining.

---

## 🌟 Key Features

- **CEFR Level Classification (A1–C1)**: Powered by local Llama 3 through Ollama, analyzing video metadata and German transcripts.
- **Speech Speed Tracking (WPM)**: Calculates Words Per Minute ($WPM = \frac{\text{Word Count}}{\text{Minutes}}$). Automatically corrects beginner levels (A1/A2) with $WPM > 140$ to intermediate (B1).
- **Interactive Subtitle Player**: Synchronized transcripts seek the embedded YouTube player on click and scroll smoothly into view.
- **Seamless Vocabulary Mining**:
  - Full DOM compatibility with **Yomitan** hover definitions (`Shift` + mouseover).
  - Built-in `.vtt` WebVTT subtitle exporter endpoint (`/api/videos/[id]/subtitles`) for **asbplayer** sentence/audio mining into **Anki**.
- **DevOps & SRE-Ready Stack**:
  - **HashiCorp Vault**: Zero hardcoded credentials in the daemon runtime — secrets are loaded in volatile memory via `hvac`.
  - **Docker Network Isolation**: Segregated bridge networks (`ollama-net`, `monitoring-net`, `public-net`). The local Ollama instance has no outbound host exposure.
  - **Traefik Gateway**: HTTPS reverse proxy with TLS termination and Basic Auth protection.
  - **Prometheus & Alertmanager**: Live metrics on queue depths, Ollama latency, and automated alerts for pipeline stalls.
- **Protected Web Admin Dashboard**:
  - Review queue for AI-classified videos (`ai_reviewed`).
  - Override difficulty levels, customize grammar tags, approve, or reject.
  - Manual instant URL/ID ingestion form.
  - Hardened with sliding-window IP rate limiting (brute-force defense) and configurable secret route obfuscation (`ADMIN_PATH`).
- **Interactive Demo Mode**: Out-of-the-box local testing without requiring an active Supabase instance.

---

## 🏗 System Architecture

```text
                                  [INTERNET]
                                      │
                                      ▼ (HTTPS :443)
┌──────────────────────────────── [Traefik Gateway] ────────────────────────────────┐
│                                     │                                             │
│            ┌────────────────────────┴────────────────────────┐                    │
│            ▼ (monitoring-net)                                ▼ (public-net)       │
│      [Grafana :3000]                                 [HashiCorp Vault]            │
│            │                                                 ▲                    │
│            ▼                                                 │ (hvac API)         │
│      [Prometheus] ◄────────(monitoring-net)────────────┐     │                    │
│            │                                           │     │                    │
│            ▼                                           ▼     │                    │
│     [Alertmanager]                              [ETL Daemon] ┼──(ollama-net)────┐ │
│                                                        │                        │ │
│                                                        └─────────────────► [Ollama]│
└───────────────────────────────────────────────────────────────────────────────────┘
                                      │
                       (Writes: parsed / ai_reviewed / published)
                                      ▼
                                [Supabase DB]
                                      ▲
                                      │ (Reads: published videos)
                         ┌────────────┴────────────┐
                         │   Next.js 15 Web App    │
                         │  (Vercel or Localhost)  │
                         └─────────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS v4, Geist Fonts, Jose (JWT) |
| **Backend & ETL** | Python 3.11, FastAPI, Uvicorn, yt-dlp, youtube-transcript-api, feedparser |
| **Database** | Supabase (PostgreSQL with JSONB subtitles & GIN tag indexing) |
| **Local AI Inference** | Ollama (`llama3:8b-instruct`), CPU/NVIDIA GPU runtime |
| **Secrets Engine** | HashiCorp Vault (KV v2) |
| **Observability** | Prometheus, Prometheus Client, Alertmanager, Grafana, Traefik v3 |

---

## 📁 Repository Structure

```text
immersgerman/
├── Makefile                       # Developer and SRE CLI automation
├── .env.example                   # Environment variable template for Next.js
├── database/
│   └── schema.sql                 # PostgreSQL DDL for Supabase (channels, videos)
├── backend_etl/
│   ├── Dockerfile                 # Python 3.11 slim image for ETL daemon
│   ├── docker-compose.yml         # Traefik, Vault, Daemon, Ollama, Prometheus, Grafana
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # ETL daemon environment template
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # FastAPI daemon entrypoint, Vault loader, Prometheus metrics
│   │   └── etl.py                 # Core scraper, WPM logic, Ollama prompts, Supabase updater
│   ├── prometheus/
│   │   ├── prometheus.yml         # Scraper configs
│   │   ├── alertrules.yml         # Alerting thresholds (Ollama down, queue backup)
│   │   └── alertmanager.yml       # Alert notification routing
│   ├── scripts/
│   │   └── bootstrap-vault.sh     # Vault initialization & secret template provisioning
│   └── tests/
│       ├── __init__.py
│       └── test_etl.py            # Unit test suite for WPM calculations
└── src/
    ├── middleware.js              # Edge JWT authentication, path rewriting & rate-limiting
    ├── lib/
    │   ├── auth.js                # Jose JWT signing and verification
    │   ├── supabase.js            # Safe Supabase client initialization
    │   └── mockData.js            # Demo dataset for database-free UI testing
    └── app/
        ├── layout.js              # Root layout & typography
        ├── globals.css            # Tailwind v4 theme, obsidian colors & glassmorphism
        ├── page.js                # Public video catalog, live search, and pill filters
        ├── wiki/page.js           # Comprehensive Yomitan, Anki, and asbplayer guides
        ├── videos/[id]/page.js    # Watch page with interactive transcript & VTT exporter
        ├── admin/
        │   ├── page.js            # Video moderation review workspace
        │   └── login/page.js      # Minimalist secure admin authentication screen
        └── api/
            ├── admin/login/       # Rate-limited authentication API
            ├── admin/videos/      # Approval, level override, and deletion endpoints
            ├── admin/import/      # Instant YouTube URL ingestion endpoint
            └── videos/[id]/subtitles/ # Dynamic WebVTT exporter for asbplayer
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+) and `npm`
- [Docker](https://www.docker.com/) & Docker Compose
- Free [Supabase](https://supabase.com/) Account (or local PostgreSQL)

### 2. Database Provisioning
1. Open your Supabase Dashboard and navigate to the **SQL Editor**.
2. Run the SQL script from [`database/schema.sql`](./database/schema.sql).
3. Copy your **Project URL**, **Anon Public Key**, and **Service Role Key** from *Project Settings ➔ API*.

### 3. Local SRE Stack & Vault Setup
1. Launch the containerized services:
   ```bash
   make up
   ```
2. Initialize Vault secrets:
   ```bash
   make bootstrap-vault
   ```
3. Open `http://localhost:8200` in your browser (Sign in using Token: `root`).
4. Update the secrets at `secret/data/immersion-german`:
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_KEY`: Your Supabase Service Role Key
   - `ADMIN_PASSWORD`: Your secret admin dashboard password
   - `OLLAMA_MODEL`: `llama3:8b-instruct-q4_K_M` (or model of choice)
5. Restart the daemon to apply configuration:
   ```bash
   docker restart etl_daemon
   ```

### 4. Run Frontend Web App
1. Create a `.env.local` file from the template:
   ```bash
   cp .env.example .env.local
   ```
2. Populate the keys inside `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_PASSWORD=your-secure-admin-password
   ADMIN_PATH=/admin
   ```
3. Start the Next.js development server:
   ```bash
   make dev
   ```
4. Access the application:
   - **Public Catalog**: [http://localhost:3000](http://localhost:3000)
   - **Wiki Guide**: [http://localhost:3000/wiki](http://localhost:3000/wiki)
   - **Admin Moderation**: [http://localhost:3000/admin](http://localhost:3000/admin)

> [!NOTE]
> If you start the app without setting up `.env.local`, the site will automatically enter **Demo Mode**, displaying mock videos and features without crashing!

---

## 📖 Sentence Mining Guide (Yomitan + asbplayer + Anki)

Detailed visual instructions are available on the web application at [`/wiki`](http://localhost:3000/wiki):

1. **Install Yomitan**: Add the extension to your browser and import German dictionaries (such as Dict.cc or Wiktionary).
2. **Enable AnkiConnect**: Install the AnkiConnect add-on in desktop Anki (`2055492159`).
3. **Hover & Mine**: Hold `Shift` over words in the video transcript to pop up definitions. Click `+` to add cards directly to Anki.
4. **Synchronized Audio & Screenshots**: Click **Get Subtitles (VTT)** on any video watch page, drag the `.vtt` file onto your **asbplayer** extension, and use hotkeys (e.g., `Ctrl + Win + E`) to mine cards with audio snippets and screenshots!

---

## 📊 Observability & Metrics

The ETL Python daemon exposes Prometheus metrics on port `8000/metrics`:

- `etl_queue_depth{status="parsed|ai_reviewed|published"}`: Current backlog depth.
- `ollama_request_duration_seconds`: Histogram of LLM execution latency.
- `etl_processed_videos_total{status="success|error|skipped"}`: Counter of processed content.

Prometheus and Grafana are accessible locally:
- **Prometheus UI**: `http://localhost:9090`
- **Grafana Dashboards**: `https://localhost/grafana` (Secured via Traefik HTTPS)

---

## 🛠 Makefile Commands

```bash
make help             # Display all available commands
make up               # Start Docker Compose SRE stack (Ollama, Vault, Prometheus, etc.)
make down             # Stop Docker Compose stack and remove volumes
make logs             # Stream ETL daemon JSON logs
make bootstrap-vault  # Seed Vault KV engine with template secrets
make dev              # Run Next.js local development server
make build            # Build Next.js production bundle
make test             # Run Python unit tests
```

---

## 🔒 Security Practices

- **Vault-Secured Secrets**: Runtime secrets are held in memory; no environment credentials written to container filesystems.
- **Network Hardening**: Ollama container has zero public ports; only accessible from inside the private `ollama-net`.
- **Brute-Force Protection**: Admin login endpoint restricts attempts using a sliding-window in-memory IP rate limiter (maximum 5 failed attempts per 15 minutes).
- **HTTP-Only Cookies**: Admin authorization state is encrypted in standard JWTs within `httpOnly`, `sameSite=strict` cookies.

---

## 📄 License

MIT License. Crafted for language immersion enthusiasts and SREs.
