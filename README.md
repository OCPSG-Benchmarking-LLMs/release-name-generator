# Release Name Generator

A lightweight React/Vite app for generating deterministic release codenames from a seed, with optional Semantic Versioning output.

The generator supports two modes:

- **Full release label**: `vMAJOR.MINOR.PATCH[-alpha.N|-beta.N|-rc.N] "Name"`
- **Codename only**: `"Name"`

This project is designed for static deployment on [GitHub Pages](https://ocpsg-benchmarking-llms.github.io/release-name-generator/) and does not require a backend.

---

## Features

- Deterministic codename generation from a seed.
- Seed can be a string or a number.
- Optional Semantic Versioning with pre-release stages.
- Stable release option without a pre-release suffix.
- Codename-only mode.
- Copy-to-clipboard output.
- Simple static deployment with Vite and GitHub Pages.

---

## Versioning policy

The generator follows this release format:

`vMAJOR.MINOR.PATCH[-alpha.N|-beta.N|-rc.N] "Name"`

- **PATCH** for small backward-compatible fixes
- **MINOR** for backward-compatible additions
- **MAJOR** for major milestones or breaking changes
- **alpha** for early development
- **beta** for broader testing
- **rc** for release candidates
- **release** for a stable version with no pre-release suffix

Example progression:

- `v0.1.0-alpha.1`
- `v0.1.0-alpha.2`
- `v0.1.0-beta.1`
- `v0.1.0-beta.2`
- `v0.1.0-beta.3`
- `v1.0.0-rc.1`
- `v1.0.0`

---

## Naming approach

The codename generator uses a simple adjective–noun pattern inspired by **Haikunator**, but it is not a direct implementation of the Haikunator package. In this project, the word lists and generation logic are custom and deterministic.

The current vocabulary includes 48 adjectives and 48 nouns, which produces 2,304 base codename combinations. Combined with the seed and sequence inputs, this allows reproducible and deterministic name generation across runs.

---

## Local development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build the production version:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Deployment and repository structure

This repository is configured for deployment to GitHub Pages using GitHub Actions.

```text
.
├─ .github/
│  └─ workflows/
│     └─ deploy.yml
├─ index.html
├─ package.json
├─ package-lock.json
├─ vite.config.js
└─ src/
   ├─ main.jsx
   └─ App.jsx
```

**Notes:**

- `node_modules/` should not be committed.
- `package-lock.json` should be committed.
- The app is fully client-side and requires no server-side component.

---

## Credits

- [OCPSG-Benchmarking-LLMs](https://ocpsg-benchmarking-llms.github.io/)
