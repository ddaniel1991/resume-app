import Image from 'next/image'
import Link from 'next/link'
import SiteHead from '../../components/SiteHead'
import { iconFor } from '../../components/iconMap'
import projects from '../../content/projects.json'
import styles from './project.module.css'

export async function getStaticPaths() {
  return {
    paths: projects.map((project) => ({ params: { slug: project.slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const project = projects.find((candidate) => candidate.slug === params.slug)
  return { props: { project } }
}

function DetailList({ heading, items }) {
  if (!items?.length) {
    return null
  }
  return (
    <section className={styles.detail} data-reveal>
      <h2 className={styles.detailHeading}>{heading}</h2>
      <ul className={styles.detailList}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  )
}

export default function ProjectPage({ project }) {
  return (
    <>
      <SiteHead
        title={`${project.name} · David Daniel`}
        description={project.summary}
        path={`/portfolio/${project.slug}`}
      />
      <nav className={`frame ${styles.bar}`} aria-label="Project navigation">
        <Link href="/#projects" className="text-link">Back to projects</Link>
        <Link href="/" className={styles.home}>David Daniel</Link>
      </nav>
      <main className={`frame ${styles.page}`}>
        <div data-reveal>
          {project.current ? <p className={styles.current}>Current project</p> : null}
          <h1 className={styles.title}>{project.name}</h1>
        </div>
        <div className={styles.layout}>
          <div className={styles.shot} data-reveal>
            <Image
              src={project.image}
              alt={`${project.name} screenshot`}
              width={1152}
              height={720}
              sizes="(min-width: 900px) 58vw, 100vw"
              className={styles.image}
              priority
            />
          </div>
          <div className={styles.panel} data-reveal>
            <p className={styles.summary}>{project.summary}</p>
            <div className={styles.actions}>
              {project.demoUrl ? (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="button">
                  {project.demoLabel ?? 'Open live demo'}
                </a>
              ) : null}
              {project.sourceUrl ? (
                <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-link">
                  View source
                </a>
              ) : null}
            </div>
            <h2 className={styles.stackHeading}>Built with</h2>
            <ul className={styles.stack}>
              {project.stack.map((tool) => {
                const Icon = iconFor(tool.icon)
                return (
                  <li key={tool.name}>
                    <Icon aria-hidden="true" />
                    <span>{tool.name}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        <div className={styles.details}>
          <DetailList heading="What it does" items={project.features} />
          <DetailList heading="How it's built" items={project.buildNotes} />
        </div>
      </main>
    </>
  )
}
