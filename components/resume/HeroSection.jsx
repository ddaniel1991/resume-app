import Image from 'next/image'
import { useRef } from 'react'
import { FaDownload } from 'react-icons/fa'
import SocialLinks from '../SocialLinks'
import { useScrollProgress } from '../motion'
import styles from './HeroSection.module.css'

const WINDOW_OPENING_TRAVEL = 0.8

function splitSentences(text) {
  return text.split(/(?<=\.)\s+(?=[A-Z])/)
}

function splitStack(sentence) {
  const match = sentence.match(/^(.*?) in (.+?) (across .*)$/)
  if (!match) {
    return { sentence, stack: [] }
  }
  const [, before, list, after] = match
  return { sentence: `${before} ${after}`, stack: list.split(/,\s*(?:and\s+)?/) }
}

function splitName(name) {
  const [first, ...rest] = name.split(' ')
  return { first, rest: rest.join(' ') }
}

export default function HeroSection({ profile }) {
  const stageRef = useRef(null)
  useScrollProgress(stageRef, WINDOW_OPENING_TRAVEL)
  const { first, rest } = splitName(profile.name)
  const [firstSentence, ...detailSentences] = splitSentences(profile.summary)
  const { sentence: leadSentence, stack } = splitStack(firstSentence)
  return (
    <>
      <header ref={stageRef} className={styles.hero}>
        <div className={styles.stage}>
          <div className={styles.window}>
            <Image
              src="/images/found/juno-pier.jpg"
              alt="Juno Beach Pier reaching out over the Atlantic in Palm Beach County"
              fill
              sizes="(max-aspect-ratio: 3/2) 146vh, 100vw"
              quality={85}
              className={styles.picture}
              priority
            />
          </div>
          <h1 className={styles.name}>
            {first}
            {rest ? <>{' '}<br />{rest}</> : null}
          </h1>
          <div className={styles.aside}>
            <p className={styles.role}>
              <span>{profile.title}</span>
              <span className={styles.roleSeparator}>, </span>
              <span>{profile.location}</span>
            </p>
            {profile.tagline ? <p className={styles.tagline}>{profile.tagline}</p> : null}
            <div className={styles.actions}>
              <a href={profile.resumePdf} className="button">
                <FaDownload aria-hidden="true" /> Download resume
              </a>
              <a href={`mailto:${profile.email}`} className="text-link">Email me</a>
            </div>
          </div>
        </div>
      </header>
      <div className={styles.intro}>
        <div className={styles.introInner} data-reveal>
          <Image
            src={profile.headshot}
            alt={`Portrait of ${profile.name}`}
            width={900}
            height={1200}
            sizes="(min-width: 900px) 30vw, 60vw"
            className={styles.portrait}
          />
          <div className={styles.introText}>
            <p className={styles.summary}>{leadSentence}</p>
            {stack.length > 0 ? (
              <ul className={styles.stack}>
                {stack.map((tool) => <li key={tool}>{tool}</li>)}
              </ul>
            ) : null}
            {detailSentences.map((sentence) => (
              <p key={sentence} className={styles.summaryDetail}>{sentence}</p>
            ))}
            {profile.about ? <p className={styles.about}>{profile.about}</p> : null}
            <SocialLinks links={profile.social} size="1.5rem" showLabels />
          </div>
        </div>
      </div>
    </>
  )
}
