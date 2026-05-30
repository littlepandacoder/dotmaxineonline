import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import styles from './BrainSection.module.css'

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

export default function BrainSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const W = window.innerWidth
    const H = window.innerHeight

    // Renderer — sized to viewport, canvas absolutely fills section
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)

    const canvas = renderer.domElement
    Object.assign(canvas.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '0',
    })
    section.appendChild(canvas)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 2000)
    camera.position.set(0, 0, 380)

    // Mouse tilt
    const mouse = { x: 0, y: 0 }
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / W) * 2 - 1
      mouse.y = -(e.clientY / H) * 2 + 1
    }
    window.addEventListener('mousemove', onMouseMove)

    // Load brain point cloud
    let brain = null
    const loader = new OBJLoader()
    loader.load(
      `${import.meta.env.BASE_URL}brain.obj`,
      (obj) => {
        const positions = []
        const sizes = []

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
        geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1))

        const mat = new THREE.ShaderMaterial({
          uniforms: { color: { value: new THREE.Color(0x4499ff) } },
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })

        brain = new THREE.Points(geo, mat)

        // Centre on origin
        geo.computeBoundingBox()
        const centre = new THREE.Vector3()
        geo.boundingBox.getCenter(centre)
        brain.position.sub(centre)

        scene.add(brain)
      },
      undefined,
      (err) => console.error('Brain load error:', err)
    )

    // Render loop
    let rafId
    const clock = new THREE.Clock()
    const tick = () => {
      rafId = requestAnimationFrame(tick)
      const t = clock.getElapsedTime()
      if (brain) {
        brain.rotation.y = t * 0.18
        brain.rotation.x += (mouse.y * 0.2 - brain.rotation.x) * 0.04
      }
      renderer.render(scene, camera)
    }
    tick()

    // Resize
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
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

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.content}>
        <p className={styles.label}>Intelligence</p>
        <h2 className={styles.heading}>Built to think.<br />Designed to feel.</h2>
      </div>
    </section>
  )
}
