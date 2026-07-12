# Rankling Cohort Sheet — Cloudflare Workers Edition

A lightweight, static D&D character sheet made specifically for one intelligent Brass commander and five dependent formation troopers.

This edition is configured for **Cloudflare Workers Static Assets**, matching Cloudflare's Git-connected Worker deployment flow. It does not use Cloudflare Pages and does not require a Worker JavaScript entry point.

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
- Security headers
- Cloudflare Workers Static Assets configuration

No account or database is required. Character data is stored in the current browser using `localStorage`.

## Repository structure

```text
public/
  assets/
  _headers
  app.js
  index.html
  manifest.webmanifest
  service-worker.js
  styles.css
.gitignore
LICENSE
package.json
README.md
wrangler.jsonc
```

The deployable website is inside `public/`. The root-level `wrangler.jsonc` tells Cloudflare to upload that folder as Worker static assets.

## Deploy from the existing Cloudflare Worker project

Push these files to the GitHub repository connected to the Worker.

Use these Cloudflare build settings:

| Setting | Value |
|---|---|
| Root directory | repository root / blank |
| Build command | blank |
| Deploy command | `npm run deploy` |

`npm run deploy` runs:

```bash
wrangler deploy
```

The Worker name in Cloudflare must be:

```text
rankling-cohort-sheet
```

That name matches `wrangler.jsonc`. Cloudflare requires the dashboard Worker name and Wrangler `name` to match for Git-connected Workers Builds.

Do not use `wrangler pages deploy`; this repository is now a Worker Static Assets project.

## Run locally

Install dependencies:

```bash
npm install
```

Start the Cloudflare local preview:

```bash
npm run dev
```

Wrangler will print a local URL, usually `http://localhost:8787`.

## Validate without deploying

```bash
npm run check
```

This performs a Wrangler dry run and confirms that the `public/` assets and configuration are detected.

## GitHub setup

From the repository root:

```bash
git init
git add .
git commit -m "Deploy Rankling sheet with Workers Static Assets"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/YOUR-REPOSITORY.git
git push -u origin main
```

After the push, the connected Cloudflare Worker build should install Wrangler and execute `npm run deploy` automatically.

## Main files

- `public/index.html` — structure
- `public/styles.css` — responsive visual design and print layout
- `public/app.js` — sheet state, calculations, troopers, stances, dice and saving
- `public/assets/cohort-lineup.png` — current character art
- `public/_headers` — static response security headers
- `public/service-worker.js` — offline cache
- `wrangler.jsonc` — Worker name and static asset directory
- `package.json` — local preview, validation and deployment scripts

## Rules note

This is an interface for a developing homebrew concept, not official D&D rules. Values and feature text can be edited in `public/app.js` as the species and subclass are refined.
