import { brandColorFor, iconFor } from '../iconMap'
import styles from './SkillsSection.module.css'

export default function SkillsSection({ skillGroups }) {
  return (
    <section id="skills" aria-labelledby="skills-heading" className={`frame ${styles.section}`}>
      <div data-reveal>
        <h2 id="skills-heading" className="section-heading">Skills</h2>
      </div>
      <div className={styles.groups}>
        {skillGroups.map((group) => (
          <div key={group.category} className={styles.group} data-reveal>
            <h3 className={styles.category}>{group.category}</h3>
            <ul className={styles.skills}>
              {group.skills.map((skill) => {
                const Icon = iconFor(skill.icon)
                const brandColor = brandColorFor(skill.icon)
                return (
                  <li
                    key={skill.name}
                    className={styles.skill}
                    style={brandColor ? { '--skill-brand-color': brandColor } : undefined}
                  >
                    <Icon aria-hidden="true" className={styles.icon} />
                    <span>{skill.name}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
