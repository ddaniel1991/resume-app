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

test('places Skills directly after Education', () => {
  render(<Home />)
  const education = screen.getByRole('region', { name: 'Education' })
  const skills = screen.getByRole('region', { name: 'Skills' })
  expect(education.compareDocumentPosition(skills) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})

test('section navigation lists sections in page order', () => {
  render(<Home />)
  const nav = screen.getByRole('navigation', { name: 'Section navigation' })
  const labels = within(nav).getAllByRole('link').map((link) => link.textContent).slice(1)
  expect(labels).toEqual(['Experience', 'Education', 'Skills', 'Projects', 'Gallery', 'Contact'])
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
