import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function SectionFader() {
  const overlayRef = useRef(null)

  useEffect(() => {
    const overlay = overlayRef.current
    let timeout = null
    let faded = false

    const show = () => {
      if (faded) return
      faded = true
      gsap.killTweensOf(overlay)
      gsap.to(overlay, { opacity: 0.55, duration: 0.18, ease: 'none' })
    }

    const hide = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        faded = false
        gsap.killTweensOf(overlay)
        gsap.to(overlay, { opacity: 0, duration: 0.45, ease: 'power2.out' })
      }, 280)
    }

    // Capture phase fires before any child stopPropagation,
    // so this triggers on every wheel input including gallery-internal scrolls.
    const onWheel = () => { show(); hide() }
    document.addEventListener('wheel', onWheel, { passive: true, capture: true })

    return () => {
      document.removeEventListener('wheel', onWheel, { capture: true })
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'black',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 9000,
      }}
    />
  )
}
