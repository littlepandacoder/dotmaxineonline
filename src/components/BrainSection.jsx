import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './BrainSection.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function BrainSection() {
  const sectionRef = useRef(null)
  const revealRef  = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const fireReveal = () =>
        gsap.fromTo(
          revealRef.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.55, ease: 'power2.out', overwrite: true }
        )

      // Trigger each time the section scrolls into view from either direction
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 15px',
        onEnter:     fireReveal,
        onEnterBack: fireReveal,
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      data-snap
      data-no-entrance
      data-nav-light
      className={styles.section}
    >
      <iframe
        src="/brain/index.html"
        className={styles.frame}
        title="3D Brain"
        scrolling="no"
        allowFullScreen
      />
      {/* Gradient overlay matching hero end-state — fades out on enter */}
      <div ref={revealRef} className={styles.reveal} />
    </section>
  )
}
