import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Navbar.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function Navbar() {
  const navRef = useRef(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    // Entrance: slide down and fade in
    gsap.fromTo(
      nav,
      { y: -28, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: 0.5 }
    )

    const ctx = gsap.context(() => {
      // Switch to dark nav when brain section (light bg) is in view
      const brain = document.querySelector('[data-nav-light]')
      if (brain) {
        ScrollTrigger.create({
          trigger: brain,
          start: 'top 60px',
          end: 'bottom 60px',
          onEnter:     () => nav.classList.add(styles.dark),
          onLeave:     () => nav.classList.remove(styles.dark),
          onEnterBack: () => nav.classList.add(styles.dark),
          onLeaveBack: () => nav.classList.remove(styles.dark),
        })
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <nav ref={navRef} className={styles.nav}>
      <div className={styles.logo}>.M</div>
      <a
        href="https://wa.me/971509653957"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.btn}
      >
        Work with us
      </a>
    </nav>
  )
}
