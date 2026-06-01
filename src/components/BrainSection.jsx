import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './BrainSection.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function BrainSection() {
  const sectionRef = useRef(null)
  const revealRef  = useRef(null)
  const iframeRef  = useRef(null)

  useEffect(() => {
    const isMobile = window.innerWidth <= 768

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 15px',
        onEnter: restart,
        onEnterBack: restart,
      })
    })

    function restart() {
      // Reload the iframe so the ring→brain animation plays fresh every visit
      if (iframeRef.current) {
        iframeRef.current.src = '/brain/index.html'
      }
      // On desktop: the overlay covers the reload then fades out
      if (!isMobile && revealRef.current) {
        gsap.fromTo(
          revealRef.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.8, ease: 'power2.out', overwrite: true }
        )
      }
    }

    // On mobile: hide overlay immediately
    if (isMobile && revealRef.current) {
      revealRef.current.style.opacity = '0'
    }

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
        ref={iframeRef}
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
