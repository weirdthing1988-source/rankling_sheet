# Rankling Cohort Sheet v1.2 — Cloudflare Workers Static Assets

A static D&D character sheet for one Brass commander and five formation troopers.

This edition contains **no `package.json` and no lockfile**. That prevents Cloudflare Workers Builds from running `npm clean-install`, which previously stalled with the npm error `Exit handler never called!`.

## What changed in v1.2

- Added a dedicated **Features** tab.
- Moved Cohort Bond/species benefits off the Overview tab.
- Added a dynamic Fighter progression panel and level-derived combat summary.
- Added a compact five-trooper row to Overview.
- Each formed trooper now displays one of the shared Formation HP chunks; the Brass retains the sixth chunk.
- Level and Constitution can automatically update maximum HP using Fighter average HP.
- Level automatically updates proficiency bonus, Hit Dice, attacks per Attack action, Formation save DC, superiority dice, and detached-trooper HP/AC.
- Added an automatic-level-stat toggle and a Bonus Maximum HP field for feats or campaign bonuses.
- Existing browser saves remain compatible.

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
LICENSE
README.md
UPLOAD_CHECKLIST.txt
wrangler.jsonc
```

## Cloudflare build settings

Use the repository root as the root directory.

| Setting | Value |
|---|---|
| Build command | Leave blank |
| Deploy command | `npx --yes wrangler@4.110.0 deploy` |
| Root directory | Leave blank / repository root |

Under **Build variables and secrets**, add:

```text
SKIP_DEPENDENCY_INSTALL=true
```

The project also works without that variable because it contains no package manifest, but the variable prevents Cloudflare from attempting an automatic install if its detection changes.

The Worker name in Cloudflare must be:

```text
rankling-cohort-sheet
```

That must match the `name` in `wrangler.jsonc`. The configuration also enables the public `workers.dev` route.

## Replacing an older repository version

Delete these old files from GitHub if they still exist:

```text
package.json
package-lock.json
```

Then upload the extracted contents of this ZIP to the repository root and commit the changes.

## Local preview

```bash
npx --yes wrangler@4.110.0 dev
```

## Deployment test

```bash
npx --yes wrangler@4.110.0 deploy --dry-run
```

## Main features

- Editable Fighter/Rankling character details
- Automatic ability modifiers, proficiency bonus, saves and skills
- Level-derived Fighter HP, Hit Dice, attacks and Battle Master summary
- Shared Formation HP divided into six visible vitality chunks
- Compact Overview cards for all five troopers
- Four switchable formation stances
- Five individually tracked troopers
- One-detached-trooper limit
- Personal HP, AC, temporary leader and orders for detached troopers
- Dedicated species/class/custom Features tab
- Integrated dice roller
- Automatic browser saving
- JSON export/import
- Print layout
- Offline/PWA support

Character data is stored in the current browser with `localStorage`.
