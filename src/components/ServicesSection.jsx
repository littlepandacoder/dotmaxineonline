import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './ServicesSection.module.css'

gsap.registerPlugin(ScrollTrigger)

const SERVICES = [
  {
    num: '01',
    title: 'Brand Identity',
    body: 'Visual language, naming, and positioning that make people stop mid-scroll and remember you.',
  },
  {
    num: '02',
    title: 'Content Direction',
    body: 'Photography, art direction, and storytelling that give your brand a consistent, unmistakable voice.',
  },
  {
    num: '03',
    title: 'Digital Experience',
    body: 'Websites and digital spaces designed to feel as considered as the brand they carry.',
  },
  {
    num: '04',
    title: 'Growth & Community',
    body: 'Audience-first strategy that builds real belonging — not just reach.',
  },
]

export default function ServicesSection() {
  const sectionRef = useRef(null)
  const labelRef = useRef(null)
  const headingRef = useRef(null)
  const ruleTopRef = useRef(null)
  const ruleBottomRef = useRef(null)
  const itemsRef = useRef([])
  const ctaRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
          toggleActions: 'play none none reverse',
        },
      })

      tl.fromTo(ruleTopRef.current,
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, duration: 0.9, ease: 'power3.out' }
      )
      .fromTo(labelRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo(headingRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' },
        '-=0.55'
      )
      .fromTo(itemsRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.13 },
        '-=0.75'
      )
      .fromTo(ruleBottomRef.current,
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(ctaRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.5'
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section data-snap className={styles.section} ref={sectionRef}>
      <div className={styles.inner}>

        {/* Left col — ambient heading */}
        <div className={styles.left}>
          <p ref={labelRef} className={styles.label}>What we do</p>
          <h2 ref={headingRef} className={styles.ambient}>
            Craft.<br />Strategy.<br />Presence.
          </h2>
        </div>

        {/* Right col — service list */}
        <div className={styles.right}>
          <div ref={ruleTopRef} className={styles.rule} />

          <ol className={styles.list}>
            {SERVICES.map((s, i) => (
              <li
                key={s.num}
                ref={(el) => { itemsRef.current[i] = el }}
                className={styles.item}
              >
                <span className={styles.num}>{s.num}</span>
                <div className={styles.text}>
                  <h3 className={styles.title}>{s.title}</h3>
                  <p className={styles.body}>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div ref={ruleBottomRef} className={styles.rule} />

          <a
            ref={ctaRef}
            href="https://wa.me/971509653957"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cta}
          >
            Work with us <span className={styles.arrow}>→</span>
          </a>
        </div>
      </div>

      {/* Gradient bleed into gallery's sage green */}
      <div className={styles.bleed} />
    </section>
  )
}
