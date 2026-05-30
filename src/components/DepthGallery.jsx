import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGallery } from '@/context/GalleryContext'
import styles from './DepthGallery.module.css'

export default function DepthGallery({ locationState }) {
  const { planeData } = useGallery()
  const planeDataRef = useRef(planeData)
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const engineRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => { planeDataRef.current = planeData }, [planeData])

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!section || !canvas || !overlay) return

    const isSectionActive = () => Math.abs(section.getBoundingClientRect().top) < 8

    // double-nudge guard for wheel exit
    let nudging = false, nudgeDir = 0, nudgeTimer = null
    const markNudge = (dir) => {
      nudging = true; nudgeDir = dir
      clearTimeout(nudgeTimer)
      nudgeTimer = setTimeout(() => { nudging = false; nudgeDir = 0 }, 1200)
    }

    const onWheel = (e) => {
      const engine = engineRef.current
      if (!engine || !isSectionActive()) return
      const scroll = engine.scroll
      const delta = scroll.normalizeWheelDelta(e) * scroll.wheelScrollSpeed
      const dir = Math.sign(delta)
      const atStart = scroll.scrollCurrent <= scroll.scrollFromCameraZ(scroll.maxCameraZ) + 8
      const atEnd   = scroll.scrollCurrent >= scroll.scrollFromCameraZ(scroll.minCameraZ) - 8

      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) {
        if (nudging && nudgeDir === dir) {
          nudging = false
          e.preventDefault(); e.stopPropagation()
          window.dispatchEvent(new CustomEvent('dm:gallery-exit', { detail: { dir } }))
          return
        }
        markNudge(dir)
        e.preventDefault(); e.stopPropagation()
        return
      }
      nudging = false
      e.preventDefault(); e.stopPropagation()
      scroll.addScrollInput(delta)
    }

    // touch
    let touchY = 0, touchAccum = 0
    const onTouchStart = (e) => {
      if (!engineRef.current || !isSectionActive()) return
      touchY = e.touches[0]?.clientY ?? 0; touchAccum = 0
    }
    const onTouchMove = (e) => {
      const engine = engineRef.current
      if (!engine || !isSectionActive()) return
      e.preventDefault(); e.stopPropagation()
      const y = e.touches[0]?.clientY ?? touchY
      const delta = touchY - y
      touchY = y
      if (Math.abs(delta) < 1) return
      const scroll = engine.scroll
      const atStart = scroll.scrollCurrent <= scroll.scrollFromCameraZ(scroll.maxCameraZ) + 8
      const atEnd   = scroll.scrollCurrent >= scroll.scrollFromCameraZ(scroll.minCameraZ) - 8
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) {
        touchAccum += Math.abs(delta)
        if (touchAccum > 50) {
          touchAccum = 0
          window.dispatchEvent(new CustomEvent('dm:gallery-exit', { detail: { dir: Math.sign(delta) } }))
        }
        return
      }
      touchAccum = 0
      scroll.addScrollInput(delta * scroll.touchScrollSpeed)
    }

    // raycasting click → case study
    let THREE = null
    const raycaster = { instance: null }
    const onCanvasClick = (e) => {
      const engine = engineRef.current
      if (!engine || !isSectionActive() || !THREE || !raycaster.instance) return
      const rect = canvas.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.instance.setFromCamera(mouse, engine.camera)
      const planes = engine.experience.gallery.planes
      const visible = planes.filter((p) => p.material.opacity > 0.15)
      const hits = raycaster.instance.intersectObjects(visible)
      if (hits.length > 0) {
        const idx = planes.indexOf(hits[0].object)
        const slug = planeDataRef.current[idx]?.caseStudy?.slug
        if (slug) {
          const scrollTarget = engine.scroll.scrollTarget
          sessionStorage.setItem('dm_galleryScroll', String(scrollTarget))
          sessionStorage.setItem('dm_pageScroll', String(window.scrollY))
          navigate(`/case-study/${slug}`, { state: { galleryScroll: scrollTarget, pageScroll: window.scrollY } })
        }
      }
    }

    section.addEventListener('wheel', onWheel, { passive: false })
    section.addEventListener('touchstart', onTouchStart, { passive: true })
    section.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('click', onCanvasClick)

    import('@/Experience/Engine').then(({ Engine }) => {
      if (!canvas.isConnected) return
      window.__dm_planeConfig = planeDataRef.current
      const engine = new Engine(canvas)
      engineRef.current = engine
      const savedStr = locationState?.galleryScroll !== undefined
        ? String(locationState.galleryScroll)
        : sessionStorage.getItem('dm_galleryScroll')
      sessionStorage.removeItem('dm_galleryScroll')
      const initialScroll = savedStr != null && !isNaN(parseFloat(savedStr)) ? parseFloat(savedStr) : null
      engine.init({ skipScrollBind: true, labelContainer: overlay, initialScroll }).then(() => {
        import('three').then((mod) => {
          THREE = mod
          raycaster.instance = new mod.Raycaster()
        })
      }).catch(console.error)
    })

    return () => {
      clearTimeout(nudgeTimer)
      section.removeEventListener('wheel', onWheel)
      section.removeEventListener('touchstart', onTouchStart)
      section.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('click', onCanvasClick)
      if (engineRef.current) { engineRef.current.dispose(); engineRef.current = null }
    }
  }, [navigate, locationState])

  return (
    <section
      id="depth-gallery"
      data-snap
      data-no-entrance
      data-no-snap
      ref={sectionRef}
      className={styles.section}
    >
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
