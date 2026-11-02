import Image from 'next/image'
import styles from './EducationSection.module.css'

export default function EducationSection({ schools }) {
  return (
    <section id="education" aria-labelledby="education-heading" className={`frame ${styles.section}`}>
      <div data-reveal>
        <h2 id="education-heading" className={`section-heading ${styles.heading}`}>Education</h2>
      </div>
      <ul className={styles.list}>
        {schools.map((school) => (
          <li key={school.id} className={styles.entry} data-reveal>
            {school.logo ? (
              <span className={styles.mark}>
                <Image src={school.logo} alt="" fill sizes="10rem" className={styles.markLogo} />
              </span>
            ) : null}
            <div className={styles.details}>
              <h3 className={styles.credential}>{school.credential}</h3>
              {school.major ? <p className={styles.major}>{school.major}</p> : null}
              <p className={styles.school}>{school.school}</p>
              <p className={styles.meta}>
                {school.location ? <span>{school.location}</span> : null}
                <span>{`${school.start} – ${school.end}`}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
