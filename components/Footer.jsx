import Image from 'next/image'
import credits from '../public/images/found/credits.json'
import SocialLinks from './SocialLinks'
import styles from './Footer.module.css'

export default function Footer({ profile }) {
  return (
    <footer id="contact" aria-labelledby="contact-heading">
      <div className={styles.scene}>
        <Image
          src="/images/found/capitols-tallahassee.jpg"
          alt="Florida's Historic Capitol in front of the State Capitol tower, Tallahassee"
          fill
          sizes="100vw"
          className={styles.photo}
        />
        <div className={styles.card} data-reveal>
          <h2 id="contact-heading" className={styles.heading}>Let&apos;s work together</h2>
          <p className={styles.where}>{profile.name}<br />{profile.title}, {profile.location}</p>
          <SocialLinks links={profile.social} size="1.25rem" showLabels />
          <a href={`mailto:${profile.email}`} className={`button ${styles.email}`}>{profile.email}</a>
        </div>
      </div>
      <div className={`frame ${styles.base}`}>
        <p className={styles.signature}>{profile.name}</p>
        <div className={styles.small}>
          <p>© {new Date().getFullYear()} {profile.name}</p>
          <p>
            Photographs:{' '}
            {credits.map((credit, index) => (
              <span key={credit.ref}>
                {index > 0 ? '; ' : null}
                <a href={credit.page} target="_blank" rel="noopener noreferrer">{credit.title}</a>
                {` by ${credit.creator}, `}
                <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{credit.license}</a>
              </span>
            ))}
            , via {credits[0].via}.
          </p>
        </div>
      </div>
    </footer>
  )
}
