# NEXORA — Technology Blog & Insights

MERN technology blog with a public reading experience and protected Admin/Author CMS areas.

## Start locally

1. Copy `server/.env.example` to `server/.env`, set MongoDB, JWT, Cloudinary values, and a secure initial admin password. The initial admin is created once on first server start when its email does not already exist.
2. Run `npm install` in both `client` and `server`.
3. Start the API with `npm run dev` in `server`, then start the frontend with `npm run dev` in `client`.

Add the approved `nexora-logo.png` to `client/src/assets/logo/` before release. It was not included with this project brief, so no substitute logo has been created.

## Modules

- `client`: React/Vite public site, authentication screens, and role-specific CMS dashboards.
- `server`: Express REST API, JWT authorization, MongoDB models, post workflows, and Cloudinary media uploads.
