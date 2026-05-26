import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './NextSection.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function NextSection() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section data-snap className={styles.section}>
      <div ref={ref} className={styles.content}>
        NEXT SECTION
      </div>
    </section>
  )
}
