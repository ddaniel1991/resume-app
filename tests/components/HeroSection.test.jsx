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
