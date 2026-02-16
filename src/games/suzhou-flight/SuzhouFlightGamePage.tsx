import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
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

const AIRCRAFT_BASE_SPEED: Record<AircraftType, number> = {
  jetliner: 54,
  fighter: 62,
  biplane: 48,
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function setupWorld(scene: THREE.Scene) {
  scene.background = new THREE.Color(0x9ed8ff)
  scene.fog = new THREE.Fog(0x9ed8ff, 260, 1200)

  const hemi = new THREE.HemisphereLight(0xdbeafe, 0x89a03e, 0.9)
  scene.add(hemi)

  const dir = new THREE.DirectionalLight(0xffffff, 1.05)
  dir.position.set(120, 220, 90)
  scene.add(dir)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2600, 2600),
    new THREE.MeshStandardMaterial({ color: 0xb8e5b1, roughness: 0.96, metalness: 0.02 }),
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  const waterPatch = new THREE.Mesh(
    new THREE.CircleGeometry(160, 72),
    new THREE.MeshStandardMaterial({
      color: 0x4d9df5,
      transparent: true,
      opacity: 0.5,
      roughness: 0.2,
      metalness: 0.5,
    }),
  )
  waterPatch.rotation.x = -Math.PI / 2
  waterPatch.position.set(18, 0.05, 190)
  scene.add(waterPatch)

  for (let i = 0; i < 22; i += 1) {
    const cloud = new THREE.Mesh(
      new THREE.SphereGeometry(6 + Math.random() * 9, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      }),
    )
    cloud.position.set((Math.random() - 0.5) * 860, 90 + Math.random() * 68, (Math.random() - 0.5) * 860)
    cloud.scale.set(2 + Math.random() * 1.8, 0.7 + Math.random() * 0.3, 1.2 + Math.random() * 0.8)
    scene.add(cloud)
  }
}

export default function SuzhouFlightGamePage() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftType | null>(null)
  const [runSeed, setRunSeed] = useState(0)
  const [status, setStatus] = useState<GameStatus>('selecting')
  const [hud, setHud] = useState<HudState>({
    speed: 0,
    altitude: 0,
    checkpointIndex: 0,
    elapsedSeconds: 0,
  })
  const [finalTime, setFinalTime] = useState(0)

  const selectedAircraftOption = useMemo(
    () => AIRCRAFT_OPTIONS.find((item) => item.id === selectedAircraft) ?? null,
    [selectedAircraft],
  )

  useEffect(() => {
    if (!mountRef.current || !selectedAircraft) {
      return
    }

    setStatus('running')
    setFinalTime(0)
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    mountRef.current.appendChild(renderer.domElement)

    setupWorld(scene)
    const route = createSuzhouLandmarks(scene)

    const aircraft = createAircraft(selectedAircraft)
    aircraft.position.set(0, 32, 20)
    aircraft.rotation.y = 0
    scene.add(aircraft)

    camera.position.set(0, 46, -42)
    camera.lookAt(aircraft.position)

    const pressed: Record<string, boolean> = {}
    const speedRef = { current: AIRCRAFT_BASE_SPEED[selectedAircraft] }
    const checkpointRef = { current: 0 }
    const startTime = performance.now()
    const uiUpdateRef = { current: startTime }
    const runningRef = { current: true }

    const onKeyDown = (event: KeyboardEvent) => {
      pressed[event.code] = true
    }

    const onKeyUp = (event: KeyboardEvent) => {
      pressed[event.code] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    let animationId = 0
    let prevTime = performance.now()

    const animate = (now: number) => {
      const dt = Math.min(0.045, (now - prevTime) / 1000)
      prevTime = now

      if (runningRef.current) {
        const pitchRate = selectedAircraft === 'fighter' ? 1.12 : 0.92
        const yawRate = selectedAircraft === 'biplane' ? 0.74 : 0.88

        if (pressed.ArrowUp || pressed.KeyW) {
          aircraft.rotateX(pitchRate * dt)
        }
        if (pressed.ArrowDown || pressed.KeyS) {
          aircraft.rotateX(-pitchRate * dt)
        }
        if (pressed.ArrowLeft || pressed.KeyA) {
          aircraft.rotateY(yawRate * dt)
          aircraft.rotateZ(-0.7 * dt)
        }
        if (pressed.ArrowRight || pressed.KeyD) {
          aircraft.rotateY(-yawRate * dt)
          aircraft.rotateZ(0.7 * dt)
        }
        if (pressed.KeyQ) {
          aircraft.rotateZ(1.5 * dt)
        }
        if (pressed.KeyE) {
          aircraft.rotateZ(-1.5 * dt)
        }
        if (pressed.ShiftLeft || pressed.ShiftRight) {
          speedRef.current = Math.min(speedRef.current + 26 * dt, 100)
        }
        if (pressed.ControlLeft || pressed.ControlRight) {
          speedRef.current = Math.max(speedRef.current - 26 * dt, 28)
        }

        aircraft.rotation.z *= 0.986
        aircraft.rotation.x *= 0.996

        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(aircraft.quaternion).normalize()
        aircraft.position.addScaledVector(forward, speedRef.current * dt)

        aircraft.position.x = THREE.MathUtils.clamp(aircraft.position.x, -420, 420)
        aircraft.position.z = THREE.MathUtils.clamp(aircraft.position.z, -420, 420)
        aircraft.position.y = THREE.MathUtils.clamp(aircraft.position.y, 12, 160)

        const cameraTarget = aircraft.position.clone().add(forward.clone().multiplyScalar(28))
        const cameraDesired = aircraft.position
          .clone()
          .add(new THREE.Vector3(0, 11, 0))
          .add(forward.clone().multiplyScalar(-34))
        camera.position.lerp(cameraDesired, 0.08)
        camera.lookAt(cameraTarget)

        route.forEach((point, index) => {
          const material = point.ring.material as THREE.MeshStandardMaterial
          if (index === checkpointRef.current) {
            point.ringPulse += dt * 3.5
            const pulse = 1 + Math.sin(point.ringPulse) * 0.08
            point.ring.scale.setScalar(pulse)
            material.emissiveIntensity = 0.7
          } else if (index < checkpointRef.current) {
            material.color.setHex(0x22c55e)
            material.emissive.setHex(0x22c55e)
            material.emissiveIntensity = 0.5
          } else {
            point.ring.scale.setScalar(1)
            material.emissiveIntensity = 0.3
          }
        })

        const activeCheckpoint: LandmarkRoutePoint | undefined = route[checkpointRef.current]
        if (activeCheckpoint) {
          const distance = aircraft.position.distanceTo(activeCheckpoint.ringPosition)
          if (distance < activeCheckpoint.ringRadius) {
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

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.geometry) {
          mesh.geometry.dispose()
        }
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
      ? '全部地标已穿越'
      : `${hud.checkpointIndex + 1}/${7} ${[
          '园区·东方之门',
          '园区·金鸡湖',
          '姑苏区·北寺塔',
          '姑苏区·博物馆',
          '高新区·虎丘塔',
          '吴中区·宝带桥',
          '相城区·活力岛',
        ][Math.min(hud.checkpointIndex, 6)]}`

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-aviation-navy">
          苏州航线 3D 穿越赛
        </h1>
        <p className="text-gray-600 mt-2">
          飞越园区到相城，依次穿越 7 个地标检查环，完成你的苏州低空巡航任务。
        </p>
      </div>

      {!selectedAircraft && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AIRCRAFT_OPTIONS.map((option) => (
            <Card
              key={option.id}
              hover
              className="relative overflow-hidden"
              onClick={() => setSelectedAircraft(option.id)}
            >
              <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ background: option.accent }}
              />
              <div className="text-3xl mb-3">✈️</div>
              <h3 className="text-xl font-display font-bold text-aviation-navy">{option.name}</h3>
              <p className="text-sm text-aviation-blue font-semibold mt-1">{option.subtitle}</p>
              <p className="text-sm text-gray-600 mt-3">{option.description}</p>
              <Button className="mt-4 w-full" variant="secondary">
                选择这架飞机
              </Button>
            </Card>
          ))}
        </div>
      )}

      {selectedAircraft && (
        <Card className="p-3 md:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">当前机型</p>
              <p className="font-display text-xl font-bold text-aviation-navy">
                {selectedAircraftOption?.name}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setStatus('selecting')
                  setSelectedAircraft(null)
                  setRunSeed((prev) => prev + 1)
                }}
              >
                重新选机型
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setStatus('running')
                  setRunSeed((prev) => prev + 1)
                }}
              >
                重开航线
              </Button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border-3 border-blue-100 bg-slate-900">
            <div ref={mountRef} className="h-[66vh] min-h-[460px] w-full" />

            <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-slate-900/70 px-3 py-2 text-white">
              <p className="text-xs opacity-80">目标地标</p>
              <p className="font-semibold">{currentLandmark}</p>
            </div>

            <div className="pointer-events-none absolute right-3 top-3 rounded-xl bg-slate-900/70 px-3 py-2 text-white">
              <p className="text-xs opacity-80">计时</p>
              <p className="text-lg font-bold">
                {formatTime(status === 'finished' ? finalTime : hud.elapsedSeconds)}
              </p>
            </div>

            <div className="pointer-events-none absolute left-3 bottom-3 rounded-xl bg-slate-900/70 px-3 py-2 text-white text-sm">
              <p>速度：{Math.round(hud.speed)} km/h</p>
              <p>高度：{Math.round(hud.altitude)} m</p>
            </div>

            <div className="pointer-events-none absolute right-3 bottom-3 rounded-xl bg-slate-900/70 px-3 py-2 text-white text-xs md:text-sm">
              <p>W/S 俯仰</p>
              <p>A/D 转向</p>
              <p>Q/E 横滚</p>
              <p>Shift/Ctrl 加减速</p>
            </div>

            {status === 'finished' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/65 px-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
                  <p className="text-sm text-gray-500">任务完成</p>
                  <h3 className="text-3xl font-display font-bold text-aviation-navy mt-1">苏州全城穿越成功</h3>
                  <p className="mt-3 text-gray-600">
                    用时 <span className="font-bold text-aviation-blue">{formatTime(finalTime)}</span>
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setStatus('running')
                        setRunSeed((prev) => prev + 1)
                      }}
                    >
                      同机型再飞一次
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() => {
                        setStatus('selecting')
                        setSelectedAircraft(null)
                        setRunSeed((prev) => prev + 1)
                      }}
                    >
                      重新选择飞机
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
