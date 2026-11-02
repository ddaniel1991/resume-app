import { useState } from 'react'
import styles from './SectionNav.module.css'

const SECTIONS = [
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact' },
]

export default function SectionNav({ name }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <nav className={styles.nav} aria-label="Section navigation">
      <a href="#top" className={styles.brand}>{name}</a>
      <button
        type="button"
        className={styles.toggle}
        aria-controls="section-nav"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        {isOpen ? 'Close' : 'Menu'}
      </button>
      <ul id="section-nav" className={`${styles.links} ${isOpen ? styles.open : ''}`}>
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} className={styles.link} onClick={() => setIsOpen(false)}>
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
