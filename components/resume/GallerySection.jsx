import Image from 'next/image'
import styles from './GallerySection.module.css'

export default function GallerySection({ photos }) {
  return (
    <section id="gallery" aria-labelledby="gallery-heading" className={`frame ${styles.section}`}>
      <div data-reveal>
        <h2 id="gallery-heading" className={`section-heading ${styles.heading}`}>Gallery</h2>
      </div>
      <ul className={styles.photos}>
        {photos.map((photo) => (
          <li key={photo.id} className={styles.item} data-reveal>
            <figure className={styles.figure}>
              <span className={styles.photo}>
                <Image
                  src={photo.image}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 1100px) 33vw, 20vw"
                  className={styles.image}
                />
              </span>
              <figcaption className={styles.place}>{photo.place}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
