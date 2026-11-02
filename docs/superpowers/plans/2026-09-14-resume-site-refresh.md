# Resume Site Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `parallel-subagent-development` (this user's lane-aware replacement for superpowers:subagent-driven-development) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Layer the August 2026 resume document onto the site's existing, more detailed content, move the site to a supported Next.js with one UI library, and leave it with working lint, tests and CI.

**Architecture:** Content lives in five JSON files under `content/`. Each resume section is a props-only React component under `components/resume/`; `pages/index.jsx` imports the JSON and composes the sections; `pages/portfolio/[slug].jsx` statically generates one page per project. Bootstrap 5.3 (react-bootstrap) is the only UI library, dark-themed via `data-bs-theme`, with Cormorant SC headings from `next/font/google`.

**Tech Stack:** Next.js 16.3.5 (Pages Router), React 19.3.0, react-bootstrap 2.10.10, bootstrap 5.3, react-icons 5.7.0, ESLint 9 flat config via eslint-config-next, Jest 29 via `next/jest` with React Testing Library 16, GitHub Actions, LibreOffice + Poppler for the PDF, ImageMagick for images.

**Spec:** `docs/superpowers/specs/2026-09-14-resume-site-refresh-spec.md` — read it first. Section 3 holds the resume text every content file copies verbatim; section 4 holds the decisions; section 7 the acceptance criteria.

## Global Constraints

- Node `>= 20.9.0` (Next 16 floor). This machine runs Node 24.0.1 via nvm.
- Package manager: **npm only**. Never run `pnpm` or `yarn` in this repo (a stray `~/package.json` with `packageManager: yarn` breaks pnpm here).
- Versions to install in Task 2 and never downgrade: `next@16.3.5 react@19.3.0 react-dom@19.3.0 react-bootstrap@2.10.10 react-icons@5.7.0 bootstrap@^5.3.3`; dev: `eslint@^9 eslint-config-next@16.3.5 jest@^29 jest-environment-jsdom@^29 @testing-library/react@^16 @testing-library/dom@^10 @testing-library/jest-dom@^6`.
- No `@mui/*` or `@emotion/*` import anywhere after Task 2. No `app/` directory.
- Content strings come from spec §3.1 (the resume) and §3.2 (carried-forward site data) **verbatim**, including the curly apostrophes in `Dunkin’ Donuts` and `team’s`, the em dashes inside the summary and highlight 4, and the lowercase `i` and typos inside the first-person notes. Never paraphrase or tidy. Never carry over any string listed in spec §3.3.
- The string `561-629-3906` never appears in any file in the repo or in `public/David_Daniel_Resume.pdf`.
- Components receive data through props. Only files under `pages/` import `content/*.json` (plus `tests/content/content.test.js` and `tests/components/iconMap.test.js`, which validate the content).
- Section ids and h2 text: `skills` "Skills", `experience` "Experience", `projects` "Projects", `education` "Education", `contact` "Contact". Every `<section>` has `aria-labelledby` pointing at its `<h2>`. Exactly one `<h1>` per page.
- Every external link has `target="_blank" rel="noopener noreferrer"`. Every icon-only link has `aria-label`.
- Date ranges render with an en dash and spaces: `2022 – Present`.
- From Task 2 onward, `npm run lint && npm test && npm run build` must pass before every commit.
- Git: branch `site-refresh` off `main`, created in Task 1. Additive commits only. No `--amend`, no `rebase`, no `reset` that drops commits, no force push. **Do not push**; the user pushes and merges.
- Stage explicit paths with `git add <path>`; never `git add -A` or `git add .`.
- TDD for every component and function: write the failing test, run it and see it fail, implement, run it and see it pass, then commit. Config files (`jest.config.js`, `eslint.config.mjs`, `next.config.js`, `_app.js`, `_document.js`, `SiteHead.jsx`, `ci.yml`) are exempt; they are verified by running the tool they configure.
- Variable names are self-describing: no `i`/`n`/`j` in callbacks (a plain `for` index is the only exception).

## Lanes

This plan is partitioned for `parallel-subagent-development`. Tasks 1–3 and 10–11 are **barriers**: tree-wide changes that run alone, in order, on `site-refresh`. Tasks 4–9 are **six independent lanes** that run in parallel after Task 3 is committed, each in its own worktree and branch, and merge back with merge commits (never rebase) before Task 10 starts.

| Lane | Task | Branch | Exclusive file claims |
|---|---|---|---|
| skills | 4 | `site-refresh/skills` | `components/resume/SkillsSection.jsx`, `tests/components/SkillsSection.test.jsx` |
| pdf | 5 | `site-refresh/pdf` | `public/David_Daniel_Resume.pdf` |
| hero | 6 | `site-refresh/hero` | `components/resume/HeroSection.jsx`, `tests/components/HeroSection.test.jsx`, `public/images/headshot.jpg` |
| experience | 7 | `site-refresh/experience` | `components/resume/ExperienceSection.jsx`, `tests/components/ExperienceSection.test.jsx` |
| education | 8 | `site-refresh/education` | `components/resume/EducationSection.jsx`, `tests/components/EducationSection.test.jsx`, `public/images/aa_grad_photo.jpg`, `public/images/hs_grad_photo.jpg`, the four deletions listed in Task 8, and the two-line education edit in `pages/resume/index.jsx` |
| projects | 9 | `site-refresh/projects` | `components/resume/ProjectsSection.jsx`, `components/SiteHead.jsx`, `pages/portfolio/[slug].jsx`, `tests/components/ProjectsSection.test.jsx`, `tests/pages/projectPage.test.jsx`, `next.config.js`, deletion of the three static portfolio pages |

Rules that keep the lanes conflict-free:

- No lane touches `package.json`, `package-lock.json`, `pages/_app.js`, `pages/_document.js`, `pages/index.jsx`, `styles/*.css`, `jest.config.js`, `eslint.config.mjs` or any file another lane claims. Only the education lane touches `pages/resume/index.jsx`, and only the two lines Task 8 names.
- Lanes **add** new components beside the old ones. They do not unwire, rename or delete the old components, data files or images that the legacy `pages/resume/index.jsx` still imports, so every lane's `npm run build` stays green. Task 10 wires the new sections into the new `pages/index.jsx`, deletes the legacy page, and removes every superseded file in one pass.
- Lane setup (orchestrator): `git worktree add ../resume-app-<lane> -b site-refresh/<lane> site-refresh`, then `npm ci` inside the worktree because worktrees have no `node_modules`.
- Every lane runs `npm run lint && npm test && npm run build` in its worktree before committing, like every other task.
- Lane finish (orchestrator), from the main checkout on `site-refresh`: `git merge --no-ff site-refresh/<lane> -m "Merge lane <lane>"`, then `git worktree remove ../resume-app-<lane>`. Merge order does not matter because the claims do not overlap. After the sixth merge, run `npm ci && npm run lint && npm test && npm run build` on `site-refresh` before starting Task 10.
- If a lane finds it must touch a file outside its claims, it stops and reports instead of editing it.

---

### Task 1: Branch and repo hygiene

Delete every dead file the assessment found, fix `package.json` metadata, and move the repo to npm only. No behavior change; the build must still pass on Next 12.

**Files:**
- Delete: `components/Layout.jsx`, `components/Navbar/Navbar.jsx`, `pages/api/hello.js`, `pages/portfolio/menu-trainer.jsx`, `_config.yml`, `pnpm-lock.yaml`, `public/vercel.svg`, `public/images/coming-soon.jpg`, `public/images/hs_grad_photo1.jpeg`, `public/images/hangman-title-screenshot.png`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: branch `site-refresh`; an npm-shaped `node_modules`; `package.json` with name `resume-app`, `engines.node`, and no deploy scripts.

- [ ] **Step 1: Create the branch**

```bash
cd /home/daviddaniel/david-codez/resume-app
git status --porcelain   # expected: only the two docs/superpowers files, which are committed in this step too
git checkout -b site-refresh
git add docs/superpowers
git commit -m "Add resume site refresh spec and plan"
```

- [ ] **Step 2: Remove dead files**

```bash
git rm components/Layout.jsx components/Navbar/Navbar.jsx pages/api/hello.js pages/portfolio/menu-trainer.jsx _config.yml pnpm-lock.yaml public/vercel.svg public/images/coming-soon.jpg public/images/hs_grad_photo1.jpeg public/images/hangman-title-screenshot.png
```

Expected: ten `rm '...'` lines. `components/Navbar/` and `pages/api/` directories disappear because they are now empty.

- [ ] **Step 3: Replace `package.json`**

Write this exact content (versions are still the current ones; Task 2 changes them):

```json
{
  "name": "resume-app",
  "version": "1.0.0",
  "private": true,
  "description": "David Daniel's resume site",
  "engines": {
    "node": ">=20.9.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest --ci",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "@emotion/react": "^11.11.4",
    "@emotion/styled": "^11.11.5",
    "@mui/icons-material": "^5.15.15",
    "@mui/material": "^5.15.15",
    "@testing-library/react": "^13.4.0",
    "bootstrap": "^5.3.3",
    "next": "12.2.2",
    "react": "18.2.0",
    "react-bootstrap": "^2.10.2",
    "react-dom": "18.2.0",
    "react-icons": "^4.12.0"
  },
  "devDependencies": {
    "eslint": "8.19.0",
    "eslint-config-next": "12.2.2",
    "jest": "^28.1.3"
  }
}
```

Removed: `homepage` (pointed at an abandoned GitHub Pages deploy), `predeploy`/`deploy` scripts and the `gh-pages` dependency (`-d build` names a folder Next never produces), the watch-mode `test` script.

- [ ] **Step 4: Reinstall with npm so `node_modules` matches the remaining lockfile**

```bash
rm -rf node_modules
npm install
test -d node_modules/.pnpm && echo "STILL PNPM SHAPED" || echo "npm-shaped node_modules"
```

Expected: `npm-shaped node_modules`. `package-lock.json` will change (gh-pages removed); that is expected.

- [ ] **Step 5: Verify the build still passes**

```bash
npm run build 2>&1 | tail -25
```

Expected: `Compiled successfully`, route table lists `/`, `/404`, `/portfolio/hangman`, `/portfolio/pokedex`, `/portfolio/to-do-list`, `/resume`. No `/api/hello`, no `/portfolio/menu-trainer`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "Remove dead files, gh-pages deploy script and pnpm lockfile"
git show --stat HEAD | head -30
```

Expected: 12 files changed (10 deletions, package.json, package-lock.json) and no unexpected paths.

---

### Task 2: Framework upgrade, Bootstrap-only, lint and test harness

Move to Next 16 / React 19, remove MUI, put Bootstrap in `_app`, fix `_document` and `next.config.js`, migrate `<Link>` usage, and install a working ESLint 9 and Jest harness with one smoke test. The site must look the same as before this task, minus MUI tooltips.

**Files:**
- Modify: `package.json`, `pages/_app.js`, `pages/_document.js`, `pages/resume/index.jsx`, `pages/index.jsx`, `pages/portfolio/hangman.jsx`, `pages/portfolio/pokedex.jsx`, `pages/portfolio/to-do-list.jsx`, `components/FrameworkIcons.jsx`, `components/resume/AboutMeSection.jsx`, `components/resume/EducationSection.jsx`, `components/resume/JobAccordion.jsx`, `components/resume/JobHistorySection.jsx`, `components/resume/PortfolioSection.jsx`, `components/resume/SocialSection.jsx`, `next.config.js`
- Create: `eslint.config.mjs`, `jest.config.js`, `jest.setup.js`, `tests/smoke/home.test.jsx`
- Delete: `.eslintrc.json`, `tests/app.test.js`

**Interfaces:**
- Consumes: Task 1's branch and npm install.
- Produces: `npm run lint` (ESLint 9), `npm test` (Jest 29 + RTL 16, `testMatch` = `tests/**/*.test.{js,jsx}`), `npm run build` on Next 16. `<html lang="en" data-bs-theme="dark">`. Bootstrap CSS global. Every later task builds on this toolchain.

- [ ] **Step 1: Swap dependencies**

```bash
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled @testing-library/react jest eslint eslint-config-next
npm install next@16.3.5 react@19.3.0 react-dom@19.3.0 react-bootstrap@2.10.10 react-icons@5.7.0 bootstrap@^5.3.3
npm install -D eslint@^9 eslint-config-next@16.3.5 jest@^29 jest-environment-jsdom@^29 @testing-library/react@^16 @testing-library/dom@^10 @testing-library/jest-dom@^6
npm ls next react react-dom react-bootstrap react-icons eslint jest 2>&1 | head -20
```

Expected: the tree shows `next@16.3.5`, `react@19.3.0`, `react-dom@19.3.0`, `react-bootstrap@2.10.10`, `react-icons@5.7.0`, `eslint@9.x`, `jest@29.x`, with no `ERESOLVE` or `invalid` markers. If react-bootstrap prints a peer warning about React 19, that is a warning only; continue.

- [ ] **Step 2: Migrate `<Link>` children with the official codemod**

Next 13+ renders the `<a>` itself, so a nested `<a>` child is invalid.

```bash
npx @next/codemod@latest new-link . --force
git diff --stat
```

Expected: `pages/index.jsx`, `pages/portfolio/hangman.jsx`, `pages/portfolio/pokedex.jsx`, `pages/portfolio/to-do-list.jsx`, `components/resume/PortfolioSection.jsx`, `components/resume/SocialSection.jsx` change. Inspect each: the inner `<a>` is gone and its attributes moved onto `<Link>`. If any file received `legacyBehavior` instead, hand-edit it to remove the `<a>` and the `legacyBehavior` prop.

- [ ] **Step 3: Rewrite `pages/_app.js`**

```jsx
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
```

- [ ] **Step 4: Rewrite `pages/_document.js`**

```jsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function MyDocument() {
  return (
    <Html lang="en" data-bs-theme="dark">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+SC&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

(The font links are replaced by `next/font` in Task 10.)

- [ ] **Step 5: Rewrite `next.config.js`**

```js
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // A stray ~/package-lock.json otherwise makes Turbopack guess the wrong workspace root.
  turbopack: { root: __dirname },
}
```

- [ ] **Step 6: Fix `pages/resume/index.jsx`**

Remove the line `import 'bootstrap/dist/css/bootstrap.min.css';` (now global). Remove the line `if (!styles) return null`. Change the outer `<body className={styles.pageBody}>` to `<div className={styles.pageBody}>` and its closing `</body>` to `</div>`. Change `<JobHistorySection jobHistory={jobHistory} />` to `<JobHistorySection jobs={jobHistory} />`.

- [ ] **Step 7: Replace `components/FrameworkIcons.jsx` (drop MUI Tooltip)**

This file is deleted in Task 4; this is the minimal MUI-free version.

```jsx
import { Col, Row } from 'react-bootstrap'
import { FaJava, FaNodeJs } from 'react-icons/fa'
import { RiReactjsFill } from 'react-icons/ri'
import {
  SiBootstrap, SiCplusplus, SiExpress, SiGit, SiJavascript, SiMongodb, SiMui, SiPython, SiRedux, SiSass,
} from 'react-icons/si'
import { TbBrandCSharp, TbBrandCss3, TbBrandNextjs } from 'react-icons/tb'
import { TiHtml5 } from 'react-icons/ti'

const FRAMEWORKS = [
  { name: 'HTML5', Icon: TiHtml5 },
  { name: 'CSS', Icon: TbBrandCss3 },
  { name: 'Bootstrap', Icon: SiBootstrap },
  { name: 'JavaScript', Icon: SiJavascript },
  { name: 'React', Icon: RiReactjsFill },
  { name: 'Redux', Icon: SiRedux },
  { name: 'Node', Icon: FaNodeJs },
  { name: 'Next JS', Icon: TbBrandNextjs },
  { name: 'Git', Icon: SiGit },
  { name: 'Python', Icon: SiPython },
  { name: 'Express JS', Icon: SiExpress },
  { name: 'MongoDB', Icon: SiMongodb },
  { name: 'C Sharp', Icon: TbBrandCSharp },
  { name: 'C++', Icon: SiCplusplus },
  { name: 'Material UI', Icon: SiMui },
  { name: 'Java', Icon: FaJava },
  { name: 'Sass', Icon: SiSass },
]

export default function FrameworkIcons() {
  return (
    <Row>
      {FRAMEWORKS.map((framework) => (
        <Col key={framework.name} xs={4} md={2} className="text-center">
          <framework.Icon title={framework.name} className="framework-icon" size="4rem" />
        </Col>
      ))}
    </Row>
  )
}
```

(`SiCsharp` no longer exists in react-icons 5; `TbBrandCSharp` replaces it.)

- [ ] **Step 8: Replace `components/resume/JobAccordion.jsx` and `components/resume/JobHistorySection.jsx` with react-bootstrap**

`components/resume/JobAccordion.jsx`:

```jsx
import { Accordion, Col, Row } from 'react-bootstrap'

export default function JobAccordion({ job }) {
  const dateString = `${job.startYear} – ${job.endYear}`
  return (
    <Accordion.Item eventKey={String(job.id)} className="job-accordion">
      <Accordion.Header>
        <span className="d-flex justify-content-between w-100 me-3">
          <span>{job.company}</span>
          <span className="text-body-secondary">{dateString}</span>
        </span>
      </Accordion.Header>
      <Accordion.Body>
        <Row>
          <Col>
            <h5 className="accordion-header">Position(s):</h5>
            <ul>
              {job.position.map((position) => (
                <li key={position}>{position}</li>
              ))}
            </ul>
          </Col>
          <Col>
            <h5 className="accordion-header">Job Description:</h5>
            <p>{job.description}</p>
          </Col>
          <Col>
            <h5 className="accordion-header">Notes:</h5>
            <p>{job.personalNotes}</p>
          </Col>
        </Row>
      </Accordion.Body>
    </Accordion.Item>
  )
}
```

`components/resume/JobHistorySection.jsx`:

```jsx
import { Accordion } from 'react-bootstrap'
import JobAccordion from './JobAccordion'

export default function JobHistorySection({ jobs }) {
  const newestFirst = [...jobs].reverse()
  return (
    <Accordion>
      {newestFirst.map((job) => (
        <JobAccordion key={job.id} job={job} />
      ))}
    </Accordion>
  )
}
```

(This fixes the prop being ignored and the in-place `.reverse()` on the imported module array. Both files are deleted in Task 7.)

- [ ] **Step 9: Strip MUI from `AboutMeSection.jsx` and `EducationSection.jsx`**

In `components/resume/AboutMeSection.jsx` delete the two lines `import PersonIcon from '@mui/icons-material/Person';` and `import {Typography} from '@mui/material'`, and replace the `<Image ... />` block with:

```jsx
<Image
  src={headshot}
  alt="Headshot Picture"
  width={300}
  height={400}
  style={{ width: '100%', height: 'auto' }}
  className="aboutMeImage"
/>
```

In `components/resume/EducationSection.jsx` delete the line `import { CardContent, CardMedia, Typography} from '@mui/material'`.

Two more compatibility fixes discovered on the first Next 16 build:

- react-icons 5 has no `SiLinkedin` (Simple Icons dropped the LinkedIn mark). In `components/resume/SocialSection.jsx` change the import to `import { SiYoutube, SiGithub } from 'react-icons/si'` plus `import { FaLinkedin } from 'react-icons/fa'`, and change `<SiLinkedin ` to `<FaLinkedin `.
- Turbopack cannot type a file with an uppercase extension. Run `git mv public/images/headshot.jpeg public/images/headshot.jpeg` and change the import in `components/resume/AboutMeSection.jsx` to `'../../public/images/headshot.jpeg'`. (Task 6 later produces the resized `headshot.jpg`; Task 10 deletes `headshot.jpeg`.)

- [ ] **Step 10: Confirm no MUI or Emotion import remains**

```bash
grep -rn "@mui\|@emotion" pages components styles tests || echo "no MUI/Emotion imports"
```

Expected: `no MUI/Emotion imports`.

- [ ] **Step 11: Replace ESLint config with flat config**

```bash
git rm .eslintrc.json
```

Create `eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from 'eslint/config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextCoreWebVitals,
  globalIgnores(['.next/**', 'node_modules/**', 'coverage/**']),
])
```

Change the `lint` script in `package.json` to `"lint": "eslint ."`.

If `import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'` fails to resolve on the installed version, use the compatibility form instead: `npm install -D @eslint/eslintrc` and

```js
import { FlatCompat } from '@eslint/eslintrc'
import { defineConfig, globalIgnores } from 'eslint/config'

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

export default defineConfig([
  ...compat.extends('next/core-web-vitals'),
  globalIgnores(['.next/**', 'node_modules/**', 'coverage/**']),
])
```

- [ ] **Step 12: Write the smoke test first**

```bash
git rm tests/app.test.js
mkdir -p tests/smoke
```

Create `tests/smoke/home.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import Home from '../../pages/index'

test('landing page renders the name heading', () => {
  render(<Home />)
  expect(screen.getByRole('heading', { name: 'David Daniel' })).toBeInTheDocument()
})
```

- [ ] **Step 13: Run it and watch it fail for lack of config**

```bash
npm test 2>&1 | tail -15
```

Expected: FAIL with `Jest encountered an unexpected token` (JSX not transformed) or `Cannot use import statement outside a module`.

- [ ] **Step 14: Add the Jest harness**

Create `jest.config.js`:

```js
const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/tests/**/*.test.jsx'],
})
```

Create `jest.setup.js`:

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 15: Run the smoke test and watch it pass**

```bash
npm test 2>&1 | tail -15
```

Expected: `Tests: 1 passed, 1 total`.

- [ ] **Step 16: Lint, build, audit**

```bash
npm run lint
npm run build 2>&1 | tail -25
npm audit --omit=dev 2>&1 | tail -15
```

Expected: lint prints nothing (or only warnings; fix any error it reports in the files touched above). Build shows `Next.js 16.3.5`, `Compiled successfully`, and the same six static routes as Task 1. Audit output contains no line beginning with `next `; ideally `found 0 vulnerabilities`. If unrelated advisories remain, run `npm audit fix` (without `--force`) and re-run the three commands.

- [ ] **Step 17: Look at it once**

```bash
npx next start -p 3123 &
sleep 4
curl -s http://localhost:3123/resume | grep -o '<html[^>]*>'
kill %1
```

Expected: `<html lang="en" data-bs-theme="dark">`.

- [ ] **Step 18: Commit**

```bash
git add package.json package-lock.json eslint.config.mjs jest.config.js jest.setup.js tests/smoke/home.test.jsx next.config.js pages components
git commit -m "Upgrade to Next 16 and React 19, drop MUI for Bootstrap, add ESLint 9 and Jest harness"
```

---

### Task 3: Content files, content validation test and icon map

Create the five JSON files from spec §3, a test that guards their shape and rejects placeholder copy and phone numbers, and the icon map every lane's component resolves icons through. This is the last barrier before the six parallel lanes (Tasks 4–9).

**Files:**
- Create: `content/profile.json`, `content/skills.json`, `content/experience.json`, `content/education.json`, `content/projects.json`, `tests/content/content.test.js`, `components/iconMap.js`, `tests/components/iconMap.test.js`

**Interfaces:**
- Produces `iconFor(iconKey: string): ReactComponent`, `FALLBACK_ICON` and `KNOWN_ICON_KEYS` from `components/iconMap.js` (used by Tasks 4, 6, 9 and 10).
- Produces the shapes every section component consumes:
  - `profile`: `{ name, title, location, email, summary, about?, headshot, resumePdf, social: [{ label, url, icon }] }`
  - `skills`: `[{ category, skills: [{ name, icon }] }]`
  - `experience`: `[{ id, company, positions: string[], location, start, end, highlights: string[], notes? }]`, newest first; `positions[0]` is the primary title
  - `education`: `[{ id, school, location, credential, major?, start, end, image? }]`, newest first
  - `projects`: `[{ slug, name, summary, demoUrl, image, stack: [{ name, icon }] }]`
  - `icon` values are keys of `ICONS` in `components/iconMap.js` (created in this task, Steps 10–13).

- [ ] **Step 1: Write the failing test**

```bash
mkdir -p content tests/content
```

Create `tests/content/content.test.js`:

```js
import profile from '../../content/profile.json'
import skills from '../../content/skills.json'
import experience from '../../content/experience.json'
import education from '../../content/education.json'
import projects from '../../content/projects.json'

const PLACEHOLDER_PATTERN = /sample text|lorem ipsum|almost done|getting obnoxious|keep saying this|final cut|coming soon|first slide|second slide|third slide|generated by create next app|IT student/i
const PHONE_PATTERN = /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/

describe('resume content', () => {
  const everything = JSON.stringify({ profile, skills, experience, education, projects })

  test('contains no placeholder copy', () => {
    expect(everything).not.toMatch(PLACEHOLDER_PATTERN)
  })

  test('contains no phone number', () => {
    expect(everything).not.toMatch(PHONE_PATTERN)
  })

  test('profile has every field the hero and footer render', () => {
    for (const field of ['name', 'title', 'location', 'email', 'summary', 'headshot', 'resumePdf']) {
      expect(typeof profile[field]).toBe('string')
      expect(profile[field].trim()).not.toBe('')
    }
    if (profile.about !== undefined) {
      expect(profile.about.trim()).not.toBe('')
    }
    expect(profile.social.length).toBeGreaterThan(0)
    for (const link of profile.social) {
      expect(link).toEqual({
        label: expect.any(String),
        url: expect.stringMatching(/^https:\/\//),
        icon: expect.any(String),
      })
    }
  })

  test('every skill group has a category and named skills with icon keys', () => {
    expect(skills.length).toBeGreaterThan(0)
    for (const group of skills) {
      expect(group.category.trim()).not.toBe('')
      expect(group.skills.length).toBeGreaterThan(0)
      for (const skill of group.skills) {
        expect(skill).toEqual({ name: expect.any(String), icon: expect.any(String) })
      }
    }
  })

  test('every role has a unique id, company, positions, dates, a highlights array and an optional non-empty note', () => {
    const ids = experience.map((role) => role.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const role of experience) {
      for (const field of ['id', 'company', 'start', 'end']) {
        expect(role[field].trim()).not.toBe('')
      }
      expect(typeof role.location).toBe('string')
      expect(role.positions.length).toBeGreaterThan(0)
      expect(Array.isArray(role.highlights)).toBe(true)
      if (role.notes !== undefined) {
        expect(role.notes.trim()).not.toBe('')
      }
    }
  })

  test('roles are ordered newest first by start year', () => {
    const startYears = experience.map((role) => Number(role.start.match(/\d{4}/)[0]))
    for (let index = 1; index < startYears.length; index += 1) {
      expect(startYears[index]).toBeLessThanOrEqual(startYears[index - 1])
    }
  })

  test('every school has id, school, credential, start and end', () => {
    expect(education.length).toBeGreaterThan(0)
    for (const school of education) {
      for (const field of ['id', 'school', 'credential', 'start', 'end']) {
        expect(school[field].trim()).not.toBe('')
      }
    }
  })

  test('every project has a unique slug, summary, https demo url, image and stack', () => {
    const slugs = projects.map((project) => project.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const project of projects) {
      expect(project.slug).toMatch(/^[a-z0-9-]+$/)
      expect(project.summary.trim()).not.toBe('')
      expect(project.demoUrl).toMatch(/^https:\/\//)
      expect(project.image).toMatch(/^\/images\//)
      expect(project.stack.length).toBeGreaterThan(0)
      for (const tool of project.stack) {
        expect(tool).toEqual({ name: expect.any(String), icon: expect.any(String) })
      }
    }
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npm test -- tests/content 2>&1 | tail -10
```

Expected: FAIL with `Cannot find module '../../content/profile.json'`.

- [ ] **Step 3: Create `content/profile.json`**

```json
{
  "name": "David Daniel",
  "title": "Software Engineer",
  "location": "Tallahassee, FL",
  "email": "david.augustin10@gmail.com",
  "summary": "Full-stack software engineer with four years building, testing, and operating enterprise systems in Java 17/21, React/Next.js, TypeScript, C#/.NET, PostgreSQL, and SQL Server across a large multi-application platform. Owns services end to end — design, test-first development, AWS/Kubernetes deployment, and production support — and builds AI-assisted engineering tooling used daily.",
  "headshot": "/images/headshot.jpg",
  "resumePdf": "/David_Daniel_Resume.pdf",
  "social": [
    { "label": "GitHub", "url": "https://github.com/david-codez", "icon": "github" },
    { "label": "LinkedIn", "url": "https://www.linkedin.com/in/david-daniel-79945522a/", "icon": "linkedin" },
    { "label": "YouTube", "url": "https://www.youtube.com/channel/UCl3aPvjLOyJgbfmCbyhR9PA", "icon": "youtube" },
    { "label": "Instagram", "url": "https://www.instagram.com/davidcodez/", "icon": "instagram" }
  ]
}
```

- [ ] **Step 4: Create `content/skills.json`**

```json
[
  {
    "category": "Languages",
    "skills": [
      { "name": "Java", "icon": "java" },
      { "name": "C#", "icon": "csharp" },
      { "name": "JavaScript", "icon": "javascript" },
      { "name": "TypeScript", "icon": "typescript" },
      { "name": "Python", "icon": "python" },
      { "name": "SQL", "icon": "sql" },
      { "name": "C++", "icon": "cplusplus" }
    ]
  },
  {
    "category": "Backend",
    "skills": [
      { "name": "Spring Boot", "icon": "springboot" },
      { "name": "Hibernate/JPA", "icon": "hibernate" },
      { "name": "MyBatis", "icon": "mybatis" },
      { "name": "Node.js", "icon": "nodejs" },
      { "name": "Express", "icon": "express" },
      { "name": "REST APIs", "icon": "rest" },
      { "name": "OpenAPI", "icon": "openapi" }
    ]
  },
  {
    "category": "Frontend",
    "skills": [
      { "name": "React", "icon": "react" },
      { "name": "Next.js", "icon": "nextjs" },
      { "name": "Redux", "icon": "redux" },
      { "name": "Responsive Web Development", "icon": "responsive" },
      { "name": "HTML5", "icon": "html" },
      { "name": "CSS", "icon": "css" },
      { "name": "Bootstrap", "icon": "bootstrap" },
      { "name": "Sass", "icon": "sass" },
      { "name": "Material UI", "icon": "mui" }
    ]
  },
  {
    "category": "Data & Tooling",
    "skills": [
      { "name": "PostgreSQL", "icon": "postgresql" },
      { "name": "SQL Server", "icon": "sqlserver" },
      { "name": "Maven", "icon": "maven" },
      { "name": "Git", "icon": "git" },
      { "name": "Docker", "icon": "docker" },
      { "name": "Kubernetes", "icon": "kubernetes" },
      { "name": "AWS/CloudFront", "icon": "aws" },
      { "name": "Nexus", "icon": "nexus" },
      { "name": "PDFBox", "icon": "pdfbox" },
      { "name": "MongoDB", "icon": "mongodb" }
    ]
  },
  {
    "category": "Testing & AI",
    "skills": [
      { "name": "JUnit", "icon": "junit" },
      { "name": "Jest", "icon": "jest" },
      { "name": "TDD", "icon": "tdd" },
      { "name": "AI coding agents (Claude Code)", "icon": "ai-agents" },
      { "name": "MCP servers", "icon": "mcp" },
      { "name": "Small-model training", "icon": "model-training" }
    ]
  }
]
```

- [ ] **Step 5: Create `content/experience.json`**

All ten roles from the old `workHistory.json`, newest first. The Auto Data Direct highlights are the resume's nine bullets. The four `notes` values are the owner's real first-person text copied exactly, typos included. Roles whose old text was all placeholder get an empty `highlights` array and no `notes`.

```json
[
  {
    "id": "auto-data-direct",
    "company": "Auto Data Direct",
    "positions": ["Software Engineer"],
    "location": "Tallahassee, FL",
    "start": "October 2022",
    "end": "Present",
    "highlights": [
      "Core developer on the ground-up React/TypeScript rewrite of the Electronic Lien & Title (ELT) product: lien-management screens, per-state form validation, address standardization, and A/B-tested beta rollouts across 14 states; used by thousands of lienholders nationwide.",
      "Launched electronic DMV title integrations for eight new states: built per-state XML mappers and data feeds in Java and C#/.NET, and led the statewide ELT provider switch for Iowa.",
      "Designed and built the customer-migration flow that onboards lienholders from a competing ELT vendor: React import UI, backend migration routes, bulk lien imports, and data reconciliation.",
      "Lead development and maintenance of the CarLocate Monitoring Service, which helps rental-car companies track towed vehicles: architected and built its automated VIN-match pipeline — PGP-encrypted SFTP ingestion, matching against tow/salvage notices in FL, MS, and TX, and billing.",
      "Modernized platform infrastructure: migrated ~20 backend services to updated shared libraries and AWS SDK v2, upgraded services to Java 17, converted a dozen legacy jobs to Kubernetes CronJobs, and moved DMV form generation to Apache PDFBox.",
      "Improved platform security: re-keyed the company-wide account-restriction system to UUID-based identity across ~10 services, eliminated SQL-injection points, and hardened file-upload and PDF-merge handling.",
      "Delivered internal admin tooling (funds transfers, webinar management, promo-code administration) end to end with permission-guarded REST routes and validated React frontends.",
      "Own services end to end in production: test-first development with JUnit and Jest, code reviews on every release, AWS and Kubernetes deployments, live troubleshooting, and system documentation.",
      "Use AI coding agents daily for implementation, test scaffolding, and code review; built an internal MCP server (Node.js/PostgreSQL) that gives agents direct query access to the team’s project-tracking system."
    ]
  },
  {
    "id": "honeybelle",
    "company": "Honeybelle at PGA National Resort",
    "positions": ["Server"],
    "location": "",
    "start": "January 2022",
    "end": "May 2022",
    "highlights": []
  },
  {
    "id": "tommy-bahama",
    "company": "Tommy Bahama",
    "positions": ["Server", "Bartender"],
    "location": "",
    "start": "January 2021",
    "end": "February 2022",
    "highlights": []
  },
  {
    "id": "westwood-interior-cleaning",
    "company": "Westwood Interior Cleaning",
    "positions": ["Exterior Maintenance Technician"],
    "location": "",
    "start": "June 2018",
    "end": "July 2020",
    "highlights": [],
    "notes": "Working at Westwood was my initial attempt at getting out out of the restaurant industry. I was in charge of maintaining the exteriors of model homes and inventory homes for major homebuilders like Lennar, Meritage and Mattamy. This would involve traveling to various properties in south florida and working out of a trailer to do pressure washing and window cleaning as needed, also replacing light bulbs and ac filters. The company I worked for struggled after the Covid-19 pandemic and had to let go of several people including me. I ended up going back to Duffy's full time."
  },
  {
    "id": "duffys-bar-and-grill",
    "company": "Duffy's Bar & Grill",
    "positions": ["Server", "Bartender"],
    "location": "",
    "start": "August 2017",
    "end": "January 2021",
    "highlights": [],
    "notes": "I worked at Duffy's for about three and a half years, I worked at three different locations and was offered a management position several times. I never accepted any supervisory position because i had no interest in pursuing a career in restaurant management"
  },
  {
    "id": "buffalo-wild-wings",
    "company": "Buffalo Wild Wings",
    "positions": ["Server"],
    "location": "",
    "start": "March 2017",
    "end": "August 2017",
    "highlights": []
  },
  {
    "id": "chilis-bar-and-grill",
    "company": "Chili's Bar & Grill",
    "positions": ["Bartender", "Server", "Expeditor", "Line Cook"],
    "location": "",
    "start": "May 2015",
    "end": "August 2017",
    "highlights": [],
    "notes": "I started working at Chili's as an expeditor, after working there for six months I was promoted to a server position. After being a server for eight months I was promoted to bartender. I worked as a bartender for a little over a year before moving on to a different company"
  },
  {
    "id": "teleperformance",
    "company": "Teleperformance",
    "positions": ["Xbox Customer Service Representative"],
    "location": "",
    "start": "November 2014",
    "end": "May 2015",
    "highlights": []
  },
  {
    "id": "dunkin-donuts",
    "company": "Dunkin’ Donuts",
    "positions": ["General Manager", "Shift Leader", "Team Member"],
    "location": "",
    "start": "September 2012",
    "end": "November 2014",
    "highlights": [
      "Increased sales 40%+; managed and trained ~20 staff."
    ],
    "notes": "When I started working at Dunkin Donuts, it was for the grand opening of a brand-new store. Two weeks after the store opened, I was promoted from a Team Member position to being a Shift Leader. After a year in that position, I was given my own store and promoted to General Manager. After one and a half years in that position, I realized that restaurant management wasn't going to be my career, so I moved on"
  },
  {
    "id": "grandes-bella-cucina",
    "company": "Grande's Bella Cucina",
    "positions": ["Expeditor", "Food Runner", "Busser"],
    "location": "",
    "start": "November 2008",
    "end": "May 2012",
    "highlights": [],
    "notes": "Grande's was my first job, I started here as a busser when I was 17 years old. I worked my way up to food runner and then eventually became the expeditor for the restaurant. As the expeditor i was in charge of making sure every order reached the table exactly to the customer's specifications and in a timely fashion"
  }
]
```

- [ ] **Step 6: Create `content/education.json`**

The high-school and Associate of Arts entries from the old `educationHistory.json`, newest first. The Bachelor of Applied Science entry is omitted by the owner's decision, and its stock "work in progress" photo is deleted in Task 8.

```json
[
  {
    "id": "pbsc-associate-of-arts",
    "school": "Palm Beach State College",
    "location": "Lake Worth, FL",
    "credential": "Associate of Arts",
    "start": "January 2020",
    "end": "December 2021",
    "image": "/images/aa_grad_photo.jpg"
  },
  {
    "id": "dwyer-high-school",
    "school": "William T. Dwyer High School",
    "location": "",
    "credential": "High School Diploma",
    "start": "August 2005",
    "end": "May 2009",
    "image": "/images/hs_grad_photo.jpg"
  }
]
```

(Both image files are produced in Task 8.)

- [ ] **Step 7: Create `content/projects.json`**

Summaries are starter copy derived from the existing screenshots and technology icons; the owner may edit them.

```json
[
  {
    "slug": "to-do-list",
    "name": "To Do List",
    "summary": "A task tracker with separate active and completed lists, built in React and styled with Bootstrap and Sass.",
    "demoUrl": "https://to-do-list-app-mu.vercel.app/",
    "image": "/images/to-do-list-screenshot.png",
    "stack": [
      { "name": "HTML5", "icon": "html" },
      { "name": "CSS", "icon": "css" },
      { "name": "Bootstrap", "icon": "bootstrap" },
      { "name": "JavaScript", "icon": "javascript" },
      { "name": "React", "icon": "react" },
      { "name": "Sass", "icon": "sass" }
    ]
  },
  {
    "slug": "pokedex",
    "name": "Pokedex",
    "summary": "A Pokédex browser that looks up a Pokémon and shows its artwork and stats, built in React with Bootstrap and Sass.",
    "demoUrl": "https://pokedex-mu-nine-85.vercel.app",
    "image": "/images/pokedex-screenshot.png",
    "stack": [
      { "name": "HTML5", "icon": "html" },
      { "name": "CSS", "icon": "css" },
      { "name": "Bootstrap", "icon": "bootstrap" },
      { "name": "JavaScript", "icon": "javascript" },
      { "name": "React", "icon": "react" },
      { "name": "Sass", "icon": "sass" }
    ]
  },
  {
    "slug": "hangman",
    "name": "Hangman",
    "summary": "A hangman word game with an on-screen keyboard and a drawn gallows, built with React and Next.js.",
    "demoUrl": "https://hangman-woad.vercel.app",
    "image": "/images/hangman-screenshot.png",
    "stack": [
      { "name": "HTML5", "icon": "html" },
      { "name": "CSS", "icon": "css" },
      { "name": "Bootstrap", "icon": "bootstrap" },
      { "name": "JavaScript", "icon": "javascript" },
      { "name": "React", "icon": "react" },
      { "name": "Next.js", "icon": "nextjs" }
    ]
  }
]
```

- [ ] **Step 8: Run the content test and watch it pass**

```bash
npm test -- tests/content 2>&1 | tail -15
```

Expected: `Tests: 8 passed, 8 total`.

- [ ] **Step 9: Spot-check verbatim copy against the spec**

```bash
grep -c "team’s project-tracking system" content/experience.json   # expected 1 (curly apostrophe)
grep -c "Dunkin’ Donuts" content/experience.json                   # expected 1
grep -c "end to end — design" content/profile.json                 # expected 1 (em dash)
grep -c "Grande's was my first job" content/experience.json        # expected 1 (carried-forward note)
grep -c "getting out out of the restaurant" content/experience.json # expected 1 (typo preserved)
grep -rn "sample text\|almost done\|IT student" content || echo "no placeholders"
grep -rn "561-629" content || echo "no phone number"
```

- [ ] **Step 10: Write the failing icon map test**

```bash
mkdir -p tests/components
```

Create `tests/components/iconMap.test.js`:

```js
import { FALLBACK_ICON, KNOWN_ICON_KEYS, iconFor } from '../../components/iconMap'
import profile from '../../content/profile.json'
import projects from '../../content/projects.json'
import skills from '../../content/skills.json'

test('every known icon key resolves to a component, never undefined', () => {
  const unresolved = KNOWN_ICON_KEYS.filter((key) => typeof iconFor(key) !== 'function')
  expect(unresolved).toEqual([])
})

test('an unknown key falls back to the generic code icon', () => {
  expect(iconFor('definitely-not-a-key')).toBe(FALLBACK_ICON)
})

test('covers every icon key the content files use', () => {
  const usedKeys = new Set([
    ...skills.flatMap((group) => group.skills.map((skill) => skill.icon)),
    ...projects.flatMap((project) => project.stack.map((tool) => tool.icon)),
    ...profile.social.map((link) => link.icon),
  ])
  const missing = [...usedKeys].filter((key) => !KNOWN_ICON_KEYS.includes(key))
  expect(missing).toEqual([])
})
```

- [ ] **Step 11: Run it and watch it fail**

```bash
npm test -- tests/components/iconMap 2>&1 | tail -8
```

Expected: FAIL with `Cannot find module '../../components/iconMap'`.

- [ ] **Step 12: Create `components/iconMap.js`**

```js
import { DiMsqlServer } from 'react-icons/di'
import {
  FaAws, FaBrain, FaCode, FaDatabase, FaFilePdf, FaJava, FaLinkedin, FaPlug, FaRobot, FaVial,
} from 'react-icons/fa'
import {
  SiApachemaven, SiBootstrap, SiCplusplus, SiDocker, SiExpress, SiGit, SiGithub, SiHibernate, SiHtml5, SiInstagram,
  SiJavascript, SiJest, SiJunit5, SiKubernetes, SiMongodb, SiMui, SiNextdotjs, SiNodedotjs,
  SiOpenapiinitiative, SiPostgresql, SiPython, SiReact, SiRedux, SiSass, SiSonatype, SiSpringboot, SiTypescript,
  SiYoutube,
} from 'react-icons/si'
import { TbBrandCSharp, TbBrandCss3, TbSql } from 'react-icons/tb'

export const FALLBACK_ICON = FaCode

const ICONS = {
  java: FaJava,
  csharp: TbBrandCSharp,
  javascript: SiJavascript,
  typescript: SiTypescript,
  python: SiPython,
  sql: TbSql,
  cplusplus: SiCplusplus,
  springboot: SiSpringboot,
  hibernate: SiHibernate,
  mybatis: FaDatabase,
  nodejs: SiNodedotjs,
  express: SiExpress,
  rest: FaPlug,
  openapi: SiOpenapiinitiative,
  react: SiReact,
  nextjs: SiNextdotjs,
  redux: SiRedux,
  responsive: TbBrandCss3,
  postgresql: SiPostgresql,
  sqlserver: DiMsqlServer,
  maven: SiApachemaven,
  git: SiGit,
  docker: SiDocker,
  kubernetes: SiKubernetes,
  aws: FaAws,
  nexus: SiSonatype,
  pdfbox: FaFilePdf,
  mongodb: SiMongodb,
  junit: SiJunit5,
  jest: SiJest,
  tdd: FaVial,
  'ai-agents': FaRobot,
  mcp: FaPlug,
  'model-training': FaBrain,
  html: SiHtml5,
  css: TbBrandCss3,
  bootstrap: SiBootstrap,
  sass: SiSass,
  mui: SiMui,
  github: SiGithub,
  linkedin: FaLinkedin,
  youtube: SiYoutube,
  instagram: SiInstagram,
}

export const KNOWN_ICON_KEYS = Object.keys(ICONS)

export function iconFor(iconKey) {
  return ICONS[iconKey] ?? FALLBACK_ICON
}
```

- [ ] **Step 13: Run the icon map test and watch it pass**

```bash
npm test -- tests/components/iconMap 2>&1 | tail -8
```

Expected: `Tests: 3 passed`. If the first test fails, its output lists the keys whose react-icons export does not exist in 5.7.0. For each listed key, replace the import with one of these exports verified to exist across react-icons 4 and 5 and re-run: `FaCode`, `FaDatabase`, `FaPlug`, `FaBrain`, `FaRobot`, `FaVial`, `FaFilePdf`, `FaAws`, `FaJava`, `TbBrandCSharp`, `TbBrandCss3`, `TbSql`, `DiMsqlServer`.

- [ ] **Step 14: Commit**

```bash
npm run lint && npm test && npm run build 2>&1 | tail -3
git add content tests/content components/iconMap.js tests/components/iconMap.test.js
git commit -m "Add resume content files, content validation test and icon map"
```

Task 3 is the last barrier. The orchestrator now opens the six lane worktrees described in the Lanes section and dispatches Tasks 4–9 in parallel.

---

### Task 4: Skills section (lane `skills`)

Build the labelled, responsive skills grid driven by `content/skills.json`. Lane rules: create the new component and its test only. Do not touch `pages/resume/index.jsx`, `styles/globals.css` or the old `components/FrameworkIcons.jsx`; Task 10 wires the new section in and deletes the old one.

**Files:**
- Create: `components/resume/SkillsSection.jsx`, `tests/components/SkillsSection.test.jsx`

**Interfaces:**
- Consumes: `skills` shape and `iconFor` (Task 3).
- Produces: `SkillsSection({ skillGroups })` rendering `<section id="skills" aria-labelledby="skills-heading">`, wired into `pages/index.jsx` by Task 10.

Work in the `site-refresh/skills` worktree (see Lanes).

- [ ] **Step 1: Write the failing SkillsSection test**

Create `tests/components/SkillsSection.test.jsx`:

```jsx
import { render, screen, within } from '@testing-library/react'
import SkillsSection from '../../components/resume/SkillsSection'

const skillGroups = [
  { category: 'Languages', skills: [{ name: 'Java', icon: 'java' }, { name: 'SQL', icon: 'sql' }] },
  { category: 'Frontend', skills: [{ name: 'React', icon: 'react' }] },
]

test('renders a region named Skills with a heading per category', () => {
  render(<SkillsSection skillGroups={skillGroups} />)
  const region = screen.getByRole('region', { name: 'Skills' })
  expect(within(region).getByRole('heading', { level: 2, name: 'Skills' })).toBeInTheDocument()
  expect(within(region).getByRole('heading', { level: 3, name: 'Languages' })).toBeInTheDocument()
  expect(within(region).getByRole('heading', { level: 3, name: 'Frontend' })).toBeInTheDocument()
})

test('renders every skill name as visible text', () => {
  render(<SkillsSection skillGroups={skillGroups} />)
  expect(screen.getByText('Java')).toBeInTheDocument()
  expect(screen.getByText('SQL')).toBeInTheDocument()
  expect(screen.getByText('React')).toBeInTheDocument()
})

test('renders a skill with an unknown icon key without throwing', () => {
  render(<SkillsSection skillGroups={[{ category: 'Misc', skills: [{ name: 'Mystery', icon: 'nope' }] }]} />)
  expect(screen.getByText('Mystery')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npm test -- tests/components/SkillsSection 2>&1 | tail -8
```

Expected: FAIL with `Cannot find module '../../components/resume/SkillsSection'`.

- [ ] **Step 3: Create `components/resume/SkillsSection.jsx`**

```jsx
import { Col, Container, Row } from 'react-bootstrap'
import { iconFor } from '../iconMap'

export default function SkillsSection({ skillGroups }) {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="py-5">
      <Container>
        <h2 id="skills-heading" className="text-center mb-4">Skills</h2>
        {skillGroups.map((group) => (
          <div key={group.category} className="mb-4">
            <h3 className="h6 text-uppercase text-body-secondary text-center mb-3">{group.category}</h3>
            <Row as="ul" className="list-unstyled justify-content-center g-3 mb-0">
              {group.skills.map((skill) => {
                const Icon = iconFor(skill.icon)
                return (
                  <Col as="li" key={skill.name} xs={6} sm={4} md={3} lg={2} className="text-center">
                    <Icon aria-hidden="true" size="2.5rem" className="skill-icon" />
                    <div className="small mt-1">{skill.name}</div>
                  </Col>
                )
              })}
            </Row>
          </div>
        ))}
      </Container>
    </section>
  )
}
```

- [ ] **Step 4: Run the SkillsSection test and watch it pass**

```bash
npm test -- tests/components/SkillsSection 2>&1 | tail -8
```

Expected: `Tests: 3 passed`.

- [ ] **Step 5: Verify and commit**

```bash
npm run lint && npm test && npm run build 2>&1 | tail -3
git add components/resume/SkillsSection.jsx tests/components/SkillsSection.test.jsx
git commit -m "Add labelled, responsive Skills section from skills.json"
```

The build still shows the old icon grid on `/resume`; that is expected until Task 10. The orchestrator merges `site-refresh/skills` per the Lanes section.

---

### Task 5: Resume PDF without the phone number (lane `pdf`)

Produce `public/David_Daniel_Resume.pdf` from the docx with the phone number removed, and verify it visually and by text extraction. Lane rules: this lane adds one file under `public/` and touches nothing else. Work in the `site-refresh/pdf` worktree (see Lanes).

**Files:**
- Create: `public/David_Daniel_Resume.pdf`

**Interfaces:**
- Consumes: `~/Downloads/David_Daniel_Resume_Updated.docx`; helper scripts under `/home/daviddaniel/.claude/skills/docx/scripts/`.
- Produces: the file `profile.resumePdf` (`/David_Daniel_Resume.pdf`) points at.

- [ ] **Step 1: Unpack a working copy**

```bash
WORK=$(mktemp -d)
echo "$WORK"
unzip -q /home/daviddaniel/Downloads/David_Daniel_Resume_Updated.docx -d "$WORK/docx"
find "$WORK/docx" -type l -delete
python3 /home/daviddaniel/.claude/skills/docx/scripts/merge_runs.py "$WORK/docx"
grep -o '561-629-3906[^<]*' "$WORK/docx/word/document.xml"
```

Expected: one match showing the phone followed by the separator (spaces or non-breaking spaces and a `|`), for example `561-629-3906   |   `.

- [ ] **Step 2: Strip the phone and its separator**

```bash
python3 - "$WORK/docx/word/document.xml" <<'EOF'
import re, sys
path = sys.argv[1]
xml = open(path, encoding='utf-8').read()
updated, count = re.subn(r'561-629-3906\s*\|\s*', '', xml)
print(f"removed {count} occurrence(s)")
open(path, 'w', encoding='utf-8').write(updated)
EOF
grep -c '561-629-3906' "$WORK/docx/word/document.xml" || echo "phone removed"
```

Expected: `removed 1 occurrence(s)` then `phone removed`. If the count is 0, print the contact line (`grep -o 'Tallahassee[^<]*' …`) and adjust the regex to whatever separator characters appear.

- [ ] **Step 3: Repack and validate**

```bash
(cd "$WORK/docx" && zip -Xqr "$WORK/David_Daniel_Resume.docx" .)
python3 /home/daviddaniel/.claude/skills/docx/scripts/office/validate.py "$WORK/David_Daniel_Resume.docx" --original /home/daviddaniel/Downloads/David_Daniel_Resume_Updated.docx
```

Expected: validation passes (no schema errors).

- [ ] **Step 4: Convert to PDF and check the text**

```bash
python3 /home/daviddaniel/.claude/skills/docx/scripts/office/soffice.py --headless --convert-to pdf --outdir "$WORK" "$WORK/David_Daniel_Resume.docx"
ls -la "$WORK/David_Daniel_Resume.pdf"
pdftotext "$WORK/David_Daniel_Resume.pdf" - | head -5
pdftotext "$WORK/David_Daniel_Resume.pdf" - | grep -c '561-629' || echo "no phone in PDF"
```

Expected: header lines show `DAVID DANIEL`, `SOFTWARE ENGINEER`, and a contact line containing `Tallahassee, FL` and the email with no phone; final line `no phone in PDF`.

- [ ] **Step 5: Look at the rendered page**

```bash
pdftoppm -jpeg -r 80 "$WORK/David_Daniel_Resume.pdf" "$WORK/page"
ls "$WORK"/page-*.jpg
```

Read each `page-*.jpg`. Expected: the header contact line reads location and email only, bullets are intact, no text overflows the page. If the layout broke, stop and report; do not publish a broken PDF.

- [ ] **Step 6: Publish into `public/` and commit**

```bash
cp "$WORK/David_Daniel_Resume.pdf" public/David_Daniel_Resume.pdf
grep -rl '561-629-3906' --exclude-dir=node_modules --exclude-dir=.next . || echo "phone absent from repo"
git add public/David_Daniel_Resume.pdf
git commit -m "Add downloadable resume PDF generated from the August 2026 resume"
```

Expected: `phone absent from repo` (the binary PDF is checked by `pdftotext` in Step 4, not by grep).

---

### Task 6: Hero section (lane `hero`)

Build `HeroSection` driven by `profile.json` and produce the resized headshot. Lane rules: create only. The old name banner, social row, carousel and about-me block stay in place, and `headshot.jpeg` and the three stock photos stay on disk, until Task 10 replaces and deletes them. Do not touch `pages/resume/index.jsx` or any stylesheet.

**Files:**
- Create: `components/resume/HeroSection.jsx`, `tests/components/HeroSection.test.jsx`, `public/images/headshot.jpg`

**Interfaces:**
- Consumes: `profile` shape and `iconFor` (Task 3).
- Produces: `HeroSection({ profile })` rendering the page's only `<h1>`. Task 10 wires it in and extracts its social list into `SocialLinks`.

Work in the `site-refresh/hero` worktree (see Lanes).

- [ ] **Step 1: Write the failing test**

Create `tests/components/HeroSection.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import HeroSection from '../../components/resume/HeroSection'

const profile = {
  name: 'Test Person',
  title: 'Software Engineer',
  location: 'Somewhere, FL',
  email: 'test@example.com',
  summary: 'Builds things.',
  headshot: '/images/headshot.jpg',
  resumePdf: '/Test_Resume.pdf',
  social: [{ label: 'GitHub', url: 'https://github.com/test', icon: 'github' }],
}

test('renders the name as the only h1, with title, location and summary', () => {
  render(<HeroSection profile={profile} />)
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Person')
  expect(screen.getByText('Software Engineer')).toBeInTheDocument()
  expect(screen.getByText('Somewhere, FL')).toBeInTheDocument()
  expect(screen.getByText('Builds things.')).toBeInTheDocument()
})

test('links to the PDF resume and to the email address', () => {
  render(<HeroSection profile={profile} />)
  expect(screen.getByRole('link', { name: /download resume/i })).toHaveAttribute('href', '/Test_Resume.pdf')
  expect(screen.getByRole('link', { name: /email me/i })).toHaveAttribute('href', 'mailto:test@example.com')
})

test('social links are labelled and open in a new tab safely', () => {
  render(<HeroSection profile={profile} />)
  const github = screen.getByRole('link', { name: 'GitHub' })
  expect(github).toHaveAttribute('href', 'https://github.com/test')
  expect(github).toHaveAttribute('target', '_blank')
  expect(github).toHaveAttribute('rel', 'noopener noreferrer')
})

test('renders the headshot with a descriptive alt', () => {
  render(<HeroSection profile={profile} />)
  expect(screen.getByRole('img', { name: 'Portrait of Test Person' })).toBeInTheDocument()
})

test('renders the optional about paragraph only when present', () => {
  const { rerender } = render(<HeroSection profile={profile} />)
  expect(screen.queryByText('A longer story.')).not.toBeInTheDocument()
  rerender(<HeroSection profile={{ ...profile, about: 'A longer story.' }} />)
  expect(screen.getByText('A longer story.')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npm test -- tests/components/HeroSection 2>&1 | tail -8
```

Expected: FAIL with `Cannot find module '../../components/resume/HeroSection'`.

- [ ] **Step 3: Create `components/resume/HeroSection.jsx`**

```jsx
import Image from 'next/image'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { FaDownload, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import { iconFor } from '../iconMap'

export default function HeroSection({ profile }) {
  return (
    <header className="py-5">
      <Container>
        <Row className="align-items-center g-4">
          <Col md={4} className="text-center">
            <Image
              src={profile.headshot}
              alt={`Portrait of ${profile.name}`}
              width={240}
              height={240}
              className="rounded-circle"
              priority
            />
          </Col>
          <Col md={8}>
            <h1 className="display-4 mb-1">{profile.name}</h1>
            <p className="h3 text-body-secondary mb-2">{profile.title}</p>
            <p className="mb-3">
              <FaMapMarkerAlt aria-hidden="true" /> {profile.location}
            </p>
            <p className="lead">{profile.summary}</p>
            {profile.about ? <p>{profile.about}</p> : null}
            <div className="d-flex flex-wrap gap-2 mb-3">
              <Button as="a" href={profile.resumePdf} variant="primary">
                <FaDownload aria-hidden="true" /> Download resume (PDF)
              </Button>
              <Button as="a" href={`mailto:${profile.email}`} variant="outline-light">
                <FaEnvelope aria-hidden="true" /> Email me
              </Button>
            </div>
            <ul className="list-inline mb-0">
              {profile.social.map((link) => {
                const Icon = iconFor(link.icon)
                return (
                  <li key={link.url} className="list-inline-item">
                    <a
                      href={link.url}
                      aria-label={link.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                    >
                      <Icon size="1.75rem" aria-hidden="true" />
                    </a>
                  </li>
                )
              })}
            </ul>
          </Col>
        </Row>
      </Container>
    </header>
  )
}
```

- [ ] **Step 4: Run the test and watch it pass**

```bash
npm test -- tests/components/HeroSection 2>&1 | tail -8
```

Expected: `Tests: 5 passed`.

- [ ] **Step 5: Produce the resized headshot**

```bash
convert public/images/headshot.jpeg -auto-orient -resize 600x600^ -gravity center -extent 600x600 -quality 82 public/images/headshot.jpg
du -h public/images/headshot.jpg
```

Expected: the new file is under 120K. Leave `headshot.jpeg` in place; `AboutMeSection.jsx` still imports it and Task 10 deletes both.

- [ ] **Step 6: Verify and commit**

```bash
npm run lint && npm test && npm run build 2>&1 | tail -3
git add components/resume/HeroSection.jsx tests/components/HeroSection.test.jsx public/images/headshot.jpg
git commit -m "Add Hero section from profile.json with a resized headshot"
```

The `.social-link` hover style lands with the stylesheet rewrite in Task 10. The orchestrator merges `site-refresh/hero` per the Lanes section.

---

### Task 7: Experience section (lane `experience`)

Build `ExperienceSection` driven by `experience.json`: all ten roles newest first with the newest expanded; primary position and company in the header; earlier positions, resume highlights and first-person notes in the body, each rendered only when present; dates that do not wrap onto the company name at phone width. Lane rules: create only. `JobAccordion.jsx`, `JobHistorySection.jsx` and `workHistory.json` stay until Task 10 deletes them. Do not touch `pages/resume/index.jsx` or any stylesheet.

**Files:**
- Create: `components/resume/ExperienceSection.jsx`, `tests/components/ExperienceSection.test.jsx`

**Interfaces:**
- Consumes: `experience` shape (Task 3).
- Produces: `ExperienceSection({ roles })` rendering `<section id="experience" aria-labelledby="experience-heading">`, wired in by Task 10.

Work in the `site-refresh/experience` worktree (see Lanes).

- [ ] **Step 1: Write the failing test**

Create `tests/components/ExperienceSection.test.jsx`:

```jsx
import { render, screen, within } from '@testing-library/react'
import ExperienceSection from '../../components/resume/ExperienceSection'

const roles = [
  { id: 'acme', company: 'Acme', positions: ['Engineer', 'Junior Engineer'], location: 'Here, FL', start: 'October 2022', end: 'Present', highlights: ['Built the widget.', 'Shipped the gadget.'] },
  { id: 'diner', company: 'The Diner', positions: ['Server'], location: '', start: 'May 2015', end: 'August 2017', highlights: [], notes: 'I started as a busser and moved up.' },
  { id: 'quiet', company: 'Quiet Co', positions: ['Technician'], location: '', start: 'June 2018', end: 'July 2020', highlights: [] },
]

test('renders a region named Experience with every company and primary position', () => {
  render(<ExperienceSection roles={roles} />)
  const region = screen.getByRole('region', { name: 'Experience' })
  for (const text of ['Acme', 'Engineer', 'The Diner', 'Server', 'Quiet Co', 'Technician']) {
    expect(within(region).getByText(text)).toBeInTheDocument()
  }
})

test('lists earlier positions only for roles that had more than one', () => {
  render(<ExperienceSection roles={roles} />)
  expect(screen.getAllByText('Previously:')).toHaveLength(1)
  expect(screen.getByText(/Junior Engineer/)).toBeInTheDocument()
})

test('shows an en-dash date range for each role', () => {
  render(<ExperienceSection roles={roles} />)
  expect(screen.getByText('October 2022 – Present')).toBeInTheDocument()
  expect(screen.getByText('May 2015 – August 2017')).toBeInTheDocument()
  expect(screen.getByText('June 2018 – July 2020')).toBeInTheDocument()
})

test('renders highlights as list items and notes as a paragraph, each only when present', () => {
  render(<ExperienceSection roles={roles} />)
  expect(screen.getByText('Built the widget.').tagName).toBe('LI')
  expect(screen.getByText('Shipped the gadget.').tagName).toBe('LI')
  expect(screen.getByText('I started as a busser and moved up.').tagName).toBe('P')
  expect(screen.getAllByRole('heading', { level: 4, name: 'Highlights' })).toHaveLength(1)
  expect(screen.getAllByRole('heading', { level: 4, name: 'Notes' })).toHaveLength(1)
})

test('expands the most recent role by default and collapses the rest', () => {
  render(<ExperienceSection roles={roles} />)
  const toggles = screen.getAllByRole('button')
  expect(toggles).toHaveLength(3)
  expect(toggles[0]).toHaveAttribute('aria-expanded', 'true')
  expect(toggles[1]).toHaveAttribute('aria-expanded', 'false')
  expect(toggles[2]).toHaveAttribute('aria-expanded', 'false')
})

test('shows the location when a role has one', () => {
  render(<ExperienceSection roles={roles} />)
  expect(screen.getByText(/Here, FL/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npm test -- tests/components/ExperienceSection 2>&1 | tail -8
```

Expected: FAIL with `Cannot find module '../../components/resume/ExperienceSection'`.

- [ ] **Step 3: Create `components/resume/ExperienceSection.jsx`**

```jsx
import { Accordion, Container } from 'react-bootstrap'

export default function ExperienceSection({ roles }) {
  const newestRoleId = roles.length > 0 ? roles[0].id : undefined
  return (
    <section id="experience" aria-labelledby="experience-heading" className="py-5">
      <Container>
        <h2 id="experience-heading" className="text-center mb-4">Experience</h2>
        <Accordion defaultActiveKey={[newestRoleId]} alwaysOpen>
          {roles.map((role) => {
            const [primaryPosition, ...earlierPositions] = role.positions
            return (
              <Accordion.Item eventKey={role.id} key={role.id}>
                <Accordion.Header>
                  <span className="d-flex flex-column flex-sm-row justify-content-between w-100 me-3 gap-1">
                    <span>
                      <strong>{primaryPosition}</strong>
                      {' · '}
                      <span>{role.company}</span>
                      {role.location ? <span className="text-body-secondary"> · {role.location}</span> : null}
                    </span>
                    <span className="text-body-secondary text-nowrap">{`${role.start} – ${role.end}`}</span>
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  {earlierPositions.length > 0 ? (
                    <p className="text-body-secondary">
                      <strong>Previously:</strong> {earlierPositions.join(', ')}
                    </p>
                  ) : null}
                  {role.highlights.length > 0 ? (
                    <>
                      <h4 className="h6 text-uppercase">Highlights</h4>
                      <ul>
                        {role.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  {role.notes ? (
                    <>
                      <h4 className="h6 text-uppercase">Notes</h4>
                      <p className="mb-0">{role.notes}</p>
                    </>
                  ) : null}
                </Accordion.Body>
              </Accordion.Item>
            )
          })}
        </Accordion>
      </Container>
    </section>
  )
}
```

A role with neither highlights nor notes (for example Buffalo Wild Wings) renders an accordion body containing only the header line; that is intended until the owner adds copy.

- [ ] **Step 4: Run the test and watch it pass**

```bash
npm test -- tests/components/ExperienceSection 2>&1 | tail -8
```

Expected: `Tests: 6 passed`.

- [ ] **Step 5: Verify and commit**

```bash
npm run lint && npm test && npm run build 2>&1 | tail -3
git add components/resume/ExperienceSection.jsx tests/components/ExperienceSection.test.jsx
git commit -m "Add Experience section from experience.json"
```

The orchestrator merges `site-refresh/experience` per the Lanes section.

---

### Task 8: Education section (lane `education`)

Rewrite `EducationSection` in place to map over `education.json` (both entries, newest first), with an optional major and an optional photo, and drop the hardcoded three-card layout and its oversized images. Lane rules: because the component is rewritten at its existing path and the legacy page still renders it, this lane makes exactly two line changes in `pages/resume/index.jsx` (Step 6) so the legacy build stays green. The four deletions below are safe inside the lane because the rewritten component was their only importer. Do not touch any stylesheet.

**Files:**
- Modify: `components/resume/EducationSection.jsx` (full rewrite), `pages/resume/index.jsx` (two lines, Step 6)
- Create: `tests/components/EducationSection.test.jsx`, `public/images/aa_grad_photo.jpg`, `public/images/hs_grad_photo.jpg`
- Delete: `educationHistory.json`, `public/images/aa_grad_photo.jpeg`, `public/images/hs_grad_photo.jpeg`, `public/images/work-in-progress.jpg`

**Interfaces:**
- Consumes: `education` shape (Task 3).
- Produces: `EducationSection({ schools })` rendering `<section id="education" aria-labelledby="education-heading">`.

Work in the `site-refresh/education` worktree (see Lanes).

- [ ] **Step 1: Write the failing test**

Create `tests/components/EducationSection.test.jsx`:

```jsx
import { render, screen, within } from '@testing-library/react'
import EducationSection from '../../components/resume/EducationSection'

const schools = [
  { id: 'pbsc-bas', school: 'Palm Beach State College', location: 'Lake Worth, FL', credential: 'Bachelor of Applied Science', major: 'Information Management', start: 'January 2021', end: 'December 2023' },
  { id: 'pbsc-aa', school: 'Palm Beach State College', location: 'Lake Worth, FL', credential: 'Associate of Arts', start: 'January 2020', end: 'December 2021', image: '/images/aa_grad_photo.jpg' },
  { id: 'dwyer', school: 'Dwyer High School', location: '', credential: 'High School Diploma', start: 'August 2005', end: 'May 2009', image: '/images/hs_grad_photo.jpg' },
]

test('renders a region named Education with credential, school and date range for each entry', () => {
  render(<EducationSection schools={schools} />)
  const region = screen.getByRole('region', { name: 'Education' })
  expect(within(region).getAllByText('Palm Beach State College')).toHaveLength(2)
  expect(within(region).getByText('Dwyer High School')).toBeInTheDocument()
  for (const text of ['Bachelor of Applied Science', 'Associate of Arts', 'High School Diploma', 'January 2021 – December 2023', 'January 2020 – December 2021', 'August 2005 – May 2009']) {
    expect(within(region).getByText(text)).toBeInTheDocument()
  }
})

test('renders the major only when present', () => {
  render(<EducationSection schools={schools} />)
  expect(screen.getAllByText('Information Management')).toHaveLength(1)
})

test('renders an image only for schools that have one', () => {
  render(<EducationSection schools={schools} />)
  expect(screen.getAllByRole('img')).toHaveLength(2)
  expect(screen.getByRole('img', { name: 'Dwyer High School graduation photo' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Palm Beach State College graduation photo' })).toBeInTheDocument()
})

test('shows the location only when present', () => {
  render(<EducationSection schools={schools} />)
  expect(screen.getAllByText('Lake Worth, FL')).toHaveLength(2)
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npm test -- tests/components/EducationSection 2>&1 | tail -8
```

Expected: FAIL. The old component ignores the `schools` prop and imports `educationHistory.json`, so `getByText('Other School')` fails. Any failure is acceptable; the point is the test does not pass against the old code.

- [ ] **Step 3: Rewrite `components/resume/EducationSection.jsx`**

```jsx
import Image from 'next/image'
import { Card, Col, Container, Row } from 'react-bootstrap'

export default function EducationSection({ schools }) {
  return (
    <section id="education" aria-labelledby="education-heading" className="py-5">
      <Container>
        <h2 id="education-heading" className="text-center mb-4">Education</h2>
        <Row className="g-4 justify-content-center">
          {schools.map((school) => (
            <Col key={school.id} sm={8} md={6} lg={4}>
              <Card className="h-100">
                {school.image ? (
                  <Image
                    src={school.image}
                    alt={`${school.school} graduation photo`}
                    width={800}
                    height={600}
                    className="card-img-top"
                    style={{ height: 'auto' }}
                  />
                ) : null}
                <Card.Body>
                  <Card.Title as="h3" className="h5">{school.credential}</Card.Title>
                  {school.major ? <Card.Text className="mb-1">{school.major}</Card.Text> : null}
                  <Card.Subtitle className="mb-2">{school.school}</Card.Subtitle>
                  {school.location ? <Card.Text className="text-body-secondary mb-1">{school.location}</Card.Text> : null}
                  <Card.Text className="text-body-secondary">{`${school.start} – ${school.end}`}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}
```

- [ ] **Step 4: Run the test and watch it pass**

```bash
npm test -- tests/components/EducationSection 2>&1 | tail -8
```

Expected: `Tests: 4 passed`.

- [ ] **Step 5: Produce the resized graduation photos and remove the originals and the stock image**

```bash
convert public/images/aa_grad_photo.jpeg -auto-orient -resize 800x600^ -gravity center -extent 800x600 -quality 82 public/images/aa_grad_photo.jpg
convert public/images/hs_grad_photo.jpeg -auto-orient -resize 800x600^ -gravity center -extent 800x600 -quality 82 public/images/hs_grad_photo.jpg
du -h public/images/aa_grad_photo.jpg public/images/hs_grad_photo.jpg
git rm public/images/aa_grad_photo.jpeg public/images/hs_grad_photo.jpeg public/images/work-in-progress.jpg educationHistory.json
```

Expected: both new files are under 150K.

- [ ] **Step 6: Pass the data through the legacy page (two lines only)**

In `pages/resume/index.jsx`, add one import line next to the other imports:

```jsx
import education from '../../content/education.json'
```

and change the single JSX line `<EducationSection />` to:

```jsx
<EducationSection schools={education} />
```

Leave the surrounding `<section>`, `<Container>` and `<h1>` exactly as they are; Task 10 deletes this whole file. The legacy page now shows an "Education" `h1` followed by the new component's own "Education" `h2`, which is expected until Task 10.

```bash
git diff --stat pages/resume/index.jsx    # expected: 2 insertions, 1 deletion
grep -rn "educationHistory" pages components tests || echo "no stale references"
```

- [ ] **Step 7: Verify and commit**

```bash
npm run lint && npm test && npm run build 2>&1 | tail -3
git add components/resume/EducationSection.jsx tests/components/EducationSection.test.jsx public/images/aa_grad_photo.jpg public/images/hs_grad_photo.jpg pages/resume/index.jsx
git commit -m "Make Education section data-driven from education.json"
```

The orchestrator merges `site-refresh/education` per the Lanes section.

---

### Task 9: Projects section, dynamic project route and SiteHead (lane `projects`)

Build `ProjectsSection`, one `pages/portfolio/[slug].jsx` that replaces the three copy-pasted portfolio pages, and `SiteHead` so every page can get a title and description. Lane rules: the three static portfolio pages are deleted here because nothing imports them, and `next.config.js` is this lane's exclusive claim. `PortfolioSection.jsx` stays until Task 10 deletes it. Do not touch `pages/resume/index.jsx` or any stylesheet.

**Files:**
- Create: `components/resume/ProjectsSection.jsx`, `components/SiteHead.jsx`, `pages/portfolio/[slug].jsx`, `tests/components/ProjectsSection.test.jsx`, `tests/pages/projectPage.test.jsx`
- Modify: `next.config.js`
- Delete: `pages/portfolio/hangman.jsx`, `pages/portfolio/pokedex.jsx`, `pages/portfolio/to-do-list.jsx`

**Interfaces:**
- Consumes: `projects` shape and `iconFor` (Task 3).
- Produces: `ProjectsSection({ projects })` rendering `<section id="projects" aria-labelledby="projects-heading">`, wired in by Task 10; `SiteHead({ title, description, path, jsonLd? })`; `NEXT_PUBLIC_SITE_URL` inlined by `next.config.js`.

Work in the `site-refresh/projects` worktree (see Lanes).

- [ ] **Step 1: Write the failing ProjectsSection test**

Create `tests/components/ProjectsSection.test.jsx`:

```jsx
import { render, screen, within } from '@testing-library/react'
import ProjectsSection from '../../components/resume/ProjectsSection'

const projects = [
  { slug: 'hangman', name: 'Hangman', summary: 'A word game.', demoUrl: 'https://hangman.example.com', image: '/images/hangman-screenshot.png', stack: [{ name: 'React', icon: 'react' }] },
  { slug: 'pokedex', name: 'Pokedex', summary: 'A creature browser.', demoUrl: 'https://pokedex.example.com', image: '/images/pokedex-screenshot.png', stack: [{ name: 'React', icon: 'react' }] },
]

test('renders a region named Projects with a card per project linking to its page', () => {
  render(<ProjectsSection projects={projects} />)
  const region = screen.getByRole('region', { name: 'Projects' })
  expect(within(region).getByRole('link', { name: 'Hangman' })).toHaveAttribute('href', '/portfolio/hangman')
  expect(within(region).getByRole('link', { name: 'Pokedex' })).toHaveAttribute('href', '/portfolio/pokedex')
  expect(within(region).getByText('A word game.')).toBeInTheDocument()
  expect(within(region).getByText('A creature browser.')).toBeInTheDocument()
})

test('every project screenshot has a descriptive alt', () => {
  render(<ProjectsSection projects={projects} />)
  expect(screen.getByRole('img', { name: 'Hangman screenshot' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Pokedex screenshot' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npm test -- tests/components/ProjectsSection 2>&1 | tail -8
```

Expected: FAIL with `Cannot find module '../../components/resume/ProjectsSection'`.

- [ ] **Step 3: Create `components/resume/ProjectsSection.jsx`**

```jsx
import Image from 'next/image'
import Link from 'next/link'
import { Card, Col, Container, Row } from 'react-bootstrap'

export default function ProjectsSection({ projects }) {
  return (
    <section id="projects" aria-labelledby="projects-heading" className="py-5">
      <Container>
        <h2 id="projects-heading" className="text-center mb-4">Projects</h2>
        <Row className="g-4 justify-content-center">
          {projects.map((project) => (
            <Col key={project.slug} sm={6} lg={4}>
              <Card className="h-100">
                <Image
                  src={project.image}
                  alt={`${project.name} screenshot`}
                  width={640}
                  height={400}
                  className="card-img-top"
                  style={{ height: 'auto' }}
                />
                <Card.Body>
                  <Card.Title as="h3" className="h5">
                    <Link href={`/portfolio/${project.slug}`} className="stretched-link text-decoration-none">
                      {project.name}
                    </Link>
                  </Card.Title>
                  <Card.Text>{project.summary}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}
```

- [ ] **Step 4: Run the test and watch it pass**

```bash
npm test -- tests/components/ProjectsSection 2>&1 | tail -8
```

Expected: `Tests: 2 passed`.

- [ ] **Step 5: Create `components/SiteHead.jsx`** (config-like markup; verified by the build and the browser check in Task 11)

```jsx
import Head from 'next/head'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function SiteHead({ title, description, path, jsonLd }) {
  const url = `${SITE_URL}${path}`
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE_URL}/images/headshot.jpg`} />
      <meta name="twitter:card" content="summary" />
      <link rel="icon" href="/favicon.ico" />
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
    </Head>
  )
}
```

- [ ] **Step 6: Inline the site URL in `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

module.exports = {
  reactStrictMode: true,
  turbopack: { root: __dirname },
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
}
```

- [ ] **Step 7: Write the failing project page test**

```bash
mkdir -p tests/pages
```

Create `tests/pages/projectPage.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import ProjectPage, { getStaticPaths, getStaticProps } from '../../pages/portfolio/[slug]'
import projects from '../../content/projects.json'

test('getStaticPaths lists every project slug and no fallback', async () => {
  const { paths, fallback } = await getStaticPaths()
  expect(fallback).toBe(false)
  expect(paths.map((path) => path.params.slug).sort()).toEqual(projects.map((project) => project.slug).sort())
})

test('getStaticProps returns the matching project', async () => {
  const { props } = await getStaticProps({ params: { slug: projects[0].slug } })
  expect(props.project).toEqual(projects[0])
})

test('renders name, summary, a safe demo link and the stack', () => {
  const project = {
    slug: 'demo',
    name: 'Demo App',
    summary: 'Does a thing.',
    demoUrl: 'https://demo.example.com',
    image: '/images/hangman-screenshot.png',
    stack: [{ name: 'React', icon: 'react' }, { name: 'Sass', icon: 'sass' }],
  }
  render(<ProjectPage project={project} />)
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Demo App')
  expect(screen.getByText('Does a thing.')).toBeInTheDocument()
  const demo = screen.getByRole('link', { name: 'Open live demo' })
  expect(demo).toHaveAttribute('href', 'https://demo.example.com')
  expect(demo).toHaveAttribute('target', '_blank')
  expect(demo).toHaveAttribute('rel', 'noopener noreferrer')
  expect(screen.getByText(/React/)).toBeInTheDocument()
  expect(screen.getByText(/Sass/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /back to projects/i })).toHaveAttribute('href', '/#projects')
})
```

- [ ] **Step 8: Run it and watch it fail**

```bash
npm test -- tests/pages/projectPage 2>&1 | tail -8
```

Expected: FAIL with `Cannot find module '../../pages/portfolio/[slug]'`.

- [ ] **Step 9: Create `pages/portfolio/[slug].jsx` and delete the static pages**

```jsx
import Image from 'next/image'
import Link from 'next/link'
import { Button, Col, Container, Row } from 'react-bootstrap'
import SiteHead from '../../components/SiteHead'
import { iconFor } from '../../components/iconMap'
import projects from '../../content/projects.json'

export async function getStaticPaths() {
  return {
    paths: projects.map((project) => ({ params: { slug: project.slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const project = projects.find((candidate) => candidate.slug === params.slug)
  return { props: { project } }
}

export default function ProjectPage({ project }) {
  return (
    <>
      <SiteHead
        title={`${project.name} · David Daniel`}
        description={project.summary}
        path={`/portfolio/${project.slug}`}
      />
      <main>
        <Container className="py-5">
          <Link href="/#projects" className="d-inline-block mb-3">Back to projects</Link>
          <h1>{project.name}</h1>
          <p className="lead">{project.summary}</p>
          <Row className="g-4 align-items-start">
            <Col md={7}>
              <Image
                src={project.image}
                alt={`${project.name} screenshot`}
                width={960}
                height={600}
                style={{ width: '100%', height: 'auto' }}
                className="rounded border"
                priority
              />
            </Col>
            <Col md={5}>
              <Button as="a" href={project.demoUrl} target="_blank" rel="noopener noreferrer" variant="primary" className="mb-4">
                Open live demo
              </Button>
              <h2 className="h5">Built with</h2>
              <ul className="list-inline">
                {project.stack.map((tool) => {
                  const Icon = iconFor(tool.icon)
                  return (
                    <li key={tool.name} className="list-inline-item me-3">
                      <Icon aria-hidden="true" /> {tool.name}
                    </li>
                  )
                })}
              </ul>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  )
}
```

```bash
git rm pages/portfolio/hangman.jsx pages/portfolio/pokedex.jsx pages/portfolio/to-do-list.jsx
```

- [ ] **Step 10: Run the page test and watch it pass**

```bash
npm test -- tests/pages/projectPage 2>&1 | tail -8
```

Expected: `Tests: 3 passed`.

- [ ] **Step 11: Verify the build generates three project pages and commit**

```bash
npm run lint && npm test && npm run build 2>&1 | tail -20
```

Expected route table includes `/portfolio/[slug]` with the three paths `/portfolio/hangman`, `/portfolio/pokedex`, `/portfolio/to-do-list` listed beneath it, and no `/portfolio/menu-trainer`. The old `PortfolioSection` cards on `/resume` still link to those same URLs, so nothing breaks.

```bash
git add components/resume/ProjectsSection.jsx components/SiteHead.jsx "pages/portfolio/[slug].jsx" tests/components/ProjectsSection.test.jsx tests/pages/projectPage.test.jsx next.config.js
git commit -m "Replace copy-pasted portfolio pages with a projects.json-driven dynamic route and add SiteHead"
```

The orchestrator merges `site-refresh/projects` per the Lanes section. Once all six lanes are merged and the post-merge `npm ci && npm run lint && npm test && npm run build` passes on `site-refresh`, Task 10 begins.

---

### Task 10: Page assembly — resume at the root, section nav, footer, metadata, fonts (barrier)

Make `/` the resume, redirect `/resume`, add the sticky section navigation and the contact footer, emit JSON-LD, switch to `next/font`, finish the stylesheet, and retire every superseded component, data file and image the lanes left in place. Runs alone on `site-refresh` after all six lanes are merged.

**Files:**
- Create: `components/SectionNav.jsx`, `components/SocialLinks.jsx`, `components/Footer.jsx`, `components/personJsonLd.js`, `tests/components/SectionNav.test.jsx`, `tests/components/SocialLinks.test.jsx`, `tests/components/Footer.test.jsx`, `tests/components/personJsonLd.test.js`, `tests/pages/home.test.jsx`
- Modify: `pages/index.jsx` (full rewrite), `pages/_app.js`, `pages/_document.js`, `next.config.js`, `styles/globals.css` (full rewrite), `components/resume/HeroSection.jsx`
- Delete: `pages/resume/index.jsx`, `styles/Home.module.css`, `styles/resume.module.css`, `tests/smoke/home.test.jsx`, `components/FrameworkIcons.jsx`, `components/resume/AboutMeSection.jsx`, `components/resume/SocialSection.jsx`, `components/resume/Carousel.jsx`, `components/resume/JobAccordion.jsx`, `components/resume/JobHistorySection.jsx`, `components/resume/PortfolioSection.jsx`, `workHistory.json`, `public/images/headshot.jpeg`, `public/images/pic1.jpg`, `public/images/pic2.jpg`, `public/images/pic3.jpg`

**Interfaces:**
- Consumes: every section component (Tasks 4, 6–9), `SiteHead` (Task 9), all five content files.
- Produces: `SectionNav({ name })`, `SocialLinks({ links, size })`, `Footer({ profile })`, `buildPersonJsonLd(profile, siteUrl)`, and the finished `pages/index.jsx`.

- [ ] **Step 1: Write the failing JSON-LD test**

Create `tests/components/personJsonLd.test.js`:

```js
import { buildPersonJsonLd } from '../../components/personJsonLd'

const profile = {
  name: 'Test Person',
  title: 'Software Engineer',
  location: 'Somewhere, FL',
  email: 'test@example.com',
  summary: 'Builds things.',
  headshot: '/images/headshot.jpg',
  resumePdf: '/Test_Resume.pdf',
  social: [
    { label: 'GitHub', url: 'https://github.com/test', icon: 'github' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/test', icon: 'linkedin' },
  ],
}

test('builds a schema.org Person with absolute urls and every social profile', () => {
  expect(buildPersonJsonLd(profile, 'https://example.com')).toEqual({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Test Person',
    jobTitle: 'Software Engineer',
    email: 'mailto:test@example.com',
    url: 'https://example.com',
    image: 'https://example.com/images/headshot.jpg',
    address: { '@type': 'PostalAddress', addressLocality: 'Somewhere, FL' },
    sameAs: ['https://github.com/test', 'https://linkedin.com/in/test'],
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npm test -- tests/components/personJsonLd 2>&1 | tail -6
```

Expected: FAIL with `Cannot find module '../../components/personJsonLd'`.

- [ ] **Step 3: Create `components/personJsonLd.js`**

```js
export function buildPersonJsonLd(profile, siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    email: `mailto:${profile.email}`,
    url: siteUrl,
    image: `${siteUrl}${profile.headshot}`,
    address: { '@type': 'PostalAddress', addressLocality: profile.location },
    sameAs: profile.social.map((link) => link.url),
  }
}
```

- [ ] **Step 4: Run it and watch it pass**

```bash
npm test -- tests/components/personJsonLd 2>&1 | tail -6
```

Expected: `Tests: 1 passed`.

- [ ] **Step 5: Write the failing SocialLinks test**

Create `tests/components/SocialLinks.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import SocialLinks from '../../components/SocialLinks'

const links = [
  { label: 'GitHub', url: 'https://github.com/test', icon: 'github' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/test', icon: 'linkedin' },
]

test('renders one labelled, safe external link per entry', () => {
  render(<SocialLinks links={links} />)
  const rendered = screen.getAllByRole('link')
  expect(rendered).toHaveLength(2)
  for (const link of rendered) {
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  }
  expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/test')
  expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://linkedin.com/in/test')
})
```

- [ ] **Step 6: Run it and watch it fail**

```bash
npm test -- tests/components/SocialLinks 2>&1 | tail -6
```

Expected: FAIL with `Cannot find module '../../components/SocialLinks'`.

- [ ] **Step 7: Create `components/SocialLinks.jsx` and use it from `HeroSection`**

```jsx
import { iconFor } from './iconMap'

export default function SocialLinks({ links, size = '1.75rem' }) {
  return (
    <ul className="list-inline mb-0">
      {links.map((link) => {
        const Icon = iconFor(link.icon)
        return (
          <li key={link.url} className="list-inline-item">
            <a href={link.url} aria-label={link.label} target="_blank" rel="noopener noreferrer" className="social-link">
              <Icon size={size} aria-hidden="true" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
```

In `components/resume/HeroSection.jsx`: remove `import { iconFor } from '../iconMap'`, add `import SocialLinks from '../SocialLinks'`, and replace the whole `<ul className="list-inline mb-0">…</ul>` block with `<SocialLinks links={profile.social} />`.

- [ ] **Step 8: Run SocialLinks and HeroSection tests and watch both pass**

```bash
npm test -- tests/components/SocialLinks tests/components/HeroSection 2>&1 | tail -6
```

Expected: `Tests: 6 passed`.

- [ ] **Step 9: Write the failing SectionNav and Footer tests**

Create `tests/components/SectionNav.test.jsx`:

```jsx
import { render, screen, within } from '@testing-library/react'
import SectionNav from '../../components/SectionNav'

test('renders a navigation landmark with an anchor link to every section', () => {
  render(<SectionNav name="Test Person" />)
  const nav = screen.getByRole('navigation', { name: 'Section navigation' })
  expect(within(nav).getByRole('link', { name: 'Test Person' })).toHaveAttribute('href', '#top')
  for (const [label, id] of [['Skills', 'skills'], ['Experience', 'experience'], ['Projects', 'projects'], ['Education', 'education'], ['Contact', 'contact']]) {
    expect(within(nav).getByRole('link', { name: label })).toHaveAttribute('href', `#${id}`)
  }
})
```

Create `tests/components/Footer.test.jsx`:

```jsx
import { render, screen, within } from '@testing-library/react'
import Footer from '../../components/Footer'

const profile = {
  name: 'Test Person',
  title: 'Software Engineer',
  location: 'Somewhere, FL',
  email: 'test@example.com',
  summary: 'Builds things.',
  headshot: '/images/headshot.jpg',
  resumePdf: '/Test_Resume.pdf',
  social: [{ label: 'GitHub', url: 'https://github.com/test', icon: 'github' }],
}

test('renders a contentinfo landmark with a Contact heading, email link and social links', () => {
  render(<Footer profile={profile} />)
  const footer = screen.getByRole('contentinfo')
  expect(footer).toHaveAttribute('id', 'contact')
  expect(within(footer).getByRole('heading', { level: 2, name: 'Contact' })).toBeInTheDocument()
  expect(within(footer).getByRole('link', { name: 'test@example.com' })).toHaveAttribute('href', 'mailto:test@example.com')
  expect(within(footer).getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/test')
  expect(within(footer).getByText(new RegExp(`© ${new Date().getFullYear()} Test Person`))).toBeInTheDocument()
})
```

- [ ] **Step 10: Run them and watch both fail**

```bash
npm test -- tests/components/SectionNav tests/components/Footer 2>&1 | tail -8
```

Expected: two `Cannot find module` failures.

- [ ] **Step 11: Create `components/SectionNav.jsx` and `components/Footer.jsx`**

`components/SectionNav.jsx`:

```jsx
import { Container, Nav, Navbar } from 'react-bootstrap'

const SECTIONS = [
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
]

export default function SectionNav({ name }) {
  return (
    <Navbar as="nav" sticky="top" expand="sm" bg="body-tertiary" aria-label="Section navigation">
      <Container>
        <Navbar.Brand href="#top">{name}</Navbar.Brand>
        <Navbar.Toggle aria-controls="section-nav" />
        <Navbar.Collapse id="section-nav">
          <Nav className="ms-auto">
            {SECTIONS.map((section) => (
              <Nav.Link key={section.id} href={`#${section.id}`}>{section.label}</Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
```

`components/Footer.jsx`:

```jsx
import { Container } from 'react-bootstrap'
import SocialLinks from './SocialLinks'

export default function Footer({ profile }) {
  return (
    <footer id="contact" aria-labelledby="contact-heading" className="py-5 border-top">
      <Container className="text-center">
        <h2 id="contact-heading" className="h4">Contact</h2>
        <p>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
        <div className="d-flex justify-content-center mb-3">
          <SocialLinks links={profile.social} size="1.5rem" />
        </div>
        <p className="small text-body-secondary mb-0">© {new Date().getFullYear()} {profile.name}</p>
      </Container>
    </footer>
  )
}
```

- [ ] **Step 12: Run them and watch both pass**

```bash
npm test -- tests/components/SectionNav tests/components/Footer 2>&1 | tail -8
```

Expected: `Tests: 2 passed`.

- [ ] **Step 13: Write the failing home page test**

```bash
git rm tests/smoke/home.test.jsx
```

Create `tests/pages/home.test.jsx`:

```jsx
import { render, screen, within } from '@testing-library/react'
import Home from '../../pages/index'

test('renders one h1 and a named region for every resume section plus a footer', () => {
  render(<Home />)
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  for (const name of ['Skills', 'Experience', 'Projects', 'Education']) {
    expect(screen.getByRole('region', { name })).toBeInTheDocument()
  }
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
})

test('section navigation links to every section', () => {
  render(<Home />)
  const nav = screen.getByRole('navigation', { name: 'Section navigation' })
  for (const [label, id] of [['Skills', 'skills'], ['Experience', 'experience'], ['Projects', 'projects'], ['Education', 'education'], ['Contact', 'contact']]) {
    expect(within(nav).getByRole('link', { name: label })).toHaveAttribute('href', `#${id}`)
  }
})

test('shows the real summary, not the old student bio', () => {
  render(<Home />)
  expect(screen.getByText(/Full-stack software engineer with four years/)).toBeInTheDocument()
  expect(screen.queryByText(/IT student/)).not.toBeInTheDocument()
})
```

- [ ] **Step 14: Run it and watch it fail**

```bash
npm test -- tests/pages/home 2>&1 | tail -8
```

Expected: FAIL — the current `pages/index.jsx` is the landing page with no regions.

- [ ] **Step 15: Rewrite `pages/index.jsx` and delete the old resume route**

```jsx
import Footer from '../components/Footer'
import SectionNav from '../components/SectionNav'
import SiteHead from '../components/SiteHead'
import { buildPersonJsonLd } from '../components/personJsonLd'
import EducationSection from '../components/resume/EducationSection'
import ExperienceSection from '../components/resume/ExperienceSection'
import HeroSection from '../components/resume/HeroSection'
import ProjectsSection from '../components/resume/ProjectsSection'
import SkillsSection from '../components/resume/SkillsSection'
import education from '../content/education.json'
import experience from '../content/experience.json'
import profile from '../content/profile.json'
import projects from '../content/projects.json'
import skills from '../content/skills.json'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function Home() {
  return (
    <>
      <SiteHead
        title={`${profile.name} · ${profile.title}`}
        description={profile.summary}
        path="/"
        jsonLd={buildPersonJsonLd(profile, SITE_URL)}
      />
      <SectionNav name={profile.name} />
      <main id="top">
        <HeroSection profile={profile} />
        <SkillsSection skillGroups={skills} />
        <ExperienceSection roles={experience} />
        <ProjectsSection projects={projects} />
        <EducationSection schools={education} />
      </main>
      <Footer profile={profile} />
    </>
  )
}
```

```bash
git rm pages/resume/index.jsx styles/Home.module.css styles/resume.module.css
git rm components/FrameworkIcons.jsx components/resume/AboutMeSection.jsx components/resume/SocialSection.jsx components/resume/Carousel.jsx components/resume/JobAccordion.jsx components/resume/JobHistorySection.jsx components/resume/PortfolioSection.jsx workHistory.json
git rm public/images/headshot.jpeg public/images/pic1.jpg public/images/pic2.jpg public/images/pic3.jpg
grep -rn "Home.module\|resume.module\|FrameworkIcons\|AboutMeSection\|SocialSection\|Carousel\|JobAccordion\|JobHistorySection\|PortfolioSection\|workHistory\|headshot.jpeg\|pic[123].jpg" pages components tests || echo "no stale references"
```

Expected: `no stale references`. The legacy page was the only importer of every deleted file, so the build stays green once the new `pages/index.jsx` above is in place.

- [ ] **Step 16: Run the home test and watch it pass**

```bash
npm test -- tests/pages/home 2>&1 | tail -8
```

Expected: `Tests: 3 passed`.

- [ ] **Step 17: Redirect `/resume` to `/`**

Add a `redirects` function to `next.config.js` so the exported object becomes:

```js
/** @type {import('next').NextConfig} */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

module.exports = {
  reactStrictMode: true,
  turbopack: { root: __dirname },
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  async redirects() {
    return [{ source: '/resume', destination: '/', permanent: true }]
  },
}
```

- [ ] **Step 18: Self-host the heading font and finish `_document`**

`pages/_app.js`:

```jsx
import { Cormorant_SC } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.css'

const headingFont = Cormorant_SC({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-heading',
  display: 'swap',
})

export default function MyApp({ Component, pageProps }) {
  return (
    <div className={headingFont.variable}>
      <Component {...pageProps} />
    </div>
  )
}
```

`pages/_document.js`:

```jsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function MyDocument() {
  return (
    <Html lang="en" data-bs-theme="dark">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

- [ ] **Step 19: Rewrite `styles/globals.css`**

```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: 4.5rem; /* keep anchored sections clear of the sticky nav */
}

h1,
h2,
h3,
.navbar-brand {
  font-family: var(--font-heading), Georgia, serif;
}

.skill-icon,
.social-link {
  color: inherit;
  transition: color 0.15s ease-in-out;
}

.skill-icon:hover,
.social-link:hover {
  color: var(--bs-primary);
}
```

- [ ] **Step 20: Lint, test, build and check the redirect**

```bash
npm run lint && npm test && npm run build 2>&1 | tail -20
npx next start -p 3123 &
sleep 4
curl -sI http://localhost:3123/resume | grep -i -E "^HTTP|^location"
curl -s http://localhost:3123/ | grep -o '<title>[^<]*</title>'
curl -sI http://localhost:3123/David_Daniel_Resume.pdf | head -1
kill %1
```

Expected: build route table is exactly `/`, `/404`, `/portfolio/[slug]` (3 paths). Redirect prints `HTTP/1.1 308 Permanent Redirect` and `location: /`. Title prints `<title>David Daniel · Software Engineer</title>`. PDF prints `HTTP/1.1 200 OK`.

- [ ] **Step 21: Commit**

```bash
git add pages components tests styles next.config.js
git status --porcelain   # confirm only intended paths are staged
git commit -m "Serve the resume at the root with section nav, contact footer, JSON-LD and self-hosted heading font"
```

---

### Task 11: CI, README and final acceptance check

Add a GitHub Actions workflow, write a README that explains how to edit content, and run the spec §7 acceptance checks including the headless browser pass.

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `README.md` (full rewrite)

**Interfaces:**
- Consumes: everything.
- Produces: a green branch ready for the user to merge and push.

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main, site-refresh]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - name: Audit production dependencies
        run: npm audit --omit=dev --audit-level=high
```

- [ ] **Step 2: Rewrite `README.md`**

```markdown
# David Daniel — resume site

Single-page resume built with Next.js (Pages Router), React and Bootstrap, deployed on Vercel.

## Run it

    npm install
    npm run dev        # http://localhost:3000
    npm run lint
    npm test
    npm run build && npm start

Node 20.9 or newer. Use npm only; do not commit a pnpm or yarn lockfile.

## Edit the content

All copy lives in `content/`. Components never hardcode resume text.

| File | What it drives |
|---|---|
| `content/profile.json` | Name, title, location, email, summary, optional `about` paragraph, headshot, PDF path, social links |
| `content/skills.json` | Skill groups; each skill has a `name` and an `icon` key |
| `content/experience.json` | Roles newest first: positions held (most senior first), dates, resume `highlights`, optional first-person `notes` |
| `content/education.json` | Schools newest first; `major` and `image` are optional |
| `content/projects.json` | Project cards and `/portfolio/<slug>` pages |

Icon keys are looked up in `components/iconMap.js`; an unknown key renders a generic code icon. `tests/content/content.test.js` fails the build if any file contains placeholder copy or a phone number.

## Update the PDF

`public/David_Daniel_Resume.pdf` is generated from the Word resume with the phone number removed. To regenerate: unpack the `.docx`, strip the phone from `word/document.xml`, re-zip, then convert with LibreOffice (`soffice --headless --convert-to pdf`). Confirm with `pdftotext` that no phone number remains before committing.

## Layout

- `pages/index.jsx` composes the sections; `pages/portfolio/[slug].jsx` statically generates one page per project.
- `components/resume/*` are props-only section components.
- `components/SiteHead.jsx` sets title, description, canonical and Open Graph tags; `components/personJsonLd.js` builds the schema.org Person block.
- `/resume` permanently redirects to `/`.
```

- [ ] **Step 3: Run the full local gate**

```bash
npm run lint && npm test && npm run build 2>&1 | tail -20
npm audit --omit=dev --audit-level=high
grep -rl '561-629-3906' --exclude-dir=node_modules --exclude-dir=.next . || echo "phone absent from repo"
grep -rn "@mui\|@emotion\|workHistory\|educationHistory\|FrameworkIcons\|PortfolioSection\|JobAccordion" pages components tests || echo "no stale references"
```

Expected: all pass, `phone absent from repo`, `no stale references`.

- [ ] **Step 4: Headless browser acceptance pass**

Start the production server, then run the check script via the browser-automation skill.

```bash
npx next start -p 3123 &
sleep 4
QA=$(mktemp -d)
cat > "$QA/accept.mjs" <<'EOF'
export default async function run(page) {
  const base = 'http://localhost:3123'
  const routes = ['/', '/portfolio/hangman']
  const viewports = { desktop: { width: 1280, height: 900 }, phone: { width: 390, height: 844 } }
  const failures = []
  for (const [viewportName, size] of Object.entries(viewports)) {
    await page.setViewportSize(size)
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      const facts = await page.evaluate(() => {
        const dark = 'rgb(33, 37, 41)'
        return {
          title: document.title,
          hasDescription: Boolean(document.querySelector('meta[name="description"]')),
          lang: document.documentElement.lang,
          nestedBody: document.querySelectorAll('body body').length,
          darkCardTitles: [...document.querySelectorAll('.card-title')].filter((el) => getComputedStyle(el).color === dark).length,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          unlabelledIconLinks: [...document.querySelectorAll('a')].filter((a) => !a.textContent.trim() && !a.getAttribute('aria-label')).length,
          unsafeExternalLinks: [...document.querySelectorAll('a[href^="http"]')].filter((a) => a.target !== '_blank' || !a.rel.includes('noopener')).length,
          h1Count: document.querySelectorAll('h1').length,
          hasJsonLd: Boolean(document.querySelector('script[type="application/ld+json"]')),
        }
      })
      const label = `${viewportName} ${route}`
      if (!facts.title) failures.push(`${label}: empty title`)
      if (!facts.hasDescription) failures.push(`${label}: no meta description`)
      if (facts.lang !== 'en') failures.push(`${label}: lang=${facts.lang}`)
      if (facts.nestedBody) failures.push(`${label}: nested body`)
      if (facts.darkCardTitles) failures.push(`${label}: ${facts.darkCardTitles} unreadable card titles`)
      if (facts.overflow) failures.push(`${label}: horizontal overflow`)
      if (facts.unlabelledIconLinks) failures.push(`${label}: ${facts.unlabelledIconLinks} unlabelled icon links`)
      if (facts.unsafeExternalLinks) failures.push(`${label}: ${facts.unsafeExternalLinks} unsafe external links`)
      if (facts.h1Count !== 1) failures.push(`${label}: ${facts.h1Count} h1 elements`)
      if (route === '/' && !facts.hasJsonLd) failures.push(`${label}: no JSON-LD`)
    }
  }
  return { failures, ok: failures.length === 0 }
}
EOF
node /home/daviddaniel/.claude/skills/browser-automation/browser.mjs http://localhost:3123/ --script "$QA/accept.mjs" --timeout 60000
kill %1
```

Expected: the `script` result is `{ "failures": [], "ok": true }` and the report shows `console errors/warnings (0)`. Any failure names the route, viewport and check; fix it and re-run before committing.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml README.md
git commit -m "Add CI workflow and rewrite README for the content-driven site"
git log --oneline main..site-refresh
```

Expected: the spec/plan commit, one commit per task, and six `Merge lane <lane>` merge commits on `site-refresh`.

- [ ] **Step 6: Hand off**

Do not push. Report to the user: the branch name, the commit list, the acceptance results, and that merging `site-refresh` into `main` and pushing triggers the Vercel deploy. Remind them that `NEXT_PUBLIC_SITE_URL` may be set in the Vercel project if the production domain differs from `VERCEL_PROJECT_PRODUCTION_URL`.

---

## Self-review

**Spec coverage.** §2 findings → Content (T3, T6 carousel removal, T9 summaries, content test), Readability (T2 `data-bs-theme`), Phone layout (T4 breakpoints and visible labels), Security (T2), Metadata/a11y (T2 `lang`, T6/T10 `aria-label` and `rel`, T9 SiteHead, T10 JSON-LD and single h1), Structure (T2 Bootstrap in `_app`, nested body, config; T10 redirect), Duplication (T7, T8, T9), Assets (T1 unused files, T6 headshot and stock photos, T8 graduation photo), Tooling (T1, T2, T11). §3.1 resume text → T3 verbatim, T5 PDF. §3.2 carried-forward roles, schools and skills → T3 (ten roles with real notes, two schools, merged skill groups), T7, T8, T4. §3.3 placeholder strings → T3 content test regex and T10 home test. §4 decisions 1–11 → T3/T7/T8, T5, T2, T2, T1, T10, all section tasks, T9, T6, T3, T9/T10 respectively. §7 acceptance → T11 Steps 3–4 plus T10 Step 20.

**Lane safety.** Tasks 4–9 create files only within their claims in the Lanes table; none edits `styles/*.css`, `pages/index.jsx`, `package.json` or another lane's files. The only shared-file write inside a lane is Task 8's two-line change to `pages/resume/index.jsx`, which no other lane touches. Every file a lane leaves in place (old components, `workHistory.json`, `headshot.jpeg`, the stock photos) is deleted in Task 10 Step 15, and the grep there proves nothing still imports them. Task 3 owns `components/iconMap.js` so that Tasks 4, 6 and 9 consume it rather than race to create it.

**Placeholder scan.** No TBD/TODO. Every code step shows full code. Contingencies (ESLint import form, icon export names) name the exact alternative.

**Type consistency.** `experience` entries use `positions[]` (never `title`) in T3, T7 and the content test; `education` entries use `start`/`end` (never `completed`) in T3, T8 and the content test. `iconFor(key)` used in T4, T6, T9, T10 with string keys from `content/*.json`. `SocialLinks({ links, size })` consumes `profile.social` entries `{ label, url, icon }` in T6 (via Hero, after T10 Step 7) and T10 (Footer). `SkillsSection({ skillGroups })`, `ExperienceSection({ roles })`, `EducationSection({ schools })`, `ProjectsSection({ projects })`, `HeroSection({ profile })`, `Footer({ profile })`, `SectionNav({ name })`, `SiteHead({ title, description, path, jsonLd })`, `buildPersonJsonLd(profile, siteUrl)` — names match between definition and every call site in `pages/index.jsx` and `pages/portfolio/[slug].jsx`.
