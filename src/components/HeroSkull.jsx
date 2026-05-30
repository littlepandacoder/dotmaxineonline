import { useEffect, useRef } from 'react'
import ThreeApp from '../Experience/ThreeSkull/core/Three'
import WebGPUContext from '../Experience/ThreeSkull/core/WebGPUContext'

export default function HeroSkull() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let app = null
    let mounted = true

    WebGPUContext.instance = null

    ;(async () => {
      try {
        app = new ThreeApp(container)
        await app.run()
        if (mounted) await app.scene.ready
      } catch (e) {
        console.error('ThreeSkull init error:', e)
      }
    })()

    return () => {
      mounted = false
      app?.destroy()
      container.querySelectorAll('canvas').forEach(c => c.remove())
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0 }}
    />
  )
}
