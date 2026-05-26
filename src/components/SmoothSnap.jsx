import { useEffect, useLayoutEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Exponential-out easing: fast launch, long silky deceleration
const expoOut = (t) => 1 - Math.pow(1 - t, 5)

const SNAP_DURATION = 1.2
const SNAP_ZONE     = 0.25   // fraction of vh: how close a section must be to auto-pull in

export default function SmoothSnap({ locationState }) {
  const animating = useRef(false)

  // Restore scroll position synchronously before the browser paints to
  // prevent a one-frame flash of the hero when returning from a case study.
  useLayoutEffect(() => {
    const raw = sessionStorage.getItem('dm_pageScroll')
    if (raw !== null) {
      const y = parseFloat(raw)
      sessionStorage.removeItem('dm_pageScroll')
      if (!isNaN(y) && y > 0) window.scrollTo({ top: y, behavior: 'instant' })
    } else if (locationState?.scrollTo === 'gallery') {
      // Fallback: user arrived via the CaseStudy Back button without a saved page Y
      // (e.g. direct-URL case study). Scroll to the gallery section top.
      const el = document.getElementById('depth-gallery')
      if (el) window.scrollTo({ top: el.offsetTop, behavior: 'instant' })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // ── Lenis ────────────────────────────────────────────────────────
    // Lerps the native scroll value each frame → everything glides as
    // one continuous surface instead of jumping between discrete positions.
    const lenis = new Lenis({
      lerp: 0.075,          // lower = silkier/slower, higher = snappier
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    // Wire Lenis into GSAP's ticker so it drives exactly one raf per frame
    const onTick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    // Keep ScrollTrigger synced to Lenis's lerped position
    lenis.on('scroll', ScrollTrigger.update)

    // ── Entrance effects ─────────────────────────────────────────────
    // Each snap section scales from 1.06 → 1 and fades in as it scrolls
    // into the viewport. scrub:true ties this to scroll position so the
    // GSAP-driven scroll plays the animation in perfect sync.
    const snaps = () => [...document.querySelectorAll('[data-snap]')]

    const ctx = gsap.context(() => {
      snaps().forEach(section => {
        gsap.fromTo(
          section,
          {
            scale: 1.06,
            opacity: 0.5,
            transformOrigin: 'center top',
            willChange: 'transform, opacity',
          },
          {
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
            },
          }
        )
      })
    })

    // ── Navigation ───────────────────────────────────────────────────
    const goTo = (y) => {
      animating.current = true
      lenis.scrollTo(y, {
        duration: SNAP_DURATION,
        easing: expoOut,
        lock: true,           // prevents wheel input from interfering mid-animation
        onComplete: () => { animating.current = false },
      })
    }

    // ── Wheel ────────────────────────────────────────────────────────
    // Fires after Lenis's own handler (registered first), so lenis.scrollTo()
    // overrides any delta Lenis already applied for the same event.
    const onWheel = (e) => {
      if (animating.current) return

      const els = snaps()
      const vh  = window.innerHeight

      // Locked at a snap point → navigate to next/prev
      const atSnap = els.find(el => Math.abs(el.getBoundingClientRect().top) < 15)
      if (atSnap) {
        const idx = els.indexOf(atSnap)
        if (e.deltaY > 0) {
          if (idx < els.length - 1) goTo(els[idx + 1].offsetTop)
        } else {
          goTo(idx > 0 ? els[idx - 1].offsetTop : 0)
        }
        return
      }

      // Near a snap point → pull it in
      const zone = vh * SNAP_ZONE
      if (e.deltaY > 0) {
        const near = els.find(el => { const t = el.getBoundingClientRect().top; return t > 0 && t < zone })
        if (near) goTo(near.offsetTop)
      } else {
        const near = [...els].reverse().find(el => { const t = el.getBoundingClientRect().top; return t < 0 && t > -zone })
        if (near) goTo(near.offsetTop)
      }
      // Otherwise (mid-HeroZoom) → Lenis handles it freely
    }

    // ── Scroll-end auto-snap ─────────────────────────────────────────
    // After Lenis settles, pull in any section that drifted to within 45 % of view.
    let snapTimer = null
    lenis.on('scroll', () => {
      clearTimeout(snapTimer)
      snapTimer = setTimeout(() => {
        if (animating.current) return
        const vh = window.innerHeight
        const candidate = snaps().find(el => {
          const t = Math.abs(el.getBoundingClientRect().top)
          return t > 15 && t < vh * 0.45
        })
        if (candidate) goTo(candidate.offsetTop)
      }, 200)
    })

    // ── Touch ────────────────────────────────────────────────────────
    let touchY = 0, touchT = 0
    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? 0
      touchT = Date.now()
    }
    const onTouchEnd = (e) => {
      if (animating.current) return
      const dy       = touchY - (e.changedTouches[0]?.clientY ?? touchY)
      const velocity = Math.abs(dy) / Math.max(1, Date.now() - touchT)
      if (Math.abs(dy) < 25 && velocity < 0.25) return

      const els    = snaps()
      const atSnap = els.find(el => Math.abs(el.getBoundingClientRect().top) < 80)
      if (!atSnap) return

      const idx = els.indexOf(atSnap)
      if (dy > 0 && idx < els.length - 1) goTo(els[idx + 1].offsetTop)
      else if (dy < 0)                    goTo(idx > 0 ? els[idx - 1].offsetTop : 0)
    }

    window.addEventListener('wheel',      onWheel,      { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend',   onTouchEnd,   { passive: true })

    return () => {
      ctx.revert()
      lenis.destroy()
      gsap.ticker.remove(onTick)
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend',   onTouchEnd)
      clearTimeout(snapTimer)
    }
  }, [])

  return null
}
