import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { iconFor } from '../iconMap'
import styles from './ProjectsSection.module.css'

function ProjectSlide({ project, position, count, isStart }) {
  return (
    <li className={styles.slide} aria-roledescription="slide" aria-label={`${position} of ${count}`}>
      <article className={styles.project}>
        <a
          href={project.demoUrl ?? `/portfolio/${project.slug}`}
          target={project.demoUrl ? '_blank' : undefined}
          rel={project.demoUrl ? 'noopener noreferrer' : undefined}
          className={styles.shot}
          tabIndex={-1}
        >
          <Image
            src={project.image}
            alt={`${project.name} screenshot`}
            fill
            sizes="(min-width: 900px) 58vw, 100vw"
            className={styles.image}
            priority={isStart}
          />
        </a>
        <div className={styles.copy}>
          <p className={styles.count}>
            {String(position).padStart(2, '0')} / {String(count).padStart(2, '0')}
            {project.current ? <span className={styles.current}>Current project</span> : null}
          </p>
          <h3 className={styles.title}>
            <Link href={`/portfolio/${project.slug}`} className={styles.titleLink}>{project.name}</Link>
          </h3>
          <p className={styles.summary}>{project.summary}</p>
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
          <p className={styles.links}>
            {project.demoUrl ? (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={styles.demo}>{project.demoLabel ?? 'Live demo'}</a>
            ) : null}
            <Link href={`/portfolio/${project.slug}`} className={styles.pageLink}>Project page</Link>
          </p>
        </div>
      </article>
    </li>
  )
}

export default function ProjectsSection({ projects }) {
  const currentIndex = projects.findIndex((project) => project.current)
  const startIndex = currentIndex === -1 ? 0 : currentIndex
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(startIndex)

  useEffect(() => {
    const track = trackRef.current
    track.scrollLeft = startIndex * track.clientWidth
  }, [startIndex])

  const showSlide = (index) => {
    const track = trackRef.current
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({ left: index * track.clientWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  const followScroll = () => {
    const track = trackRef.current
    setActiveIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  const isFirst = activeIndex === 0
  const isLast = activeIndex === projects.length - 1

  return (
    <section id="projects" aria-labelledby="projects-heading" className={styles.section}>
      <div className="frame" data-reveal>
        <h2 id="projects-heading" className={`section-heading ${styles.heading}`}>Projects</h2>
      </div>
      <div className={styles.carousel} aria-roledescription="carousel" aria-labelledby="projects-heading">
        {projects.length > 1 ? (
          <div className={`frame ${styles.controls}`}>
            <button
              type="button"
              className={styles.arrow}
              aria-controls="projects-track"
              disabled={isFirst}
              onClick={() => showSlide(activeIndex - 1)}
            >
              <span aria-hidden="true">←</span>
              <span className="visually-hidden">Previous project</span>
            </button>
            <ol className={styles.tabs}>
              {projects.map((project, index) => (
                <li key={project.slug}>
                  <button
                    type="button"
                    className={styles.tab}
                    aria-controls="projects-track"
                    aria-current={index === activeIndex ? 'true' : undefined}
                    onClick={() => showSlide(index)}
                  >
                    {project.name}
                  </button>
                </li>
              ))}
            </ol>
            <button
              type="button"
              className={styles.arrow}
              aria-controls="projects-track"
              disabled={isLast}
              onClick={() => showSlide(activeIndex + 1)}
            >
              <span aria-hidden="true">→</span>
              <span className="visually-hidden">Next project</span>
            </button>
          </div>
        ) : null}
        <ul id="projects-track" ref={trackRef} className={styles.track} onScroll={followScroll}>
          {projects.map((project, index) => (
            <ProjectSlide
              key={project.slug}
              project={project}
              position={index + 1}
              count={projects.length}
              isStart={index === startIndex}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}
