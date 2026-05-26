import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './DepthGallery.module.css'
import { galleryPlaneData } from '@/data/galleryData'

export default function DepthGallery() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const engineRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!section || !canvas || !overlay) return

    const isSectionActive = () => Math.abs(section.getBoundingClientRect().top) < 10

    // ── Gallery scroll ──────────────────────────────────────────────
    const onWheel = (e) => {
      const engine = engineRef.current
      if (!engine || !isSectionActive()) return

      const scroll = engine.scroll
      const delta = scroll.normalizeWheelDelta(e) * scroll.wheelScrollSpeed
      const minScroll = scroll.scrollFromCameraZ(scroll.maxCameraZ)
      const maxScroll = scroll.scrollFromCameraZ(scroll.minCameraZ)
      const atStart = scroll.scrollCurrent <= minScroll + 8
      const atEnd   = scroll.scrollCurrent >= maxScroll - 8

      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return

      e.preventDefault()
      e.stopPropagation()
      scroll.addScrollInput(delta)
    }

    let touchY = 0
    const onTouchStart = (e) => {
      if (!engineRef.current || !isSectionActive()) return
      touchY = e.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (e) => {
      const engine = engineRef.current
      if (!engine || !isSectionActive()) return
      e.preventDefault()
      const currentY = e.touches[0]?.clientY ?? touchY
      engine.scroll.addScrollInput((touchY - currentY) * engine.scroll.touchScrollSpeed)
      touchY = currentY
    }

    // ── Raycast click → case study ─────────────────────────────────
    let THREE = null
    const raycaster = { instance: null }

    const onCanvasClick = (e) => {
      const engine = engineRef.current
      if (!engine || !isSectionActive() || !THREE || !raycaster.instance) return

      const rect = canvas.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      )

      raycaster.instance.setFromCamera(mouse, engine.camera)
      const planes = engine.experience.gallery.planes
      const visible = planes.filter(p => p.material.opacity > 0.15)
      const hits = raycaster.instance.intersectObjects(visible)

      if (hits.length > 0) {
        const idx = planes.indexOf(hits[0].object)
        const slug = galleryPlaneData[idx]?.caseStudy?.slug
        if (slug) {
          sessionStorage.setItem('dm_galleryScroll', String(engine.scroll.scrollCurrent))
          sessionStorage.setItem('dm_pageScroll', String(window.scrollY))
          navigate(`/case-study/${slug}`)
        }
      }
    }

    section.addEventListener('wheel', onWheel, { passive: false })
    section.addEventListener('touchstart', onTouchStart, { passive: true })
    section.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('click', onCanvasClick)

    import('@/Experience/Engine').then(({ Engine }) => {
      if (!canvas.isConnected) return
      const engine = new Engine(canvas)
      engineRef.current = engine

      const saved = sessionStorage.getItem('dm_galleryScroll')
      const initialScroll = saved !== null && !isNaN(parseFloat(saved)) ? parseFloat(saved) : null
      sessionStorage.removeItem('dm_galleryScroll')

      engine.init({ skipScrollBind: true, labelContainer: overlay, initialScroll }).then(() => {
        import('three').then(mod => {
          THREE = mod
          raycaster.instance = new mod.Raycaster()
        })
      }).catch(console.error)
    })

    return () => {
      section.removeEventListener('wheel', onWheel)
      section.removeEventListener('touchstart', onTouchStart)
      section.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('click', onCanvasClick)
      if (engineRef.current) {
        engineRef.current.dispose()
        engineRef.current = null
      }
    }
  }, [navigate])

  return (
    <section id="depth-gallery" data-snap ref={sectionRef} className={styles.section}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={overlayRef} className={styles.labelOverlay} />
      <div className={styles.heading}>
        <p className={styles.label}>Our Flowers</p>
        <h2 className={styles.title}>A bloom for every mood</h2>
      </div>
      <p className={styles.hint}>Scroll to explore · Click to open</p>
    </section>
  )
}
