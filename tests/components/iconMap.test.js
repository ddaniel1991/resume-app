import { FALLBACK_ICON, KNOWN_ICON_KEYS, brandColorFor, iconFor } from '../../components/iconMap'
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

test('a branded key returns its hex brand color', () => {
  expect(brandColorFor('react')).toBe('#61DAFB')
})

test('an unknown key and a key with no brand color return undefined', () => {
  expect(brandColorFor('definitely-not-a-key')).toBeUndefined()
  expect(brandColorFor('sql')).toBeUndefined()
})

test('keys whose brand color is near-black use white on the dark theme', () => {
  expect(brandColorFor('nextjs')).toBe('#FFFFFF')
  expect(brandColorFor('express')).toBe('#FFFFFF')
})
