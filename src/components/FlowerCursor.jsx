import { useEffect, useRef } from 'react'

const GLITTER_COLORS = ['#FFD700', '#FF69B4', '#FF1493', '#FFA500', '#FFB6C1', '#E8D5FF', '#FFFFFF', '#FF6EB4', '#FFFACD']

function drawStar(ctx, x, y, size, color, alpha) {
  ctx.save()
  ctx.globalAlpha = Math.max(0, alpha)
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 4
  ctx.translate(x, y)
  ctx.rotate(Math.PI / 4)
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? size : size * 0.4
    const angle = (i / 8) * Math.PI * 2
    if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export default function FlowerCursor() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -200, y: -200 })
  const glitterRef = useRef([])
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      for (let i = 0; i < 4; i++) {
        const color = GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)]
        glitterRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          size: Math.random() * 3.5 + 1,
          color,
          alpha: 0.9 + Math.random() * 0.1,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5 - 0.5,
          decay: 0.025 + Math.random() * 0.035,
          isStar: Math.random() > 0.45,
        })
      }
    }

    window.addEventListener('mousemove', onMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw glitter
      glitterRef.current = glitterRef.current.filter(p => p.alpha > 0)
      for (const p of glitterRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.06
        p.alpha -= p.decay
        if (p.isStar) {
          drawStar(ctx, p.x, p.y, p.size, p.color, p.alpha)
        } else {
          ctx.save()
          ctx.globalAlpha = Math.max(0, p.alpha)
          ctx.fillStyle = p.color
          ctx.shadowColor = p.color
          ctx.shadowBlur = 5
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
