import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Footer.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function Footer() {
  const wrapRef = useRef(null)
  const taglineRef = useRef(null)
  const col1Ref = useRef(null)
  const col2Ref = useRef(null)
  const col3Ref = useRef(null)
  const bigTextRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Top columns stagger in
      gsap.fromTo(
        [taglineRef.current, col1Ref.current, col2Ref.current, col3Ref.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: wrapRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // Big text slide up reveal
      gsap.fromTo(
        bigTextRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: bigTextRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // Big text slow horizontal parallax as you scroll through the footer
      gsap.fromTo(
        bigTextRef.current,
        { x: '4%' },
        {
          x: '-4%',
          ease: 'none',
          scrollTrigger: {
            trigger: wrapRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          },
        }
      )

      // Bottom bar fade in
      gsap.fromTo(
        bottomRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bottomRef.current,
            start: 'top 95%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <div data-snap className={styles.wrap} ref={wrapRef}>
      <footer className={styles.footer}>
        <div className={styles.top}>
          <div ref={taglineRef}>
            <p className={styles.tagline}>
              Step Into the Bloom – Where Every Scroll Sparks Growth
            </p>
          </div>

          <div ref={col1Ref} className={styles.col}>
            <h4>Explore</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Features</a></li>
              <li><a href="#">Download</a></li>
            </ul>
          </div>

          <div ref={col2Ref} className={styles.col}>
            <h4>Socials</h4>
            <ul>
              <li><a href="#"><span>𝕏</span> @dotmaxine</a></li>
              <li><a href="#"><span>▶</span> @dotmaxine</a></li>
              <li><a href="#"><span>◎</span> @dotmaxine</a></li>
            </ul>
          </div>

          <div ref={col3Ref} className={styles.col}>
            <h4>Contact us</h4>
            <a href="mailto:hello@dotmaxine.com" className={styles.contactLink}>
              hello@dotmaxine.com <span>↗</span>
            </a>
          </div>
        </div>

        <div ref={bigTextRef} className={styles.bigText}>dotMaxine</div>

        <div ref={bottomRef} className={styles.bottom}>
          <div className={styles.copy}>
            <span>🪷</span>
            Copyright © 2025 dotMaxine. All rights reserved.
          </div>
          <div className={styles.links}>
            <a href="#">Privacy Policy</a>
            <span className={styles.sep}>—</span>
            <a href="#">Terms of Service</a>
            <span className={styles.sep}>—</span>
            <a href="#">CSAE Standards</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
