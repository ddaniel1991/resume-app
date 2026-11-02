# Visual Redesign: Design Contract

Date: 2026-10-30
Branch: `redesign` (local; lanes branch from it as `redesign--lane-<name>`)

## Goal

Give the one-page resume a distinct visual identity and a clear hierarchy, keeping every piece of content, the section ids, the accessibility structure (one `h1`, each section labelled by its `h2`) and the data shapes in `content/*.json` unchanged unless a lane below says otherwise.

## Critique that drives the work

- Stock Bootstrap dark: flat grey, one heading font, no accent, no depth.
- Every section is the same centered `h2` in a padded container; nothing sets rhythm or priority.
- Hero: a small circular photo beside a wall of text and generic buttons; the strongest facts (14 states, 8 integrations) are buried in bullets.
- Experience: an accordion that hides the main job's bullets and shows empty bodies for four roles.
- Projects: three cards with different screenshot shapes (hangman is portrait); the tech stack in `projects.json` is never shown.
- Education: two large photo cards carrying the same weight as the projects.
- Skills: a flat grid of icons with no grouping container.

## Shared contract (already in `styles/globals.css` and `pages/_app.js`)

Tokens on `:root`: `--site-bg`, `--site-bg-raised`, `--site-surface`, `--site-surface-hover`, `--site-border`, `--site-border-strong`, `--site-text-muted`, `--site-accent` (periwinkle `#7c9cff`), `--site-accent-alt` (teal `#5eead4`), `--site-on-accent`, `--site-gradient`, `--site-radius`, `--site-shadow`.

Fonts: headings `var(--font-heading)` (Cormorant SC), body `var(--font-body)` (Inter, set as the Bootstrap body font).

Utility classes lanes use instead of re-inventing them:

| Class | Use |
|---|---|
| `site-section` | vertical padding of a section's root `<section>` |
| `section-title` | the section's `h2`, left aligned, with the gradient bar under it |
| `text-gradient` | gradient-filled text (hero name) |
| `glass-card`, `glass-card-interactive` | translucent bordered surface; interactive adds the hover lift |
| `btn-accent`, `btn-ghost` | primary (gradient) and secondary (outlined) pill links/buttons |
| `reveal` | scroll-in fade; add to a section's main block, never to the `h1` |
| `social-link` | icon link hover colour |

Rules for lanes:

- Style your own component in a CSS Module next to it (`components/resume/<Name>.module.css`); do **not** edit `styles/globals.css`, `pages/_app.js`, `pages/_document.js` or `pages/index.jsx`.
- Use the tokens (`var(--site-*)`); no new hard-coded brand colours except the per-skill brand colours already provided by `brandColorFor`.
- Keep each section's root element, its `id`, `aria-labelledby` and the `h2` id exactly as they are now. Keep one `h1` on the page (hero only).
- Mobile first: everything must work at 390px with no horizontal scroll; tap targets at least 44px.
- Respect `prefers-reduced-motion` (the global contract already disables `.reveal`; any motion you add must do the same).
- Update or add tests for any behaviour you change. Tests assert roles, names and text, not class names.

## Lane recipes

**hero** (`HeroSection.jsx`, `HeroSection.module.css`, `content/profile.json`, `tests/content/content.test.js`, `tests/components/HeroSection.test.jsx`): a two-column hero at md and up (copy left, portrait right), stacked on mobile. Name as the `h1` with `text-gradient`; title as a muted large line; the summary as the lead paragraph (max-width about 38rem); location with icon; `btn-accent` "Download resume (PDF)" and `btn-ghost` "Email me"; social icons below. The portrait gets a gradient ring and a soft glow behind it, sized larger than today (about 320px at md and up). Add an optional `stats` array to `profile.json` (`[{ "value": "14", "label": "states in the ELT rewrite rollout" }, ...]`, three entries drawn only from the resume: 14 states ELT rollout; 8 new state DMV title integrations; ~20 backend services modernized) rendered as a three-up strip of `glass-card`s under the hero copy; extend the content test to validate the shape when present (non-empty strings).

**nav** (`SectionNav.jsx`, `SectionNav.module.css`, `Footer.jsx`, `Footer.module.css`, tests): translucent sticky nav with a backdrop blur and a hairline bottom border; brand uses the heading font; links muted with accent on hover. Footer becomes a closing call to action: a larger heading line, the email as a `btn-accent`, social icons, then the copyright. Keep `id="contact"` and its labelled `h2`.

**experience** (`ExperienceSection.jsx`, `ExperienceSection.module.css`, `tests/components/ExperienceSection.test.jsx`): replace the accordion with a vertical timeline (a left rail with a node per role on md and up). The newest role is a featured `glass-card` with every highlight visible (no collapse). Older roles are compact entries: company, positions, dates; roles with `notes` show them inside a native `<details>`/`<summary>` ("Read more"); roles with neither highlights nor notes render as a plain one-line entry with no expander. Dates are shown prominently per entry. Keep the `section#experience` + `h2#experience-heading`.

**projects** (`ProjectsSection.jsx`, `ProjectsSection.module.css`, `tests/components/ProjectsSection.test.jsx`, and the visual treatment of `pages/portfolio/[slug].jsx` with its test): three equal `glass-card glass-card-interactive` cards; the screenshot sits in a fixed 16:10 frame with `object-fit: cover` and `object-position: top` so portrait images do not make a tall card; below it the name (the stretched link to `/portfolio/<slug>`), the summary, and a row of the project's `stack` as small icon+name tags using `iconFor`. Keep the card heading as an `h3` and the link name.

**skills** (`SkillsSection.jsx`, `SkillsSection.module.css`, `tests/components/SkillsSection.test.jsx`): each category becomes a `glass-card` titled by its `h3`; inside, the existing aligned `skill-grid` of icon-over-name cells at a smaller size. Keep the brand-colour hover (`brandColorFor`, `--skill-brand-color`) and move the `.skill-grid`/`.skill-cell`/`.skill-icon` rules into the module (they are no longer in `globals.css`). Lay the category cards out two per row at lg, one per row below.

**education** (`EducationSection.jsx`, `EducationSection.module.css`, `tests/components/EducationSection.test.jsx`): a compact two-entry list, each a `glass-card` row with a small round photo (about 72px, `object-fit: cover`), the credential as the `h3`, school, location and dates. No full-width card images.

## Done when

`npm run lint && npm test && npm run build` pass, the page renders with no horizontal scroll at 390px and 1280px (controller verifies with screenshots), no section regresses its a11y structure, and nothing in `docs/`, `content/` (other than `profile.json` `stats`) changes.
