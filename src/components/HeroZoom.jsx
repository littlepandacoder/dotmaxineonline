import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import heroBg from '../assets/hero-bg.png'
import styles from './HeroZoom.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function HeroZoom() {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const overlayRef = useRef(null)
  const welcomeRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text entrance on load
      gsap.fromTo(
        [welcomeRef.current, titleRef.current, subtitleRef.current, formRef.current],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 1.4, ease: 'power3.out', delay: 0.2 }
      )

      // Image zoom + blur driven by scroll
      gsap.fromTo(
        imageRef.current,
        { scale: 1, filter: 'blur(0px) brightness(1)' },
        {
          scale: 4,
          filter: 'blur(20px) brightness(0.6)',
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
          },
        }
      )

      // Overlay fade on scroll
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        {
          opacity: 0.65,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
          },
        }
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.zoomSection} ref={sectionRef}>
      <div className={styles.sticky}>
        <div className={styles.imageWrapper}>
          <img
            ref={imageRef}
            className={styles.image}
            src={heroBg}
            alt="dotMaxine hero background"
          />
          <div ref={overlayRef} className={styles.overlay} />
          <div className={styles.heroContent}>
            <p ref={welcomeRef} className={styles.welcome}>Welcome to</p>
            <h1 ref={titleRef} className={styles.title}>dotMaxine</h1>
            <p ref={subtitleRef} className={styles.subtitle}>
              Empowering connection and growth through inspiration.
            </p>
            <div ref={formRef} className={styles.form}>
              <input
                className={styles.input}
                type="email"
                placeholder="dotmaxine@mhotmail.com"
              />
              <button className={styles.formBtn}>dotMaxine Waitlist</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
