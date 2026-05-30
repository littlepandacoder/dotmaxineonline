import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Footer.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function Footer() {
  const wrapRef = useRef(null)
  const bgCanvasRef = useRef(null)
  const blendRef = useRef(null)
  const taglineRef = useRef(null)
  const col1Ref = useRef(null)
  const col2Ref = useRef(null)
  const col3Ref = useRef(null)
  const bigTextRef = useRef(null)
  const bottomRef = useRef(null)

  // Background canvas mirrors gallery background colors
  useEffect(() => {
    const canvas = bgCanvasRef.current
    if (!canvas) return
    let renderer = null, bg = null, raf = null, alive = true

    const init = async () => {
      const [THREE, { Background }] = await Promise.all([
        import('three'),
        import('@/Experience/Background'),
      ])
      if (!alive) return
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false })
      renderer.setPixelRatio(1)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false)
      bg = new Background()
      bg.init()

      const loop = () => {
        if (!alive) return
        raf = requestAnimationFrame(loop)
        const src = window.__dm_bg
        if (!src?.material || !bg?.material) return
        const su = src.material.uniforms, du = bg.material.uniforms
        du.uBackgroundColor.value.copy(su.uBackgroundColor.value)
        du.uBlob1Color.value.copy(su.uBlob1Color.value)
        du.uBlob2Color.value.copy(su.uBlob2Color.value)
        du.uNoiseStrength.value = su.uNoiseStrength.value
        du.uBlobRadius.value = su.uBlobRadius.value
        du.uBlobRadiusSecondary.value = su.uBlobRadiusSecondary.value
        du.uBlobStrength.value = su.uBlobStrength.value
        du.uTime.value = su.uTime.value
        du.uVelocityIntensity.value = su.uVelocityIntensity.value
        renderer.render(bg.scene, bg.camera)
      }
      loop()
    }

    const onResize = () => {
      if (renderer && canvas) renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false)
    }
    window.addEventListener('resize', onResize)
    init()

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      bg?.dispose()
      renderer?.dispose()
    }
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Blend overlay fades out as footer enters
      gsap.fromTo(blendRef.current, { opacity: 1 }, {
        opacity: 0,
        ease: 'power2.out',
        scrollTrigger: { trigger: wrapRef.current, start: 'top 85%', end: 'top 20%', scrub: 2 },
      })

      gsap.fromTo(
        [taglineRef.current, col1Ref.current, col2Ref.current, col3Ref.current],
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: wrapRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      )

      gsap.fromTo(bigTextRef.current, { y: 80, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: bigTextRef.current, start: 'top 90%', toggleActions: 'play none none reverse' },
      })

      gsap.fromTo(bigTextRef.current, { x: '4%' }, {
        x: '-4%', ease: 'none',
        scrollTrigger: { trigger: wrapRef.current, start: 'top bottom', end: 'bottom top', scrub: 2 },
      })

      gsap.fromTo(bottomRef.current, { opacity: 0 }, {
        opacity: 1, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: bottomRef.current, start: 'top 95%', toggleActions: 'play none none reverse' },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div data-snap data-no-entrance className={styles.wrap} ref={wrapRef}>
      <canvas ref={bgCanvasRef} className={styles.bgCanvas} />
      <div ref={blendRef} className={styles.blend} />
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
