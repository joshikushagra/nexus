# Client Management Platform (No Docker)

Stack:
- Node.js backend (Express)
- Next.js client portal
- Next.js admin panel
- MongoDB

## Project Structure
- `apps/api/` API and business logic
- `apps/client-portal/` user-facing portal
- `apps/admin-panel/` separate admin panel

## Local Setup
1. Install MongoDB locally and run it on `mongodb://localhost:27017`.
2. Backend:
   - `cd apps/api`
   - `npm install`
   - `npm run dev`
3. Client portal:
   - `cd apps/client-portal`
   - `npm install`
   - `npm run dev`
4. Admin panel:
   - `cd apps/admin-panel`
   - `npm install`
   - `npm run dev`

## URLs
- Backend: `http://localhost:8000/api`
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
