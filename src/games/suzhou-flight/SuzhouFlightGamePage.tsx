import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { AIRCRAFT_OPTIONS, createAircraft } from './aircraft'
import { createSuzhouLandmarks } from './landmarks'
import type { AircraftType, LandmarkRoutePoint } from './types'

type GameStatus = 'selecting' | 'running' | 'finished'

interface HudState {
  speed: number
  altitude: number
  checkpointIndex: number
  elapsedSeconds: number
}

const LANDMARK_SEQUENCE = [
  '园区·东方之门',
  '园区·金鸡湖',
  '姑苏区·北寺塔',
  '姑苏区·博物馆',
  '高新区·虎丘塔',
  '吴中区·宝带桥',
  '相城区·活力岛',
]

const AIRCRAFT_BASE_SPEED: Record<AircraftType, number> = {
  jetliner: 54,
  fighter: 62,
  biplane: 48,
  helicopter: 42,
}

const AIRCRAFT_EMOJIS: Record<AircraftType, string> = {
  jetliner: '🛩️',
  fighter: '⚡',
  biplane: '🌿',
  helicopter: '🚁',
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/* ─── Enhanced World Setup ─── */
function setupWorld(scene: THREE.Scene) {
  // Sky gradient via vertex colors on a large sphere
  const skyGeo = new THREE.SphereGeometry(1500, 32, 32)
  const skyColors = new Float32Array(skyGeo.attributes.position.count * 3)
  const posArr = skyGeo.attributes.position.array as Float32Array

  for (let i = 0; i < skyGeo.attributes.position.count; i++) {
    const y = posArr[i * 3 + 1]
    const t = THREE.MathUtils.clamp((y + 1500) / 3000, 0, 1)
    // Bottom: warm horizon, Top: deep blue
    const bottomColor = new THREE.Color(0xfde68a)
    const midColor = new THREE.Color(0x7dd3fc)
    const topColor = new THREE.Color(0x1e40af)

    let color: THREE.Color
    if (t < 0.35) {
      color = bottomColor.clone().lerp(midColor, t / 0.35)
    } else {
      color = midColor.clone().lerp(topColor, (t - 0.35) / 0.65)
    }
    skyColors[i * 3] = color.r
    skyColors[i * 3 + 1] = color.g
    skyColors[i * 3 + 2] = color.b
  }
  skyGeo.setAttribute('color', new THREE.BufferAttribute(skyColors, 3))
  const skyMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })
  scene.add(new THREE.Mesh(skyGeo, skyMat))

  scene.fog = new THREE.Fog(0xa3d5f7, 300, 1400)

  // Lighting
  const hemi = new THREE.HemisphereLight(0xdbeafe, 0x6b8e4c, 1.0)
  scene.add(hemi)

  const sun = new THREE.DirectionalLight(0xfff7ed, 1.2)
  sun.position.set(150, 280, 100)
  scene.add(sun)

  const fill = new THREE.DirectionalLight(0xbfdbfe, 0.4)
  fill.position.set(-100, 100, -60)
  scene.add(fill)

  // Ground – textured appearance via color variation
  const groundGeo = new THREE.PlaneGeometry(2800, 2800, 60, 60)
  const groundColors = new Float32Array(groundGeo.attributes.position.count * 3)
  const groundPos = groundGeo.attributes.position.array as Float32Array

  for (let i = 0; i < groundGeo.attributes.position.count; i++) {
    const x = groundPos[i * 3]
    const z = groundPos[i * 3 + 1] // after rotation this becomes z
    const noise = Math.sin(x * 0.02) * Math.cos(z * 0.015) * 0.08
    const baseGreen = new THREE.Color(0x86b87a)
    const variation = new THREE.Color(0xa3c690)
    const t = 0.5 + noise
    const color = baseGreen.clone().lerp(variation, t)
    groundColors[i * 3] = color.r
    groundColors[i * 3 + 1] = color.g
    groundColors[i * 3 + 2] = color.b
  }
  groundGeo.setAttribute('color', new THREE.BufferAttribute(groundColors, 3))

  const ground = new THREE.Mesh(
    groundGeo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.02,
    }),
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  // Roads / grid lines
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7, metalness: 0.1 })
  for (let i = -3; i <= 3; i++) {
    // Horizontal roads
    const hRoad = new THREE.Mesh(new THREE.BoxGeometry(2200, 0.15, 4), roadMat)
    hRoad.position.set(0, 0.08, i * 120)
    scene.add(hRoad)
    // Vertical roads
    const vRoad = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 2200), roadMat)
    vRoad.position.set(i * 120, 0.08, 0)
    scene.add(vRoad)
  }

  // Water bodies
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x4d9df5,
    transparent: true,
    opacity: 0.55,
    roughness: 0.05,
    metalness: 0.55,
  })
  const mainWater = new THREE.Mesh(new THREE.CircleGeometry(180, 72), waterMat)
  mainWater.rotation.x = -Math.PI / 2
  mainWater.position.set(18, 0.06, 190)
  scene.add(mainWater)

  // Canal/river strips
  const canalMat = new THREE.MeshStandardMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.4,
    roughness: 0.08,
    metalness: 0.4,
  })
  const canal1 = new THREE.Mesh(new THREE.BoxGeometry(600, 0.1, 12), canalMat)
  canal1.position.set(-50, 0.07, 80)
  scene.add(canal1)

  const canal2 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 500), canalMat)
  canal2.position.set(-150, 0.07, 50)
  scene.add(canal2)

  // Volumetric clouds
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    roughness: 1,
    metalness: 0,
  })

  for (let i = 0; i < 30; i++) {
    const cloudCluster = new THREE.Group()
    const baseX = (Math.random() - 0.5) * 1200
    const baseY = 100 + Math.random() * 80
    const baseZ = (Math.random() - 0.5) * 1200

    // Each "cloud" is a cluster of overlapping spheres
    const puffCount = 3 + Math.floor(Math.random() * 4)
    for (let p = 0; p < puffCount; p++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(5 + Math.random() * 8, 10, 10),
        cloudMat,
      )
      puff.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 10,
      )
      puff.scale.set(2 + Math.random(), 0.6 + Math.random() * 0.3, 1 + Math.random() * 0.5)
      cloudCluster.add(puff)
    }

    cloudCluster.position.set(baseX, baseY, baseZ)
    scene.add(cloudCluster)
  }

  // Trees scattered around
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 })
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.9 })
  for (let i = 0; i < 50; i++) {
    const tree = new THREE.Group()
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3, 6), trunkMat)
    trunk.position.y = 1.5
    tree.add(trunk)
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.5 + Math.random(), 8, 8), treeMat)
    canopy.position.y = 3.5 + Math.random()
    tree.add(canopy)
    tree.position.set(
      (Math.random() - 0.5) * 800,
      0,
      (Math.random() - 0.5) * 800,
    )
    scene.add(tree)
  }
}

/* ─── 3D Preview renderer for aircraft selection ─── */
function AircraftPreview({ type }: { type: AircraftType }) {
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const w = canvasRef.current.clientWidth
    const h = canvasRef.current.clientHeight

    const previewScene = new THREE.Scene()
    previewScene.background = new THREE.Color(0x0f172a)

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 500)
    camera.position.set(18, 12, 22)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    canvasRef.current.appendChild(renderer.domElement)

    // Lighting
    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x475569, 1.2)
    previewScene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, 1.5)
    dir.position.set(15, 20, 10)
    previewScene.add(dir)
    const back = new THREE.DirectionalLight(0x93c5fd, 0.6)
    back.position.set(-10, 5, -10)
    previewScene.add(back)

    // Ground circle
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(20, 32),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.4,
      }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -4
    previewScene.add(ground)

    // Grid
    const gridHelper = new THREE.GridHelper(40, 20, 0x334155, 0x1e293b)
    gridHelper.position.y = -3.9
    previewScene.add(gridHelper)

    const aircraft = createAircraft(type)
    aircraft.rotation.y = -Math.PI / 4
    previewScene.add(aircraft)

    let raf = 0
    const animate = () => {
      aircraft.rotation.y += 0.008
      aircraft.position.y = Math.sin(Date.now() * 0.001) * 0.5
      renderer.render(previewScene, camera)
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      renderer.dispose()
      if (renderer.domElement.parentElement === canvasRef.current) {
        canvasRef.current!.removeChild(renderer.domElement)
      }
    }
  }, [type])

  return <div ref={canvasRef} className="w-full h-40 md:h-48 rounded-xl overflow-hidden" />
}

/* ─── Main Component ─── */
export default function SuzhouFlightGamePage() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const pressedRef = useRef<Record<string, boolean>>({})
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftType | null>(null)
  const [hoveredAircraft, setHoveredAircraft] = useState<AircraftType | null>(null)
  const [runSeed, setRunSeed] = useState(0)
  const [status, setStatus] = useState<GameStatus>('selecting')
  const [hud, setHud] = useState<HudState>({
    speed: 0,
    altitude: 0,
    checkpointIndex: 0,
    elapsedSeconds: 0,
  })
  const [finalTime, setFinalTime] = useState(0)
  const [passedName, setPassedName] = useState<string | null>(null)

  const selectedAircraftOption = useMemo(
    () => AIRCRAFT_OPTIONS.find((item) => item.id === selectedAircraft) ?? null,
    [selectedAircraft],
  )

  // Flash "checkpoint passed" notification
  useEffect(() => {
    if (passedName) {
      const timer = setTimeout(() => setPassedName(null), 1800)
      return () => clearTimeout(timer)
    }
  }, [passedName])

  useEffect(() => {
    if (!mountRef.current || !selectedAircraft) return

    setStatus('running')
    setFinalTime(0)
    setPassedName(null)
    setHud({
      speed: AIRCRAFT_BASE_SPEED[selectedAircraft],
      altitude: 32,
      checkpointIndex: 0,
      elapsedSeconds: 0,
    })

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      4000,
    )

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = false
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mountRef.current.appendChild(renderer.domElement)

    setupWorld(scene)
    const route = createSuzhouLandmarks(scene)

    const aircraft = createAircraft(selectedAircraft)
    aircraft.position.set(0, 32, 20)
    aircraft.rotation.y = 0
    scene.add(aircraft)

    // Contrails (engine trail particles)
    const trailGeo = new THREE.BufferGeometry()
    const trailPositions = new Float32Array(600 * 3) // 200 points per trail
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))
    const trailMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.6,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
    const trail = new THREE.Points(trailGeo, trailMat)
    scene.add(trail)
    let trailIndex = 0

    camera.position.set(0, 46, -42)
    camera.lookAt(aircraft.position)

    const speedRef = { current: AIRCRAFT_BASE_SPEED[selectedAircraft] }
    const checkpointRef = { current: 0 }
    const startTime = performance.now()
    const uiUpdateRef = { current: startTime }
    const runningRef = { current: true }
    const forward = new THREE.Vector3()
    const cameraTarget = new THREE.Vector3()
    const cameraDesired = new THREE.Vector3()
    const cameraLift = new THREE.Vector3(0, 11, 0)

    const onKeyDown = (event: KeyboardEvent) => {
      pressedRef.current[event.code] = true
    }
    const onKeyUp = (event: KeyboardEvent) => {
      pressedRef.current[event.code] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    let animationId = 0
    let prevTime = performance.now()
    const onVisibilityChange = () => {
      prevTime = performance.now()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const animate = (now: number) => {
      const dt = Math.min(0.045, (now - prevTime) / 1000)
      prevTime = now

      if (runningRef.current) {
        const pressed = pressedRef.current
        const pitchRate = selectedAircraft === 'fighter' ? 1.12 : 0.92
        const yawRate = selectedAircraft === 'biplane' ? 0.74 : 0.88

        if (pressed.ArrowUp || pressed.KeyW) aircraft.rotateX(pitchRate * dt)
        if (pressed.ArrowDown || pressed.KeyS) aircraft.rotateX(-pitchRate * dt)
        if (pressed.ArrowLeft || pressed.KeyA) {
          aircraft.rotateY(yawRate * dt)
          aircraft.rotateZ(-0.7 * dt)
        }
        if (pressed.ArrowRight || pressed.KeyD) {
          aircraft.rotateY(-yawRate * dt)
          aircraft.rotateZ(0.7 * dt)
        }
        if (pressed.KeyQ) aircraft.rotateZ(1.5 * dt)
        if (pressed.KeyE) aircraft.rotateZ(-1.5 * dt)
        if (pressed.ShiftLeft || pressed.ShiftRight) {
          speedRef.current = Math.min(speedRef.current + 26 * dt, 100)
        }
        if (pressed.ControlLeft || pressed.ControlRight) {
          speedRef.current = Math.max(speedRef.current - 26 * dt, 28)
        }

        aircraft.rotation.z *= 0.986
        aircraft.rotation.x *= 0.996

        forward.set(0, 0, 1).applyQuaternion(aircraft.quaternion).normalize()
        aircraft.position.addScaledVector(forward, speedRef.current * dt)

        aircraft.position.x = THREE.MathUtils.clamp(aircraft.position.x, -420, 420)
        aircraft.position.z = THREE.MathUtils.clamp(aircraft.position.z, -420, 420)
        aircraft.position.y = THREE.MathUtils.clamp(aircraft.position.y, 12, 160)

        // Update contrail
        trailPositions[trailIndex * 3] = aircraft.position.x + (Math.random() - 0.5) * 0.5
        trailPositions[trailIndex * 3 + 1] = aircraft.position.y - 1
        trailPositions[trailIndex * 3 + 2] = aircraft.position.z + (Math.random() - 0.5) * 0.5
        trailIndex = (trailIndex + 1) % 200
        trailGeo.attributes.position.needsUpdate = true

        // Camera follow
        cameraTarget.copy(aircraft.position).addScaledVector(forward, 28)
        cameraDesired.copy(aircraft.position).add(cameraLift).addScaledVector(forward, -34)
        camera.position.lerp(cameraDesired, 0.08)
        camera.lookAt(cameraTarget)

        // Checkpoint ring animations
        route.forEach((point, index) => {
          const material = point.ring.material as THREE.MeshStandardMaterial
          if (index === checkpointRef.current) {
            point.ringPulse += dt * 3.5
            const pulse = 1 + Math.sin(point.ringPulse) * 0.1
            point.ring.scale.setScalar(pulse)
            // Rotate the ring to face direction of approach
            point.ring.rotation.x += dt * 0.5
            material.emissiveIntensity = 0.6 + Math.sin(point.ringPulse * 2) * 0.2
          } else if (index < checkpointRef.current) {
            material.color.setHex(0x22c55e)
            material.emissive.setHex(0x22c55e)
            material.emissiveIntensity = 0.5
            material.opacity = 0.5
            material.transparent = true
          } else {
            point.ring.scale.setScalar(1)
            material.emissiveIntensity = 0.3
          }
        })

        // Check checkpoint collision
        const activeCheckpoint: LandmarkRoutePoint | undefined = route[checkpointRef.current]
        if (activeCheckpoint) {
          const distance = aircraft.position.distanceTo(activeCheckpoint.ringPosition)
          if (distance < activeCheckpoint.ringRadius) {
            setPassedName(LANDMARK_SEQUENCE[checkpointRef.current])
            checkpointRef.current += 1
            setHud((prev) => ({ ...prev, checkpointIndex: checkpointRef.current }))

            if (checkpointRef.current >= route.length) {
              runningRef.current = false
              const spent = (now - startTime) / 1000
              setFinalTime(spent)
              setStatus('finished')
            }
          }
        }

        if (now - uiUpdateRef.current > 120) {
          uiUpdateRef.current = now
          setHud({
            speed: speedRef.current,
            altitude: aircraft.position.y,
            checkpointIndex: checkpointRef.current,
            elapsedSeconds: (now - startTime) / 1000,
          })
        }
      }

      renderer.render(scene, camera)
      animationId = window.requestAnimationFrame(animate)
    }

    const onResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', onResize)

    animationId = window.requestAnimationFrame(animate)

    return () => {
      runningRef.current = false
      window.cancelAnimationFrame(animationId)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      pressedRef.current = {}

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose())
        } else if (mesh.material) {
          mesh.material.dispose()
        }
      })

      renderer.dispose()
      if (renderer.domElement.parentElement === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [selectedAircraft, runSeed])

  const currentLandmark =
    status === 'finished'
      ? '🎉 全部地标已穿越'
      : `${Math.min(hud.checkpointIndex + 1, LANDMARK_SEQUENCE.length)}/${LANDMARK_SEQUENCE.length} ${LANDMARK_SEQUENCE[Math.min(hud.checkpointIndex, LANDMARK_SEQUENCE.length - 1)]
      }`

  /* ─── Selection Screen ─── */
  if (!selectedAircraft) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0c4a6e 70%, #164e63 100%)',
          padding: '2rem 1rem',
          fontFamily: '"PingFang SC", "Microsoft YaHei", "Baloo 2", sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '0.5rem 1.5rem',
              borderRadius: '999px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#7dd3fc',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              marginBottom: '1rem',
            }}
          >
            ✈️ SUZHOU FLIGHT CHALLENGE
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #7dd3fc 50%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}
          >
            苏州航线 3D 穿越赛
          </h1>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '1rem',
              maxWidth: '520px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            选择你的座驾，飞越园区到相城，依次穿越 7 个苏州地标检查环，完成低空巡航任务。
          </p>
        </div>

        {/* Aircraft selection grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {AIRCRAFT_OPTIONS.map((option) => {
            const isHovered = hoveredAircraft === option.id
            return (
              <div
                key={option.id}
                onMouseEnter={() => setHoveredAircraft(option.id)}
                onMouseLeave={() => setHoveredAircraft(null)}
                onClick={() => setSelectedAircraft(option.id)}
                style={{
                  background: isHovered
                    ? 'rgba(30, 58, 95, 0.95)'
                    : 'rgba(15, 23, 42, 0.75)',
                  borderRadius: '1.25rem',
                  border: `2px solid ${isHovered ? option.accent : 'rgba(71, 85, 105, 0.4)'}`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: isHovered
                    ? `0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${option.accent}33`
                    : '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {/* Accent top bar */}
                <div
                  style={{
                    height: '4px',
                    background: `linear-gradient(90deg, ${option.accent}, ${option.accent}88)`,
                  }}
                />

                {/* 3D Preview */}
                <AircraftPreview type={option.id} />

                {/* Info area */}
                <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{AIRCRAFT_EMOJIS[option.id]}</span>
                    <h3
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        color: '#f0f9ff',
                        margin: 0,
                      }}
                    >
                      {option.name}
                    </h3>
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.7rem',
                      borderRadius: '999px',
                      background: `${option.accent}22`,
                      color: option.accent,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      marginBottom: '0.75rem',
                    }}
                  >
                    {option.subtitle}
                  </div>
                  <p
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {option.description}
                  </p>

                  {/* Select button */}
                  <button
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      padding: '0.7rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      background: isHovered
                        ? `linear-gradient(135deg, ${option.accent}, ${option.accent}cc)`
                        : 'rgba(71, 85, 105, 0.4)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.25s',
                      letterSpacing: '0.05em',
                    }}
                  >
                    选择这架飞机 →
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Route preview */}
        <div
          style={{
            maxWidth: '1000px',
            margin: '2.5rem auto 0',
            padding: '1.5rem',
            borderRadius: '1rem',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
          }}
        >
          <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', margin: '0 0 1rem' }}>
            📍 飞行航线
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {LANDMARK_SEQUENCE.map((name, index) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#7dd3fc',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </span>
                <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{name}</span>
                {index < LANDMARK_SEQUENCE.length - 1 && (
                  <span style={{ color: '#475569', fontSize: '0.75rem' }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ─── Game Screen ─── */
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        fontFamily: '"PingFang SC", "Microsoft YaHei", "Baloo 2", sans-serif',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.2rem' }}>{selectedAircraftOption ? AIRCRAFT_EMOJIS[selectedAircraftOption.id] : '✈️'}</span>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em' }}>当前机型</div>
            <div style={{ color: '#f0f9ff', fontSize: '1rem', fontWeight: 700 }}>{selectedAircraftOption?.name}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => {
              setStatus('selecting')
              setSelectedAircraft(null)
              setRunSeed((prev) => prev + 1)
            }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '0.6rem',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            重新选机型
          </button>
          <button
            onClick={() => {
              setStatus('running')
              setRunSeed((prev) => prev + 1)
            }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '0.6rem',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            重开航线
          </button>
        </div>
      </div>

      {/* Game viewport */}
      <div style={{ position: 'relative' }}>
        <div ref={mountRef} style={{ height: 'calc(100vh - 52px)', width: '100%' }} />

        {/* HUD Overlay - Target Landmark (top-left) */}
        <div
          style={{
            position: 'absolute',
            left: '1rem',
            top: '1rem',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '0.85rem',
            padding: '0.75rem 1rem',
            color: '#ffffff',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            pointerEvents: 'none',
            minWidth: '160px',
          }}
        >
          <div style={{ fontSize: '0.65rem', color: '#7dd3fc', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            🎯 目标地标
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{currentLandmark}</div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '0.5rem' }}>
            {LANDMARK_SEQUENCE.map((_, i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background:
                    i < hud.checkpointIndex
                      ? '#22c55e'
                      : i === hud.checkpointIndex
                        ? '#38bdf8'
                        : 'rgba(100, 116, 139, 0.4)',
                  transition: 'background 0.3s',
                  boxShadow: i === hud.checkpointIndex ? '0 0 6px #38bdf8' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Timer (top-right) */}
        <div
          style={{
            position: 'absolute',
            right: '1rem',
            top: '1rem',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '0.85rem',
            padding: '0.75rem 1rem',
            color: '#ffffff',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            pointerEvents: 'none',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: '0.65rem', color: '#7dd3fc', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
            ⏱ 计时
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.05em',
            }}
          >
            {formatTime(status === 'finished' ? finalTime : hud.elapsedSeconds)}
          </div>
        </div>

        {/* Flight instruments (bottom-left) */}
        <div
          style={{
            position: 'absolute',
            left: '1rem',
            bottom: '1rem',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '0.85rem',
            padding: '0.75rem 1rem',
            color: '#ffffff',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            pointerEvents: 'none',
            display: 'flex',
            gap: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>速度</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(hud.speed)}<span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '2px' }}>km/h</span>
            </div>
            {/* Speed bar */}
            <div style={{ width: '60px', height: '3px', background: 'rgba(71,85,105,0.4)', borderRadius: '2px', marginTop: '3px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(hud.speed / 100) * 100}%`,
                  background: hud.speed > 80 ? '#f97316' : '#38bdf8',
                  borderRadius: '2px',
                  transition: 'width 0.15s, background 0.3s',
                }}
              />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600 }}>高度</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(hud.altitude)}<span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '2px' }}>m</span>
            </div>
            <div style={{ width: '60px', height: '3px', background: 'rgba(71,85,105,0.4)', borderRadius: '2px', marginTop: '3px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(hud.altitude / 160) * 100}%`,
                  background: '#22c55e',
                  borderRadius: '2px',
                  transition: 'width 0.15s',
                }}
              />
            </div>
          </div>
        </div>

        {/* Controls hint (bottom-right) */}
        <div
          style={{
            position: 'absolute',
            right: '1rem',
            bottom: '1rem',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '0.85rem',
            padding: '0.6rem 0.85rem',
            color: '#94a3b8',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            pointerEvents: 'none',
            fontSize: '0.72rem',
            lineHeight: 1.6,
          }}
        >
          <div><span style={{ color: '#e2e8f0', fontWeight: 600 }}>W/S</span> 俯仰</div>
          <div><span style={{ color: '#e2e8f0', fontWeight: 600 }}>A/D</span> 转向</div>
          <div><span style={{ color: '#e2e8f0', fontWeight: 600 }}>Q/E</span> 横滚</div>
          <div><span style={{ color: '#e2e8f0', fontWeight: 600 }}>Shift/Ctrl</span> 加减速</div>
        </div>

        {/* Mobile touch controls */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '1rem',
            transform: 'translateX(-50%)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
          }}
          className="md:hidden"
        >
          {[
            { label: '左转', code: 'KeyA' },
            { label: '抬头', code: 'KeyW' },
            { label: '右转', code: 'KeyD' },
            { label: '减速', code: 'ControlLeft' },
            { label: '低头', code: 'KeyS' },
            { label: '加速', code: 'ShiftLeft' },
          ].map((btn) => (
            <button
              key={btn.code}
              onPointerDown={() => (pressedRef.current[btn.code] = true)}
              onPointerUp={() => (pressedRef.current[btn.code] = false)}
              onPointerCancel={() => (pressedRef.current[btn.code] = false)}
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: '0.6rem',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#e2e8f0',
                fontSize: '0.8rem',
                fontWeight: 600,
                touchAction: 'none',
                cursor: 'pointer',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Checkpoint passed notification */}
        {passedName && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(34, 197, 94, 0.2)',
              backdropFilter: 'blur(16px)',
              border: '2px solid rgba(34, 197, 94, 0.5)',
              borderRadius: '1rem',
              padding: '1rem 2rem',
              color: '#bbf7d0',
              textAlign: 'center',
              pointerEvents: 'none',
              animation: 'fadeInUp 0.3s ease-out',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>✅</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>穿越成功！</div>
            <div style={{ fontSize: '0.9rem', color: '#86efac' }}>{passedName}</div>
          </div>
        )}

        {/* Finished overlay */}
        {status === 'finished' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                borderRadius: '1.5rem',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                margin: '1rem',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.1em' }}>
                任务完成
              </div>
              <h3
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #ffffff, #38bdf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0.5rem 0',
                }}
              >
                苏州全城穿越成功
              </h3>
              <div style={{ color: '#94a3b8', fontSize: '1rem', margin: '0.75rem 0 1.5rem' }}>
                用时{' '}
                <span
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: '#38bdf8',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatTime(finalTime)}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  onClick={() => {
                    setStatus('running')
                    setRunSeed((prev) => prev + 1)
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  同机型再飞一次
                </button>
                <button
                  onClick={() => {
                    setStatus('selecting')
                    setSelectedAircraft(null)
                    setRunSeed((prev) => prev + 1)
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    background: 'rgba(30, 41, 59, 0.6)',
                    color: '#94a3b8',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  重新选择飞机
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS animation for checkpoint notification */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        .md\\:hidden {
          display: grid;
        }
        @media (min-width: 768px) {
          .md\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
