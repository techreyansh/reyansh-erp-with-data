# Reyansh ERP (React + Supabase)

Internal ERP-style web app: sales flow, purchase flow, CRM, inventory-related screens, and more. Frontend is **Vite + React 18**; data and auth use **Supabase** (Postgres + REST + Storage).

## Quick start

1. **Clone** this repository.
2. **Install:** `npm ci` (or `npm install`).
3. **Environment:** copy `.env.example` to `.env.local` and set at least:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Optional: `VITE_WHATSAPP_LINK`
4. **Database:** create a Supabase project and apply SQL under `supabase/migrations/` in order (or use [Supabase CLI](https://supabase.com/docs/guides/cli) `db push` against your linked project). Do not commit real keys; `.env` and `.env.local` are gitignored.
5. **Run dev:** `npm start` → [http://localhost:3000](http://localhost:3000).
6. **Production build:** `npm run build` → static files in `dist/` (deploy to Vercel, Netlify, Cloudflare Pages, etc.; configure SPA fallback to `index.html` and the same `VITE_*` vars in the host’s dashboard).

Google sign-in is handled only by Supabase OAuth redirect:
`supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`.

## Repository

- Remote for this line: [techreyansh/reyansh-erp-with-data](https://github.com/techreyansh/reyansh-erp-with-data).

---

# Getting Started with Vite

This project runs through [Vite](https://vite.dev/).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder with Vite.\
Vercel is configured to deploy this directory through `vercel.json`.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Learn More

You can learn more in the [Vite documentation](https://vite.dev/guide/).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

See [Vite build options](https://vite.dev/config/build-options.html).

### Analyzing the Bundle Size

Use Vite/Rolldown bundle analysis tooling if bundle inspection is needed.

### Making a Progressive Web App

PWA behavior is controlled by the files in `public/`.

### Advanced Configuration

Configuration lives in `vite.config.js`.

### Deployment

Vercel deployment uses `npm run build` and `dist` from `vercel.json`.

### Build troubleshooting

Run `npm run build` locally to reproduce Vercel build failures.
