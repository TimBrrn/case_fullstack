# Data Analysis Agent — Web App

Application web qui transforme un agent d'analyse de données CLI en interface de streaming temps réel. L'utilisateur pose des questions sur ses données et voit en direct le raisonnement de l'agent, les requêtes SQL, les visualisations Plotly et les réponses.

## Stack

- **Backend** : FastAPI + SSE (Server-Sent Events)
- **Frontend** : React + TypeScript + Tailwind + shadcn/ui
- **Agent** : PydanticAI + Claude Haiku 4.5
- **Data** : DuckDB (SQL in-memory) + pandas
- **Visualisation** : Plotly

## Installation

```bash
# Configurer la clé API
cp .env.example .env
# Ajouter sa clé API Anthropic dans .env

# Ajouter des fichiers CSV dans data/

# Lancer avec Docker
docker compose up --build

# Ou lancer en local
pip install -r requirements.txt
cd frontend && npm install && cd ..

# Terminal 1 — backend
uvicorn backend.app:app --reload --reload-dir backend --reload-dir agent

# Terminal 2 — frontend
cd frontend && npm run dev
```

Backend : http://localhost:8000 | Frontend : http://localhost:5173

## Architecture

```
case_fullstack/
├── agent/
│   ├── agent.py              # Création de l'agent et enregistrement des tools
│   ├── context.py            # Contexte partagé (datasets + DataFrame courant)
│   ├── loader.py             # Chargement et sanitisation des CSV
│   ├── prompt.py             # System prompt avec info des datasets
│   └── tools/
│       ├── query_data.py     # Exécution SQL via DuckDB
│       └── visualize.py      # Génération de graphiques Plotly via exec()
├── backend/
│   ├── app.py                # Routes FastAPI et CORS
│   ├── sse.py                # Streaming SSE (events PydanticAI → events SSE)
│   └── session.py            # Historique de conversation in-memory
├── frontend/src/
│   ├── App.tsx               # Layout principal, page d'accueil, vue chat
│   ├── hooks/useSSE.ts       # Consommation SSE avec fetch + getReader
│   ├── reducer/chatReducer.ts # Gestion du state (useReducer)
│   ├── types/                # Types TypeScript (events SSE, state, actions)
│   └── components/           # Composants UI (MessageList, ChatInput, PlotlyChart...)
├── data/                     # Fichiers CSV
└── backend/tests/            # Suite pytest (24 tests)
```

## Flow de données

1. L'utilisateur envoie une question → `POST /chat`
2. FastAPI ouvre une connexion SSE et appelle `stream()`
3. PydanticAI envoie la question + system prompt + historique à Claude
4. Le LLM raisonne (balises `<thinking>`), appelle `query_data` (SQL via DuckDB), puis `visualize` (graphique Plotly)
5. `sse.py` transforme les events PydanticAI en events SSE : `thinking`, `tool_call_start`, `tool_call_result`, `text`, `done`
6. Le frontend reçoit les events via `useSSE`, les dispatch au `chatReducer`, et rend chaque composant

## Protocole SSE

| Event              | Payload          | Description               |
| ------------------ | ---------------- | ------------------------- |
| `thinking`         | `{content}`      | Raisonnement de l'agent   |
| `tool_call_start`  | `{tool, args}`   | Appel d'un tool           |
| `tool_call_result` | `{tool, result}` | Résultat du tool          |
| `text`             | `{content}`      | Réponse finale (markdown) |
| `error`            | `{message}`      | Message d'erreur          |
| `done`             | `{}`             | Fin du stream             |
