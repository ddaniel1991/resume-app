# David Daniel — resume site

Single-page resume built with Next.js (Pages Router) and React with CSS modules, deployed on Vercel from `main`.

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
| `content/profile.json` | Name, title, location, email, summary, optional `about` paragraph, headshot, `resumePdf` path, social links |
| `content/skills.json` | Skill groups; each skill has a `name` and an `icon` key |
| `content/experience.json` | Roles newest first: company, positions held (most senior first), dates, resume `highlights`, optional first-person `notes` |
| `content/education.json` | Schools newest first; `major` and `image` are optional |
| `content/projects.json` | Project cards and `/portfolio/<slug>` pages |

Icon keys are looked up in `components/iconMap.js`; an unknown key renders a generic code icon. `tests/content/content.test.js` fails if any file contains placeholder copy or a phone number.

## Update the PDF

`public/David_Daniel_Resume.pdf` is generated from the Word resume with the phone number removed. To regenerate: unpack the `.docx`, strip the phone from `word/document.xml`, re-zip, then convert with LibreOffice (`soffice --headless --convert-to pdf`). Confirm with `pdftotext` that no phone number remains before committing.

## Layout

- `pages/index.jsx` composes the sections; `pages/portfolio/[slug].jsx` statically generates one page per project.
- `components/resume/*` are props-only section components.
- `components/SiteHead.jsx` sets title, description, canonical and Open Graph tags; `components/personJsonLd.js` builds the schema.org Person block.
- `/resume` permanently redirects to `/`.

## Deploy

Merging to `main` deploys on Vercel. Absolute URLs use `NEXT_PUBLIC_SITE_URL`, falling back to `VERCEL_PROJECT_PRODUCTION_URL`; set the former in the Vercel project if the production domain differs.

CI (`.github/workflows/ci.yml`) runs lint, tests, build and a production dependency audit on pushes to `main` and `site-refresh` and on pull requests.
