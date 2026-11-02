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

test('renders a contentinfo landmark with a call-to-action heading, email link and social links', () => {
  render(<Footer profile={profile} />)
  const footer = screen.getByRole('contentinfo')
  expect(footer).toHaveAttribute('id', 'contact')
  expect(within(footer).getByRole('heading', { level: 2, name: "Let's work together" })).toBeInTheDocument()
  expect(within(footer).getByRole('link', { name: 'test@example.com' })).toHaveAttribute('href', 'mailto:test@example.com')
  expect(within(footer).getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/test')
  expect(within(footer).getByText(new RegExp(`© ${new Date().getFullYear()} Test Person`))).toBeInTheDocument()
})
