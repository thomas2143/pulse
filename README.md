# Pulse — Implementation Health Tracker

**Pulse** tracks the full life of a SaaS implementation — from the first stakeholder meeting to post go-live — in one place. Every phase, every decision, every risk, every client site, tracked and scored.

🔗 [github.com/thomas2143/pulse](https://github.com/thomas2143/pulse)

---

## What Pulse does

- **Multi-project, multi-site tracking** — manage several client implementations at once, each with its own sites/locations, stakeholders, and progress.
- **Phase timeline** — Discovery → Configuration → Integration → UAT → Go-live → Post go-live, visualized per project and per site.
- **Health score** — a composite score (alignment, confidence, adoption, timeline) that reflects the real state of a project at a glance.
- **Project journal & milestones** — log entries, milestones, risk flags, and post-call notes, all timestamped and attached to the right project/site.
- **AI debrief** — one click to generate a structured brief (situation, risks, next actions, opening line for your next call) from the full project history, powered by Groq.
- **Auth** — email/password authentication via Supabase, with per-user data isolation.

## Tech stack

| Layer          | Technology                                   |
|----------------|-----------------------------------------------|
| Frontend       | Static HTML/CSS/JS (no framework/build step) |
| Backend        | Serverless functions (Vercel)                |
| Database/Auth  | [Supabase](https://supabase.com) (Postgres + Auth REST API) |
| AI generation  | [Groq API](https://groq.com) (`llama3-8b-8192`) |
| Fonts/Icons    | Google Fonts (Inter, Unbounded, DM Mono), Tabler Icons |

## Project structure

```
pulse/
├── index.html          # Landing page
├── login.html          # Sign in / sign up page
├── app.html            # Main application (dashboard, timelines, projects)
├── api/
│   ├── auth.js         # Login / signup / logout → proxies Supabase Auth
│   ├── projects.js     # CRUD for projects
│   ├── sites.js        # CRUD for client sites
│   ├── milestones.js   # Create/delete milestones
│   ├── log.js          # Create/delete journal log entries
│   └── ai.js           # Generates AI debriefs via Groq
└── README.md
```

## Getting started

### Prerequisites

- A [Supabase](https://supabase.com) project (Postgres database + Auth enabled)
- A [Groq](https://console.groq.com) API key
- [Vercel CLI](https://vercel.com/docs/cli) (or any platform that supports serverless functions with the same handler signature)

### Environment variables

Create the following environment variables on your deployment platform (e.g. in the Vercel dashboard, or a `.env.local` file for local development):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=your-groq-api-key
```

> Note: `login.html` and `app.html` currently reference the Supabase URL/anon key directly on the client side for auth calls. This is expected for Supabase's public anon key (it's designed to be exposed and is safe as long as Row Level Security is properly configured on your tables), but make sure RLS policies are in place before going to production.

### Database

Set up the following tables in Supabase (with RLS policies scoping rows to the authenticated user):

- `projects`
- `sites`
- `milestones`
- `log_entries`
- `note_sessions`

The `projects.js` endpoint expects these to be related via foreign keys so it can fetch a project along with its `sites`, `log_entries`, `milestones`, and `note_sessions` in a single request.

### Run locally

```bash
git clone https://github.com/thomas2143/pulse.git
cd pulse
vercel dev
```

Then open `http://localhost:3000` (or wherever `index.html` is served) in your browser.

### Deploy

```bash
vercel --prod
```

Make sure the environment variables above are configured in your Vercel project settings.

## API overview

All endpoints live under `/api` and are implemented as Vercel serverless functions. Authenticated requests should include:

```
Authorization: Bearer <supabase_access_token>
```

| Endpoint             | Methods                  | Description                          |
|----------------------|---------------------------|---------------------------------------|
| `/api/auth`          | `POST`                   | `action`: `login`, `signup`, `logout` |
| `/api/projects`      | `GET`, `POST`, `PATCH`, `DELETE` | Manage projects                |
| `/api/sites`         | `POST`, `PATCH`, `DELETE` | Manage client sites                  |
| `/api/milestones`    | `POST`, `DELETE`         | Manage milestones                    |
| `/api/log`           | `POST`, `DELETE`         | Manage journal entries               |
| `/api/ai`            | `POST`                   | `{ prompt }` → returns Groq completion for AI debrief generation |

## Usage

1. Open the app and create an account (or sign in) from the auth modal / `login.html`.
2. Create a project, add client sites, and log activity as your implementation progresses.
3. Track the health score and phase timeline as the project moves through its stages.
4. Use the **AI debrief** feature before client calls to get a quick, structured summary of where things stand.

## License

_Add your license of choice here (e.g. MIT)._

## Contributing

_Add contribution guidelines here if the project is open to external contributions._
