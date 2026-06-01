import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './BrainSection.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function BrainSection() {
  const sectionRef = useRef(null)
  const revealRef  = useRef(null)

  useEffect(() => {
    // Skip reveal animation on mobile — iframe fills screen, no overlay needed
    if (window.innerWidth <= 768) {
      if (revealRef.current) revealRef.current.style.opacity = '0'
      return
    }

    const ctx = gsap.context(() => {
      const fireReveal = () =>
        gsap.fromTo(
          revealRef.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.55, ease: 'power2.out', overwrite: true }
        )
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
      data-no-exit-blur
      className={styles.section}
    >
      <iframe
        src="/brain/index.html"
        className={styles.frame}
        title="3D Brain"
        scrolling="no"
        allowFullScreen
      />
      <div ref={revealRef} className={styles.reveal} />
    </section>
  )
}
