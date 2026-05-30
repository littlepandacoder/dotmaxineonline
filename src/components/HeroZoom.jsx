import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WaitlistModal from './WaitlistModal'
import HeroSkull from './HeroSkull'
import styles from './HeroZoom.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function HeroZoom() {
  const sectionRef = useRef(null)
  const skullWrapRef = useRef(null)
  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  const welcomeRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const formRef = useRef(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance stagger on individual elements
      gsap.fromTo(
        [welcomeRef.current, titleRef.current, subtitleRef.current, formRef.current],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 1.4, ease: 'power3.out', delay: 0.2 }
      )

      const scrollOpts = {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      }

      // Skull zooms and blurs in sync
      gsap.fromTo(
        skullWrapRef.current,
        { scale: 1, filter: 'blur(0px) brightness(1)' },
        { scale: 8, filter: 'blur(28px) brightness(0.4)', ease: 'none', scrollTrigger: scrollOpts }
      )

      // Content drifts up, blurs, and fades out quickly
      gsap.to(contentRef.current, {
        y: -160,
        opacity: 0,
        filter: 'blur(12px)',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=400',
          scrub: 1,
        },
      })

      // Overlay fades in over everything
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, ease: 'power3.in', scrollTrigger: scrollOpts }
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      data-snap
      data-no-snap
      data-no-entrance
      className={styles.zoomSection}
      ref={sectionRef}
    >
      <div className={styles.sticky}>
        <div ref={skullWrapRef} className={styles.skullWrapper}>
          <HeroSkull />
        </div>
        <div ref={overlayRef} className={styles.overlay} />
        <div ref={contentRef} className={styles.heroContent}>
          <p ref={welcomeRef} className={styles.welcome}>Welcome to</p>
          <h1 ref={titleRef} className={styles.title}>dotMaxine</h1>
          <p ref={subtitleRef} className={styles.subtitle}>
            Because playing it safe was never the direction.
          </p>
          <div ref={formRef} className={styles.form}>
            <input
              className={styles.formInput}
              type="email"
              placeholder="Enter your email"
              readOnly
              onClick={() => setModalOpen(true)}
            />
            <button className={styles.formBtn} onClick={() => setModalOpen(true)}>
              Let's go further
            </button>
          </div>
          {modalOpen && <WaitlistModal onClose={() => setModalOpen(false)} />}
        </div>
      </div>

    </section>
  )
}
