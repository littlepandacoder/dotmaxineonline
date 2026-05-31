import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import styles from './BrainSection.module.css'

const SERVICES = {
  'digital-marketing': {
    title: 'Digital Marketing',
    tagline: "No fluff. Just growth. We don't guess — we strategize.",
    section: 'WHAT WE COOK',
    items: ['Strategy & Roadmap', 'SEO & Content Marketing', 'Funnel Building & CRO', 'Influencer & Affiliate Marketing', 'Lead Generation'],
  },
  'social-media': {
    title: 'Social Media Management',
    tagline: 'Stop posting and hoping.',
    section: 'WHAT WE COOK',
    items: ['Monthly content strategy', 'Video & photo production', 'Copywriting & captions', 'Posting & scheduling', 'Platform management (IG, TikTok, FB, LinkedIn, YouTube)'],
  },
  'branding': {
    title: 'Branding',
    tagline: 'A feeling. An identity. A story. We build all three.',
    section: "WHAT'S INCLUDED",
    items: ['Brand strategy & positioning', 'Logo design', 'Color palette & typography system', 'Brand voice & tone of voice guide', 'Brand story & messaging framework', 'Brand guidelines document', 'Business card & stationery design', 'Social media profile kit'],
  },
  'graphic-design': {
    title: 'Graphic Design',
    tagline: "Good design sells. Bad design apologises. We don't apologise.",
    section: "WHAT'S INCLUDED",
    items: ['Social media post templates', 'Ad creatives & banners', 'Pitch decks & presentations', 'Packaging & print design', 'Infographics & visual content', 'Motion graphics & animated posts', 'Menu, flyer & brochure design', 'Thumbnail & cover design'],
  },
  'web-dev': {
    title: 'Website Design & Development',
    tagline: 'Your website has 3 seconds to impress. We make every one count.',
    section: 'WHAT WE COOK',
    items: ['Custom web development', 'UI/UX design & wireframing', 'Landing pages', 'E-commerce stores', 'Full technical setup & SEO', 'Post-launch support & maintenance'],
  },
  'ads': {
    title: 'Ads Management',
    tagline: 'Stop boosting posts and hoping for the best. Your budget deserves better than guesswork.',
    section: 'WHAT WE COOK',
    items: ['Ad creative production', 'Google Search & Display Ads', 'Meta Ads (Facebook & Instagram)', 'TikTok Ads', 'YouTube Ads'],
  },
}

const LEFT_KEYS  = ['digital-marketing', 'social-media', 'branding']
const RIGHT_KEYS = ['graphic-design', 'web-dev', 'ads']

const VERT = `
  attribute float aSize;
  varying float vAlpha;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    vAlpha = 0.5 + 0.5 * ((position.y + 100.0) / 200.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const FRAG = `
  uniform vec3 color;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = (1.0 - d * 2.0) * clamp(vAlpha, 0.2, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`

const CAMERA_Z     = 380
const FOV_DEG      = 45
const FOV_HALF_RAD = (FOV_DEG / 2) * (Math.PI / 180)

export default function BrainSection() {
  const sectionRef        = useRef(null)
  const svgRef            = useRef(null)
  const leftBtnRefs       = useRef([])
  const rightBtnRefs      = useRef([])
  const brainWorldRRef    = useRef(75)
  const connectorEls      = useRef([])

  const [modalKey,     setModalKey]     = useState(null)
  const [modalClosing, setModalClosing] = useState(false)

  const openModal = (key) => {
    setModalClosing(false)
    setModalKey(key)
  }

  const closeModal = () => {
    setModalClosing(true)
    setTimeout(() => { setModalKey(null); setModalClosing(false) }, 220)
  }

  // Three.js brain
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const W = window.innerWidth
    const H = window.innerHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)

    const canvas = renderer.domElement
    Object.assign(canvas.style, { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', zIndex: '0' })
    section.appendChild(canvas)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(FOV_DEG, W / H, 0.1, 2000)
    camera.position.set(0, 0, CAMERA_Z)

    const mouse = { x: 0, y: 0 }
    const onMouseMove = (e) => {
      mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove)

    let brain = null
    new OBJLoader().load(
      `${import.meta.env.BASE_URL}brain.obj`,
      (obj) => {
        const positions = [], sizes = []
        obj.traverse((child) => {
          const pos = child.geometry?.attributes?.position
          if (!pos) return
          for (let i = 0; i < pos.count; i++) {
            positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
            sizes.push(Math.random() * 1.8 + 0.4)
          }
        })
        if (!positions.length) return

        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geo.setAttribute('aSize',    new THREE.Float32BufferAttribute(sizes, 1))

        const mat = new THREE.ShaderMaterial({
          uniforms: { color: { value: new THREE.Color(0x4d88ff) } },
          vertexShader: VERT, fragmentShader: FRAG,
          transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        })

        brain = new THREE.Points(geo, mat)
        geo.computeBoundingBox()
        const centre = new THREE.Vector3()
        geo.boundingBox.getCenter(centre)
        brain.position.sub(centre)

        geo.computeBoundingSphere()
        brainWorldRRef.current = geo.boundingSphere.radius * 0.85

        scene.add(brain)
      },
      undefined,
      (err) => console.error('Brain OBJ error:', err)
    )

    let rafId
    const clock = new THREE.Clock()
    const tick = () => {
      rafId = requestAnimationFrame(tick)
      const t = clock.getElapsedTime()
      if (brain) {
        brain.rotation.y  = t * 0.18
        brain.rotation.x += (mouse.y * 0.2 - brain.rotation.x) * 0.04
      }
      renderer.render(scene, camera)
    }
    tick()

    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (section.contains(canvas)) section.removeChild(canvas)
    }
  }, [])

  // SVG connector RAF loop
  useEffect(() => {
    const NS  = 'http://www.w3.org/2000/svg'
    const svg = svgRef.current
    if (!svg) return

    const allBtns = [...leftBtnRefs.current, ...rightBtnRefs.current]
    allBtns.forEach(() => {
      const dotA = document.createElementNS(NS, 'circle')
      dotA.setAttribute('r', '2.5'); dotA.setAttribute('fill', 'white'); dotA.setAttribute('fill-opacity', '0.45')
      const line = document.createElementNS(NS, 'line')
      line.setAttribute('stroke', 'white'); line.setAttribute('stroke-opacity', '0.3'); line.setAttribute('stroke-width', '1')
      const dotB = document.createElementNS(NS, 'circle')
      dotB.setAttribute('r', '3.5'); dotB.setAttribute('fill', 'white'); dotB.setAttribute('fill-opacity', '0.78')
      svg.appendChild(dotA); svg.appendChild(line); svg.appendChild(dotB)
      connectorEls.current.push({ dotA, line, dotB })
    })

    const section = sectionRef.current
    let rafId

    const update = () => {
      rafId = requestAnimationFrame(update)
      const sRect = section.getBoundingClientRect()
      const cx = sRect.width  / 2
      const cy = sRect.height / 2
      const br = brainWorldRRef.current * (sRect.height / 2) / (Math.tan(FOV_HALF_RAD) * CAMERA_Z)

      let i = 0
      const place = (btn, fromRight) => {
        const el = connectorEls.current[i++]
        if (!el || !btn) return
        const bRect = btn.getBoundingClientRect()
        const bx = (fromRight ? bRect.right + 5 : bRect.left - 5) - sRect.left
        const by = bRect.top + bRect.height / 2 - sRect.top
        const dx = cx - bx, dy = cy - by
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (!dist) return
        const ex = cx - (dx / dist) * br
        const ey = cy - (dy / dist) * br
        el.dotA.setAttribute('cx', bx); el.dotA.setAttribute('cy', by)
        el.line.setAttribute('x1', bx); el.line.setAttribute('y1', by)
        el.line.setAttribute('x2', ex); el.line.setAttribute('y2', ey)
        el.dotB.setAttribute('cx', ex); el.dotB.setAttribute('cy', ey)
      }

      leftBtnRefs.current.forEach((b) => place(b, true))
      rightBtnRefs.current.forEach((b) => place(b, false))
    }
    rafId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(rafId)
      connectorEls.current = []
      while (svg.firstChild) svg.removeChild(svg.firstChild)
    }
  }, [])

  const service = modalKey ? SERVICES[modalKey] : null

  return (
    <section ref={sectionRef} data-snap className={styles.section}>

      <div className={styles.btnsLeft}>
        {LEFT_KEYS.map((key, i) => (
          <button
            key={key}
            ref={(el) => { leftBtnRefs.current[i] = el }}
            className={styles.serviceBtn}
            style={{ animationDelay: `${0.25 + i * 0.12}s, ${0.65 + i * 0.22}s` }}
            onClick={() => openModal(key)}
          >
            <span className={styles.btnIcon}>◈</span>
            <span className={styles.btnLabel}>{SERVICES[key].title}</span>
          </button>
        ))}
      </div>

      <div className={styles.btnsRight}>
        {RIGHT_KEYS.map((key, i) => (
          <button
            key={key}
            ref={(el) => { rightBtnRefs.current[i] = el }}
            className={`${styles.serviceBtn} ${styles.serviceBtnRight}`}
            style={{ animationDelay: `${0.25 + i * 0.12}s, ${0.65 + i * 0.22}s` }}
            onClick={() => openModal(key)}
          >
            <span className={styles.btnIcon}>◈</span>
            <span className={styles.btnLabel}>{SERVICES[key].title}</span>
          </button>
        ))}
      </div>

      <svg ref={svgRef} className={styles.connectorsSvg} xmlns="http://www.w3.org/2000/svg" />

      {service && (
        <div className={styles.modal}>
          <div className={styles.modalBackdrop} onClick={closeModal} />
          <div className={`${styles.modalCard} ${modalClosing ? styles.modalCardExit : styles.modalCardEnter}`}>
            <button className={styles.modalClose} onClick={closeModal}>✕</button>
            <h2 className={styles.modalTitle}>{service.title}</h2>
            <p className={styles.modalTagline}>{service.tagline}</p>
            <p className={styles.modalSectionLabel}>{service.section}</p>
            <ul className={styles.modalItems}>
              {service.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className={styles.content}>
        <h2 className={styles.heading}>What We Serve.</h2>
      </div>

    </section>
  )
}
