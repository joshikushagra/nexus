# Client Management Platform (No Docker)

Stack:
- FastAPI backend
- Next.js client portal
- Next.js admin panel
- MongoDB

## Project Structure
- `backend/` API and business logic
- `apps/client-portal/` user-facing portal
- `apps/admin-panel/` separate admin panel

## Local Setup
1. Install MongoDB locally and run it on `mongodb://localhost:27017`.
2. Backend:
   - `cd backend`
   - `python -m venv .venv`
   - `.venv\Scripts\activate`
   - `pip install -r requirements.txt`
   - `copy .env.example .env`
   - `uvicorn app.main:app --reload --port 8000`
3. Client portal:
   - `cd apps/client-portal`
   - `npm install`
   - `copy .env.local.example .env.local`
   - `npm run dev`
4. Admin panel:
   - `cd apps/admin-panel`
   - `npm install`
   - `copy .env.local.example .env.local`
   - `npm run dev`

## URLs
- API docs: `http://localhost:8000/docs`
- Client portal: `http://localhost:3000`
- Admin panel: `http://localhost:3001`

## Bootstrap First Admin
Call once:
- `POST /api/v1/auth/bootstrap-admin`

Body:
```json
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "ChangeMe123!"
}
```

After first user exists, bootstrap endpoint is disabled.
