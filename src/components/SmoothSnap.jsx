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
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1.2, touchMultiplier: 2.2 })

    if (savedScroll.current !== null) {
      lenis.scrollTo(savedScroll.current, { immediate: true })
      savedScroll.current = null
    }

    const onTick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', ScrollTrigger.update)

    const ctx = gsap.context(() => {
      document.querySelectorAll('[data-snap]').forEach((el) => {
        // Entrance scale-up — skip if opted out
        if (el.dataset.noEntrance === undefined) {
          gsap.fromTo(
            el,
            { scale: 1.05, opacity: 0.4, transformOrigin: 'center top', willChange: 'transform, opacity' },
            {
              scale: 1, opacity: 1, ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: true },
            }
          )
        }

        // Scroll-down exit blur — skip the scroll-through hero and gallery (they handle it themselves)
        if (el.dataset.noSnap === undefined) {
          gsap.fromTo(
            el,
            { filter: 'blur(0px)', opacity: 1, scale: 1 },
            {
              filter: 'blur(18px)', opacity: 0, scale: 0.96,
              ease: 'none',
              transformOrigin: 'center center',
              scrollTrigger: {
                trigger: el,
                start: 'top top',
                end: 'top -38%',
                scrub: 0.5,
              },
            }
          )
        }
      })
    })

    const snaps = () => [...document.querySelectorAll('[data-snap]')]

    let navigating = false
    const goTo = (y, lock = false) => {
      if (navigating) return
      navigating = true
      lenis.scrollTo(y, { duration: 0.75, easing: easeOut, lock })
      setTimeout(() => { navigating = false }, 1000)
    }

    // Auto-snap after scroll settles
    let snapTimer = null
    lenis.on('scroll', () => {
      clearTimeout(snapTimer)
      snapTimer = setTimeout(() => {
        if (navigating) return

        // Check if we're mid-scroll in a no-snap (scroll-through) section
        const noSnapEl = [...document.querySelectorAll('[data-no-snap]')].find((el) => {
          const r = el.getBoundingClientRect()
          // Partially scrolled past: top is negative but bottom still in view
          return r.top < -50 && r.bottom > 0
        })

        if (noSnapEl) {
          // Snap to nearest boundary: if more than halfway through go forward, else back
          const r = noSnapEl.getBoundingClientRect()
          const list = snaps()
          const idx = list.indexOf(noSnapEl)
          if (-r.top > r.height * 0.45 && idx < list.length - 1) {
            goTo(list[idx + 1].offsetTop)
          } else {
            goTo(noSnapEl.offsetTop)
          }
          return
        }

        // Standard snap: find a section that's close but not at the top yet
        const vh = window.innerHeight
        const candidate = snaps().find((el) => {
          const dist = Math.abs(el.getBoundingClientRect().top)
          return dist > 6 && dist < vh * 0.65
        })
        if (candidate) goTo(candidate.offsetTop, candidate.dataset.noSnap !== undefined)
      }, 120)
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

    // Page-level wheel — delegates to snap logic
    const onWheel = (e) => {
      if (navigating) return
      const list = snaps()

      // When a no-snap section is freshly at its snap position, let Lenis scroll through it
      const noSnapAtTop = list.find(
        (el) => el.dataset.noSnap !== undefined && Math.abs(el.getBoundingClientRect().top) < 10
      )
      if (noSnapAtTop && e.deltaY > 0) return

      const atSnap = list.find((el) => Math.abs(el.getBoundingClientRect().top) < 10)
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
