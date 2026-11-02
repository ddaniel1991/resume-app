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

test('puts the section h2 above one h3 per role with no skipped levels', () => {
  render(<ExperienceSection roles={roles} />)
  expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toBeInTheDocument()
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(roles.length)
  expect(screen.queryByRole('heading', { level: 4 })).not.toBeInTheDocument()
})

test('lists earlier positions only for roles that had more than one', () => {
  render(<ExperienceSection roles={roles} />)
  expect(screen.getAllByText('Previously:')).toHaveLength(1)
  expect(screen.getByText(/Junior Engineer/)).toBeInTheDocument()
})

test('shows each role as a year range without months', () => {
  render(<ExperienceSection roles={roles} />)
  expect(screen.getByText('2022 – Present')).toBeInTheDocument()
  expect(screen.getByText('2015 – 2017')).toBeInTheDocument()
  expect(screen.getByText('2018 – 2020')).toBeInTheDocument()
  expect(screen.queryByText(/October|August|July/)).not.toBeInTheDocument()
})

test('shows every highlight of the featured role as a list item without interaction', () => {
  render(<ExperienceSection roles={roles} />)
  const highlightList = screen.getByText('Built the widget.').closest('ul')
  const highlightItems = within(highlightList).getAllByRole('listitem')
  expect(highlightItems.map((item) => item.textContent)).toEqual(['Built the widget.', 'Shipped the gadget.'])
  expect(screen.getByText('Built the widget.')).toBeVisible()
  expect(screen.getByText('Shipped the gadget.')).toBeVisible()
})

test('exposes notes through a closed details element', () => {
  render(<ExperienceSection roles={roles} />)
  const summary = screen.getByText('Details')
  expect(summary.tagName).toBe('SUMMARY')
  const details = summary.closest('details')
  expect(details).not.toHaveAttribute('open')
  expect(within(details).getByText('I started as a busser and moved up.')).toBeInTheDocument()
})

test('renders no details for roles without notes', () => {
  render(<ExperienceSection roles={[roles[0], roles[2]]} />)
  expect(screen.queryByText('Details')).not.toBeInTheDocument()
  expect(document.querySelector('details')).toBeNull()
})

test('lists the earlier roles in their own list under an Earlier experience lead-in', () => {
  render(<ExperienceSection roles={roles} />)
  expect(screen.getByText('Earlier experience').tagName).toBe('P')
  const earlierList = screen.getByRole('list', { name: 'Earlier experience' })
  const earlierItems = within(earlierList).getAllByRole('listitem')
  expect(earlierItems).toHaveLength(2)
  expect(within(earlierItems[0]).getByRole('heading', { level: 3, name: 'The Diner' })).toBeInTheDocument()
  expect(within(earlierList).queryByText('Acme')).not.toBeInTheDocument()
})

test('omits the earlier experience list when there is only one role', () => {
  render(<ExperienceSection roles={[roles[0]]} />)
  expect(screen.queryByText('Earlier experience')).not.toBeInTheDocument()
  expect(screen.queryByRole('list', { name: 'Earlier experience' })).not.toBeInTheDocument()
})

test('shows the location when a role has one', () => {
  render(<ExperienceSection roles={roles} />)
  expect(screen.getByText(/Here, FL/)).toBeInTheDocument()
})

test('renders only the heading when there are no roles', () => {
  render(<ExperienceSection roles={[]} />)
  expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toBeInTheDocument()
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
  expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0)
})
