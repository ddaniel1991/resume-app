import { render, screen } from '@testing-library/react'
import ProjectPage, { getStaticPaths, getStaticProps } from '../../pages/portfolio/[slug]'
import projects from '../../content/projects.json'

test('getStaticPaths lists every project slug and no fallback', async () => {
  const { paths, fallback } = await getStaticPaths()
  expect(fallback).toBe(false)
  expect(paths.map((path) => path.params.slug).sort()).toEqual(projects.map((project) => project.slug).sort())
})

test('getStaticProps returns the matching project', async () => {
  const { props } = await getStaticProps({ params: { slug: projects[0].slug } })
  expect(props.project).toEqual(projects[0])
})

test('renders name, summary, a safe demo link and the stack', () => {
  const project = {
    slug: 'demo',
    name: 'Demo App',
    summary: 'Does a thing.',
    demoUrl: 'https://demo.example.com',
    image: '/images/hangman-screenshot.png',
    stack: [{ name: 'React', icon: 'react' }, { name: 'Sass', icon: 'sass' }],
  }
  render(<ProjectPage project={project} />)
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Demo App')
  expect(screen.getByText('Does a thing.')).toBeInTheDocument()
  const demo = screen.getByRole('link', { name: 'Open live demo' })
  expect(demo).toHaveAttribute('href', 'https://demo.example.com')
  expect(demo).toHaveAttribute('target', '_blank')
  expect(demo).toHaveAttribute('rel', 'noopener noreferrer')
  expect(screen.getByText(/React/)).toBeInTheDocument()
  expect(screen.getByText(/Sass/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /back to projects/i })).toHaveAttribute('href', '/#projects')
})
