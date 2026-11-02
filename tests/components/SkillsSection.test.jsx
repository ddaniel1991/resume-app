import { render, screen, within } from '@testing-library/react'
import SkillsSection from '../../components/resume/SkillsSection'

const skillGroups = [
  { category: 'Languages', skills: [{ name: 'Java', icon: 'java' }, { name: 'SQL', icon: 'sql' }] },
  { category: 'Frontend', skills: [{ name: 'React', icon: 'react' }] },
]

test('renders a region named Skills with a heading per category', () => {
  render(<SkillsSection skillGroups={skillGroups} />)
  const region = screen.getByRole('region', { name: 'Skills' })
  expect(within(region).getByRole('heading', { level: 2, name: 'Skills' })).toBeInTheDocument()
  expect(within(region).getByRole('heading', { level: 3, name: 'Languages' })).toBeInTheDocument()
  expect(within(region).getByRole('heading', { level: 3, name: 'Frontend' })).toBeInTheDocument()
})

test('renders every skill name as visible text', () => {
  render(<SkillsSection skillGroups={skillGroups} />)
  expect(screen.getByText('Java')).toBeInTheDocument()
  expect(screen.getByText('SQL')).toBeInTheDocument()
  expect(screen.getByText('React')).toBeInTheDocument()
})

test('renders a skill with an unknown icon key without throwing', () => {
  render(<SkillsSection skillGroups={[{ category: 'Misc', skills: [{ name: 'Mystery', icon: 'nope' }] }]} />)
  expect(screen.getByText('Mystery')).toBeInTheDocument()
})

test('a branded skill cell carries its brand color and an unbranded one does not', () => {
  render(<SkillsSection skillGroups={skillGroups} />)
  expect(screen.getByText('React').closest('li')).toHaveStyle({ '--skill-brand-color': '#61DAFB' })
  expect(screen.getByText('SQL').closest('li').style.getPropertyValue('--skill-brand-color')).toBe('')
})


test('skills are listed as list items within their category', () => {
  render(<SkillsSection skillGroups={skillGroups} />)
  const languagesList = screen.getAllByRole('list')[0]
  expect(within(languagesList).getAllByRole('listitem')).toHaveLength(2)
})
