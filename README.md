# Rankling Cohort Sheet

A lightweight, static D&D character sheet made specifically for one intelligent Brass commander and five dependent formation troopers.

## Included

- Editable Fighter/Rankling character information
- Automatic ability modifiers, proficiency bonus, saves and skills
- Shared Formation HP, temporary HP, short rests and long rests
- Four switchable formation stances with automatic AC/speed changes
- Five individually named and tracked troopers
- One-detached-trooper limit
- Personal HP, AC, temporary leader and order for detached troopers
- Formation and trooper attack buttons with an integrated dice roller
- Automatic browser saving
- JSON export/import
- Print layout
- Offline/PWA support
- Cloudflare Pages headers and Wrangler configuration

No account or database is required. Character data is stored in the current browser using `localStorage`.

## Run locally

The service worker requires an HTTP server rather than opening `index.html` directly.

Simple Python server:

```bash
python -m http.server 8080
```

Or with Wrangler:

```bash
npm install
npm run dev
```

## Put it on GitHub

From this folder:

```bash
git init
git add .
git commit -m "Initial Rankling cohort sheet"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/YOUR-REPOSITORY.git
git push -u origin main
```

## Recommended deployment: Cloudflare Pages Git integration

1. Open **Workers & Pages** in the Cloudflare dashboard.
2. Choose **Create application** → **Pages** → **Import an existing Git repository**.
3. Select the GitHub repository.
4. Use these settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None |
| Build command | `exit 0` or blank |
| Build output directory | `.` |
| Root directory | repository root |

Cloudflare Pages uploads the repository root as the site. Do **not** set the deploy command to `npx wrangler deploy`; that command is for Workers.

## Alternative: custom deploy command

If the Cloudflare setup screen specifically asks for a **Deploy command**, use:

```bash
npm run deploy
```

This runs:

```bash
wrangler pages deploy .
```

The direct command is also valid:

```bash
npx wrangler pages deploy .
```

Never use `npx wrangler deploy` for this Pages project.

## Main files

- `index.html` — structure
- `styles.css` — responsive visual design and print layout
- `app.js` — sheet state, calculations, troopers, stances, dice and saving
- `assets/cohort-lineup.png` — current character art
- `_headers` — Cloudflare Pages security headers
- `service-worker.js` — offline cache
- `wrangler.toml` — Pages configuration
- `package.json` — local preview and Pages deployment scripts

## Rules note

This is an interface for a developing homebrew concept, not a claim of official D&D rules. Values and feature text can be edited directly in `app.js` as the species and subclass are refined.
