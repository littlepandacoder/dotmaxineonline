import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { galleryPlaneData } from '@/data/galleryData'
import styles from './CaseStudy.module.css'

export default function CaseStudy() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const goBack = () => navigate('/', { state: { scrollTo: 'gallery' } })
  const data = galleryPlaneData.find(p => p.caseStudy?.slug === slug)
  const cs = data?.caseStudy

  const heroRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    // Disable snap scroll and restore normal overflow for this page
    document.documentElement.style.scrollSnapType = 'none'
    document.documentElement.style.overflowY = 'auto'
    return () => {
      document.documentElement.style.scrollSnapType = ''
      document.documentElement.style.overflowY = ''
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!heroRef.current || !contentRef.current) return

    gsap.fromTo(heroRef.current,
      { opacity: 0, scale: 1.04 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }
    )
    gsap.fromTo(
      contentRef.current.querySelectorAll('[data-anim]'),
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'power3.out', delay: 0.2 }
    )
  }, [slug])

  if (!data || !cs) {
    return (
      <div className={styles.notFound}>
        <p>Case study not found.</p>
        <button onClick={goBack}>← Back</button>
      </div>
    )
  }

  return (
    <div className={styles.page}>

      {/* Nav */}
      <nav className={styles.nav}>
        <button onClick={goBack} className={styles.back}>← Back</button>
        <span className={styles.navLogo}>dotMaxine</span>
        <span className={styles.pms}>{data.label.pms}</span>
      </nav>

      {/* Hero — flower image */}
      <div className={styles.hero} ref={heroRef}>
        <img
          src={data.textureSrc}
          alt={cs.title}
          className={styles.heroImg}
        />
        <div className={styles.heroOverlay} style={{ background: `${cs.accent}18` }} />
      </div>

      {/* Content */}
      <div className={styles.content} ref={contentRef}>

        <header className={styles.header}>
          <p className={styles.label} data-anim>{data.label.word}</p>
          <h1 className={styles.title} data-anim>{cs.title}</h1>
          <p className={styles.tagline} data-anim>{cs.tagline}</p>
        </header>

        <div className={styles.divider} data-anim style={{ background: cs.accent }} />

        {/* Stats */}
        <div className={styles.stats} data-anim>
          {[cs.stat1, cs.stat2, cs.stat3].map((s, i) => (
            <div key={i} className={styles.stat}>
              <span className={styles.statValue} style={{ color: cs.accent }}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <section className={styles.section} data-anim>
          <h2 className={styles.sectionHeading}>Overview</h2>
          <p className={styles.body}>{cs.overview}</p>
        </section>

        <section className={styles.section} data-anim>
          <h2 className={styles.sectionHeading}>Approach</h2>
          <p className={styles.body}>{cs.approach}</p>
        </section>

        <section className={styles.section} data-anim>
          <h2 className={styles.sectionHeading}>Outcome</h2>
          <p className={styles.body}>{cs.outcome}</p>
        </section>

        <footer className={styles.footer}>
          <button onClick={goBack} className={styles.backLink} data-anim>
            ← Return to dotMaxine
          </button>
        </footer>

      </div>
    </div>
  )
}
