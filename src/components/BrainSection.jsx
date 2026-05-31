import styles from './BrainSection.module.css'

export default function BrainSection() {
  return (
    <section data-snap data-no-entrance data-nav-light className={styles.section}>
      <iframe
        src="/brain/index.html"
        className={styles.frame}
        title="3D Brain"
        scrolling="no"
        allowFullScreen
      />
    </section>
  )
}
