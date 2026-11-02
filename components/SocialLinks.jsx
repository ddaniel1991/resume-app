import { iconFor } from './iconMap'

export default function SocialLinks({ links, size = '1.75rem', showLabels = false }) {
  return (
    <ul className={`social-list ${showLabels ? 'social-list-labelled' : ''}`}>
      {links.map((link) => {
        const Icon = iconFor(link.icon)
        return (
          <li key={link.url}>
            <a
              href={link.url}
              aria-label={showLabels ? undefined : link.label}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <Icon size={size} aria-hidden="true" />
              {showLabels ? <span>{link.label}</span> : null}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
