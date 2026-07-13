# Rankling Cohort Sheet v1.9 — Mega Unison

A static D&D 5e character sheet for one Rankling Brass and five bonded Troopers. It is deployable as a Cloudflare Worker with Static Assets and contains no `package.json` or lockfile.

## Mega Unison

At Fighter level 15, the sheet unlocks **Mega Unison**.

Activation requires:

- Heroic Inspiration;
- all five Troopers formed;
- the once-per-Long-Rest use to be available.

The transformation lasts for a number of rounds equal to Proficiency Bonus. The website tracks the remaining rounds and automatically applies the principal numerical effects:

- +1 AC;
- walking speed 30 feet;
- flying speed 30 feet, with a reminder that the character must end the turn on solid ground;
- +1d8 damage on melee weapon attacks;
- once-per-turn bonus damage equal to Proficiency Bonus;
- +2 additional AC while **Aegis of the Five** is active.

The sheet also adds:

- **Winged Breakthrough**, usable once during each transformation;
- **Aegis of the Five**, with an on/off control and automatic AC calculation;
- a Proficiency-Bonus round counter;
- a Next Round button that clears Aegis and reduces the duration;
- an early-end button;
- automatic suspension of Formation Stances and detached-Trooper controls;
- male and female Mega Unison artwork selected from the cohort appearance field;
- Mega Unison data in JSON and TaleSpire-oriented exports.

A Long Rest restores the once-per-rest Mega Unison use. Heroic Inspiration remains a separately tracked resource and can be awarded with its checkbox.

## Other features

- Female and male artwork for Phalanx, Shield Wall, Spearhead, Assault Rank and Escort Formation.
- Dynamic Fighter and Cohort Commander level progression.
- Command Dice, stance modifiers and detached-Trooper statistics.
- Five individually named and equipped Troopers.
- Local browser saving.
- Standard JSON import/export.
- Print / Save as PDF workflow.
- TaleSpire-oriented JSON export.

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

The Worker name must remain `rankling-cohort-sheet`.

## Updating the GitHub repository

Delete any old repository contents that are no longer present in this ZIP, then upload the extracted contents to the repository root. Do not upload only the ZIP file.

There should be no `package.json` or `package-lock.json`.
