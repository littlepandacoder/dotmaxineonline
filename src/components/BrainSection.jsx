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
      // Gradient reveal: overlay fades out each time section enters view
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

      // Zoom-blur exit: section zooms in and dissolves as it scrolls out
      gsap.fromTo(
        sectionRef.current,
        { scale: 1, filter: 'blur(0px)', opacity: 1 },
        {
          scale: 1.35,
          filter: 'blur(22px)',
          opacity: 0,
          ease: 'none',
          transformOrigin: 'center center',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'top -42%',
            scrub: 0.6,
          },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      data-snap
      data-no-entrance
      data-nav-light
      data-zoom-exit
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
