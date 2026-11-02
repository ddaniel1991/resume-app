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
