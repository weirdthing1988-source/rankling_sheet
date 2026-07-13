# Rankling Cohort Sheet — Cloudflare Workers Static Assets

A static D&D character sheet for one Brass commander and five formation troopers.

This edition deliberately contains **no `package.json` and no lockfile**. That prevents Cloudflare Workers Builds from running `npm clean-install`, which can stall or fail with the npm error `Exit handler never called!`.

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
README.md
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

That must match the `name` in `wrangler.jsonc`.

## Important when replacing the previous repository version

Delete these two old files from GitHub rather than merely copying the new files over them:

```text
package.json
package-lock.json
```

If either file remains in the repository, Cloudflare may run `npm clean-install` again.

Commit the deletions and push them with the rest of this version.

## Local preview without installing dependencies

From the repository root:

```bash
npx --yes wrangler@4.110.0 dev
```

## Deployment test

```bash
npx --yes wrangler@4.110.0 deploy --dry-run
```

## Included features

- Editable Fighter/Rankling character details
- Automatic ability modifiers, proficiency bonus, saves and skills
- Shared Formation HP and temporary HP
- Four switchable formation stances
- Five individually tracked troopers
- One-detached-trooper limit
- Personal HP, AC, temporary leader and orders for detached troopers
- Integrated dice roller
- Automatic browser saving
- JSON export/import
- Print layout
- Offline/PWA support

Character data is stored in the current browser with `localStorage`.
