import { render, screen, within } from '@testing-library/react'
import EducationSection from '../../components/resume/EducationSection'

const schools = [
  { id: 'pbsc-bas', school: 'Palm Beach State College', location: 'Lake Worth, FL', credential: 'Bachelor of Applied Science', major: 'Information Management', start: 'January 2021', end: 'December 2023' },
  { id: 'pbsc-aa', school: 'Palm Beach State College', location: 'Lake Worth, FL', credential: 'Associate of Arts', start: 'January 2020', end: 'December 2021' },
  { id: 'dwyer', school: 'Dwyer High School', location: '', credential: 'High School Diploma', start: 'August 2005', end: 'May 2009', logo: '/images/logos/dwyer-high-school.png' },
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

test('renders a decorative logo only for schools that have one', () => {
  const { container } = render(<EducationSection schools={schools} />)
  const logos = container.querySelectorAll('img')
  expect(logos).toHaveLength(1)
  expect(logos[0]).toHaveAttribute('alt', '')
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})

test('shows the location only when present', () => {
  render(<EducationSection schools={schools} />)
  expect(screen.getAllByText('Lake Worth, FL')).toHaveLength(2)
})

test('lists each entry as a list item headed by its credential', () => {
  render(<EducationSection schools={schools} />)
  const entries = screen.getAllByRole('listitem')
  expect(entries).toHaveLength(3)
  expect(within(entries[2]).getByRole('heading', { level: 3, name: 'High School Diploma' })).toBeInTheDocument()
})
