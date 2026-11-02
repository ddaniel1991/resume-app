import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { formatTenure, monthsWorked, yearRange } from './tenure'
import styles from './ExperienceSection.module.css'

function RoleHeading({ role }) {
  const [primaryPosition, ...earlierPositions] = role.positions
  return (
    <div className={styles.roleHeading}>
      {role.logo ? (
        <h3 className={styles.companyLogo}>
          <Image src={role.logo} alt={role.company} width={832} height={162} sizes="(min-width: 900px) 28rem, 80vw" priority />
        </h3>
      ) : (
        <h3 className={styles.company}>{role.company}</h3>
      )}
      <p className={styles.position}>
        <strong>{primaryPosition}</strong>
        {role.location ? <span className={styles.location}> · {role.location}</span> : null}
      </p>
      {earlierPositions.length > 0 ? (
        <p className={styles.previously}>
          <strong>Previously:</strong> {earlierPositions.join(', ')}
        </p>
      ) : null}
      <p className={styles.dates}>{yearRange(role.start, role.end)}</p>
    </div>
  )
}

function useActiveHighlight(itemRefs, count) {
  const [activeIndex, setActiveIndex] = useState(null)
  useEffect(() => {
    if (count === 0 || !('IntersectionObserver' in window)) {
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const crossing = entries.find((entry) => entry.isIntersecting)
        if (crossing) {
          setActiveIndex(Number(crossing.target.dataset.index))
        }
      },
      { rootMargin: '-48% 0px -48% 0px' },
    )
    itemRefs.current.slice(0, count).forEach((item) => item && observer.observe(item))
    return () => observer.disconnect()
  }, [itemRefs, count])
  return [activeIndex, setActiveIndex]
}

function FeaturedRole({ role }) {
  const itemRefs = useRef([])
  const [activeIndex, setActiveIndex] = useActiveHighlight(itemRefs, role.highlights.length)
  return (
    <div className={styles.featured}>
      <div className={styles.pin}>
        <RoleHeading role={role} />
      </div>
      {role.highlights.length > 0 ? (
        <ul className={styles.highlights}>
          {role.highlights.map((highlight, index) => (
            <li
              key={highlight}
              ref={(item) => { itemRefs.current[index] = item }}
              data-index={index}
              tabIndex={0}
              className={index === activeIndex ? styles.activeHighlight : undefined}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
            >
              {highlight}
            </li>
          ))}
        </ul>
      ) : null}
      {role.notes ? <p className={styles.notes}>{role.notes}</p> : null}
    </div>
  )
}

function CompanyMark({ role }) {
  if (role.logo) {
    return (
      <span className={styles.mark}>
        <Image src={role.logo} alt="" fill sizes="10rem" className={styles.markLogo} />
      </span>
    )
  }
  const initials = role.company.split(/\s+/).slice(0, 2).map((word) => word[0]).join('')
  return <span className={`${styles.mark} ${styles.markInitials}`} aria-hidden="true">{initials}</span>
}

function EarlierRole({ role, isHidden }) {
  const [primaryPosition, ...earlierPositions] = role.positions
  const tenure = formatTenure(monthsWorked(role.start, role.end))
  return (
    <li className={styles.row} hidden={isHidden}>
      <CompanyMark role={role} />
      <div className={styles.rowBody}>
        <h3 className={styles.rowCompany}>{role.company}</h3>
        <p className={styles.rowPosition}>
          <strong>{primaryPosition}</strong>
          {earlierPositions.length > 0 ? (
            <span className={styles.rowPrevious}> · previously {earlierPositions.join(', ')}</span>
          ) : null}
          {role.location ? <span className={styles.location}> · {role.location}</span> : null}
        </p>
        {role.highlights.length > 0 ? (
          <ul className={styles.rowHighlights}>
            {role.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
        ) : null}
        {role.notes ? (
          <details className={styles.story}>
            <summary>Details</summary>
            <p>{role.notes}</p>
          </details>
        ) : null}
      </div>
      <p className={styles.rowDates}>
        <span>{yearRange(role.start, role.end)}</span>
        {tenure ? <span className={styles.tenure}>{tenure}</span> : null}
      </p>
    </li>
  )
}

function EarlierRoles({ roles }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shownByDefault = roles.filter((role) => role.alwaysShown)
  const canCollapse = shownByDefault.length > 0 && shownByDefault.length < roles.length
  return (
    <>
      <ul id="earlier-experience-list" className={styles.lineUp} aria-labelledby="earlier-experience-label">
        {roles.map((role) => (
          <EarlierRole key={role.id} role={role} isHidden={canCollapse && !isExpanded && !role.alwaysShown} />
        ))}
      </ul>
      {canCollapse ? (
        <button
          type="button"
          className={styles.toggleRoles}
          aria-controls="earlier-experience-list"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
        >
          {isExpanded ? 'Show fewer roles' : `Show all ${roles.length} roles`}
        </button>
      ) : null}
    </>
  )
}

export default function ExperienceSection({ roles, intro }) {
  const [featuredRole, ...earlierRoles] = roles
  return (
    <section id="experience" aria-labelledby="experience-heading" className={styles.section}>
      <div className={`frame ${styles.head}`} data-reveal>
        <h2 id="experience-heading" className="section-heading">Experience</h2>
      </div>
      {featuredRole ? <div className="frame"><FeaturedRole role={featuredRole} /></div> : null}
      {earlierRoles.length > 0 ? (
        <div className={styles.earlier}>
          <div className="frame" data-reveal>
            <p id="earlier-experience-label" className={styles.leadIn}>Earlier experience</p>
            {intro ? <p className={styles.intro}>{intro}</p> : null}
            <EarlierRoles roles={earlierRoles} />
          </div>
        </div>
      ) : null}
    </section>
  )
}
