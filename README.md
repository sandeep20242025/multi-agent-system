# 🤖 MultiAgent AI System — IBM SkillBuild Hackathon

A production-ready multi-agent AI system built with **FastAPI**, **React**, and **Supabase**.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│              (Chat UI · Dashboard · Agent Monitor)           │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST / WebSocket
┌───────────────────────────▼─────────────────────────────────┐
│                     FastAPI Backend                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │Orchestrat│  │ Planner  │  │Researcher│  │ Writer   │   │
│   │or Agent  │  │  Agent   │  │  Agent   │  │  Agent   │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       Supabase                               │
│           (PostgreSQL · Auth · Realtime · Storage)           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
multiagent-ai-hackathon/
├── README.md
├── .gitignore
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── main.py                        # FastAPI entry point
│   ├── core/
│   │   ├── config.py                  # Settings & env vars
│   │   ├── supabase_client.py         # Supabase connection
│   │   └── security.py                # JWT / auth helpers
│   ├── agents/
│   │   ├── base_agent.py              # Abstract base agent
│   │   ├── orchestrator.py            # Routes tasks to agents
│   │   ├── planner_agent.py           # Breaks goal → subtasks
│   │   ├── researcher_agent.py        # Web / knowledge lookup
│   │   └── writer_agent.py            # Generates final output
│   ├── api/
│   │   ├── routes/
│   │   │   ├── agent_routes.py        # /api/agents endpoints
│   │   │   ├── session_routes.py      # /api/sessions endpoints
│   │   │   └── auth_routes.py         # /api/auth endpoints
│   │   └── websocket/
│   │       └── ws_handler.py          # Real-time agent streaming
│   ├── models/
│   │   ├── agent_models.py            # Pydantic request/response
│   │   └── session_models.py
│   ├── services/
│   │   ├── llm_service.py             # LLM provider abstraction
│   │   └── memory_service.py          # Agent memory via Supabase
│   └── tests/
│       ├── test_agents.py
│       └── test_routes.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── .env.example
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/
    │   │   ├── agentApi.js             # Agent REST calls
    │   │   └── wsClient.js             # WebSocket client
    │   ├── components/
    │   │   ├── Chat/
    │   │   │   ├── ChatWindow.jsx
    │   │   │   ├── MessageBubble.jsx
    │   │   │   └── InputBar.jsx
    │   │   ├── AgentPanel/
    │   │   │   ├── AgentCard.jsx
    │   │   │   └── AgentStatusBadge.jsx
    │   │   └── Layout/
    │   │       ├── Sidebar.jsx
    │   │       └── Header.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── ChatPage.jsx
    │   │   └── LoginPage.jsx
    │   ├── store/
    │   │   └── agentStore.js           # Zustand global state
    │   └── supabaseClient.js           # Supabase JS client
    └── public/
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional)
- Supabase project ([supabase.com](https://supabase.com))

### 1. Clone & configure environment

```bash
git clone <repo-url>
cd multiagent-ai-hackathon

# Backend env
cp backend/.env.example backend/.env
# Frontend env
cp frontend/.env.example frontend/.env
```

Fill in your **Supabase URL**, **Supabase anon key**, and **LLM API key** in both `.env` files.

### 2. Run with Docker Compose (recommended)

```bash
docker-compose up --build
```

- Frontend → http://localhost:5173  
- Backend API → http://localhost:8000  
- API Docs → http://localhost:8000/docs  

### 3. Run manually (development)

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 🤖 Agents Overview

| Agent | Role |
|-------|------|
| **Orchestrator** | Receives user goal, breaks it into a plan, delegates to agents |
| **Planner** | Generates step-by-step execution plan |
| **Researcher** | Searches knowledge base / internet for relevant info |
| **Writer** | Synthesises research into final readable response |

---

## 🗄️ Supabase Schema

Run `backend/supabase_schema.sql` in the Supabase SQL editor to create all required tables.

---

## 👥 Team

| Role | Responsibility |
|------|---------------|
| Backend (Python/FastAPI) | Agents, API, Supabase integration |
| Frontend (React) | UI, WebSocket, state management |

---

## 📄 License

MIT
