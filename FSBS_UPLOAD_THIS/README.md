# FSBS Landing Page

A cute, hand-drawn React + Vite landing page for the FSBS Android beta waitlist.

## Tech

- React
- Vite
- Tailwind CSS
- Cloudflare Pages Functions
- Resend email API

## Local Setup

```bash
npm install
npm run dev
```

## What To Upload To GitHub

Upload the contents of this folder to GitHub:

```text
FSBS-cloudflare-ready/
  functions/
  public/
  src/
  .env.example
  .gitignore
  index.html
  package-lock.json
  package.json
  postcss.config.js
  tailwind.config.js
  README.md
```

Do not upload `node_modules`, `dist`, preview screenshots, or the old `api` folder.

## Cloudflare Pages Deploy Settings

Use these settings when connecting the GitHub repo to Cloudflare Pages:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

If you upload this folder itself into the repo instead of its contents, set `Root directory` to `FSBS-cloudflare-ready`. The simplest setup is to upload the contents directly so `package.json` is in the GitHub repo root.

## Email Setup

The waitlist form saves signups in the browser with `localStorage` and calls this Cloudflare Pages Function:

```text
/api/send-waitlist-email
```

Add these environment variables in Cloudflare Pages:

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=FSBS <waitlist@yourdomain.com>
```

Use a verified domain email for `RESEND_FROM_EMAIL`. Users can sign up with Gmail addresses, but the sender should be from your verified domain.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
