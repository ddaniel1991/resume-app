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

test('offers a menu toggle for the section links', () => {
  render(<SectionNav name="Test Person" />)
  expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-controls', 'section-nav')
})
