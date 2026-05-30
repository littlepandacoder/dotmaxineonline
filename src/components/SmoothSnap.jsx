import { useEffect, useLayoutEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const easeOut = (t) => 1 - Math.pow(1 - t, 4)

export default function SmoothSnap({ locationState }) {
  const savedScroll = useRef(null)

  useLayoutEffect(() => {
    history.scrollRestoration = 'manual'

    let target = null
    const stored = sessionStorage.getItem('dm_pageScroll')
    if (stored !== null) {
      sessionStorage.removeItem('dm_pageScroll')
      const y = parseFloat(stored)
      if (!isNaN(y) && y > 0) target = y
    }
    if (target === null && locationState?.pageScroll) {
      const y = parseFloat(locationState.pageScroll)
      if (!isNaN(y) && y > 0) target = y
    }
    if (target === null && locationState?.scrollTo === 'gallery') {
      const el = document.getElementById('depth-gallery')
      if (el) target = el.offsetTop
    }
    if (target !== null) {
      savedScroll.current = target
      window.scrollTo({ top: target, behavior: 'instant' })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.14, smoothWheel: true, wheelMultiplier: 1.4, touchMultiplier: 2.5 })

    if (savedScroll.current !== null) {
      lenis.scrollTo(savedScroll.current, { immediate: true })
      savedScroll.current = null
    }

    const onTick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', ScrollTrigger.update)

    // Entrance animations — skip sections with data-no-entrance
    const ctx = gsap.context(() => {
      document.querySelectorAll('[data-snap]').forEach((el) => {
        if (el.dataset.noEntrance !== undefined) return
        gsap.fromTo(
          el,
          { scale: 1.06, opacity: 0.5, transformOrigin: 'center top', willChange: 'transform, opacity' },
          {
            scale: 1, opacity: 1, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: true },
          }
        )
      })
    })

    const snaps = () => [...document.querySelectorAll('[data-snap]')]

    let navigating = false
    const goTo = (y, lock = false) => {
      navigating = true
      lenis.scrollTo(y, { duration: 0.7, easing: easeOut, lock })
      setTimeout(() => { navigating = false }, 1200)
    }

    // Auto-snap after scroll settles — skip if a data-no-snap section is visible
    let snapTimer = null
    lenis.on('scroll', () => {
      clearTimeout(snapTimer)
      snapTimer = setTimeout(() => {
        if (navigating) return
        const noSnapActive = [...document.querySelectorAll('[data-no-snap]')].find((el) => {
          const r = el.getBoundingClientRect()
          return r.top <= 8 && r.bottom >= 0
        })
        if (noSnapActive) return
        const vh = window.innerHeight
        const candidate = snaps().find((el) => {
          const dist = Math.abs(el.getBoundingClientRect().top)
          return dist > 6 && dist < vh * 0.6
        })
        if (candidate) goTo(candidate.offsetTop, candidate.dataset.noSnap !== undefined)
      }, 100)
    })

    // Gallery fires this when it wants to exit to next/prev section
    const onGalleryExit = ({ detail: { dir } }) => {
      const gallery = document.getElementById('depth-gallery')
      if (!gallery) return
      const list = snaps()
      const idx = list.indexOf(gallery)
      const target = dir > 0 ? list[idx + 1] : list[idx - 1]
      if (target) goTo(target.offsetTop, true)
    }

    // Page-level wheel — delegates to snap logic unless a data-no-snap section owns it
    const onWheel = (e) => {
      if (navigating) return
      const list = snaps()
      // If a data-no-snap section is at the top and user scrolls down, let it handle it
      if (list.find((el) => el.dataset.noSnap !== undefined && Math.abs(el.getBoundingClientRect().top) < 12) && e.deltaY > 0) return
      const atSnap = list.find((el) => Math.abs(el.getBoundingClientRect().top) < 12)
      if (!atSnap) return
      const idx = list.indexOf(atSnap)
      if (e.deltaY > 0 && idx < list.length - 1) {
        const next = list[idx + 1]
        goTo(next.offsetTop, next.dataset.noSnap !== undefined)
      } else if (e.deltaY < 0 && idx > 0) {
        const prev = list[idx - 1]
        goTo(prev.offsetTop, prev.dataset.noSnap !== undefined)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('dm:gallery-exit', onGalleryExit)

    return () => {
      ctx.revert()
      lenis.destroy()
      gsap.ticker.remove(onTick)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('dm:gallery-exit', onGalleryExit)
      clearTimeout(snapTimer)
    }
  }, [])

  return null
}
