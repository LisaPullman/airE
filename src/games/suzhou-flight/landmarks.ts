import * as THREE from 'three'
import type { LandmarkRoutePoint } from './types'

function createLabelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.Sprite()
  }

  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)'
  ctx.lineWidth = 6
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12)

  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 42px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    }),
  )
  sprite.scale.set(36, 9, 1)
  return sprite
}

function createCheckpointRing(
  scene: THREE.Scene,
  text: string,
  position: THREE.Vector3,
  color: number,
  radius: number,
): LandmarkRoutePoint {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 1.25, 20, 96),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.45,
      metalness: 0.45,
      roughness: 0.28,
    }),
  )
  ring.position.copy(position)
  scene.add(ring)

  const label = createLabelSprite(text)
  label.position.set(position.x, position.y + radius + 9, position.z)
  scene.add(label)

  return {
    id: text,
    name: text.split('·')[1] ?? text,
    district: text.split('·')[0] ?? '苏州',
    ringRadius: radius + 2,
    ring,
    ringPulse: Math.random() * Math.PI * 2,
    ringPosition: position.clone(),
  }
}

function addJinjiLake(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group()
  group.position.set(145, 0, 240)

  const lake = new THREE.Mesh(
    new THREE.CircleGeometry(72, 64),
    new THREE.MeshStandardMaterial({
      color: 0x4fa6ff,
      transparent: true,
      opacity: 0.78,
      roughness: 0.18,
      metalness: 0.4,
    }),
  )
  lake.rotation.x = -Math.PI / 2
  group.add(lake)

  const island = new THREE.Mesh(
    new THREE.CylinderGeometry(13, 17, 5, 24),
    new THREE.MeshStandardMaterial({ color: 0x7bcf9e }),
  )
  island.position.y = 2
  group.add(island)

  const wheel = new THREE.Mesh(
    new THREE.TorusGeometry(14, 1, 16, 60),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x7dd3fc, emissiveIntensity: 0.2 }),
  )
  wheel.position.set(28, 20, -4)
  wheel.rotation.y = Math.PI / 2
  group.add(wheel)

  const support = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 24, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x334155 }),
  )
  support.position.copy(wheel.position).add(new THREE.Vector3(0, -12, 0))
  group.add(support)

  scene.add(group)
  return group
}

function addGateOfOrient(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group()
  group.position.set(0, 0, 90)

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x9ec0de,
    metalness: 0.7,
    roughness: 0.25,
  })
  const left = new THREE.Mesh(new THREE.BoxGeometry(20, 112, 18), shellMat)
  left.position.set(-16, 56, 0)
  group.add(left)

  const right = left.clone()
  right.position.x = 16
  group.add(right)

  const crown = new THREE.Mesh(new THREE.BoxGeometry(58, 15, 18), shellMat)
  crown.position.set(0, 104, 0)
  group.add(crown)

  const voidCut = new THREE.Mesh(
    new THREE.BoxGeometry(26, 72, 19),
    new THREE.MeshStandardMaterial({ color: 0x9cd5ff }),
  )
  voidCut.position.set(0, 40, 0)
  group.add(voidCut)

  scene.add(group)
  return group
}

function addPagoda(
  scene: THREE.Scene,
  basePos: THREE.Vector3,
  tiers: number,
  color: number,
  tilt = 0,
): THREE.Group {
  const group = new THREE.Group()
  group.position.copy(basePos)
  group.rotation.z = tilt

  const bodyMaterial = new THREE.MeshStandardMaterial({ color })
  for (let i = 0; i < tiers; i += 1) {
    const width = Math.max(4.5, 13 - i * 1.05)
    const tier = new THREE.Mesh(new THREE.CylinderGeometry(width * 0.78, width, 3.2, 8), bodyMaterial)
    tier.position.y = i * 3.1 + 1.6
    group.add(tier)

    const roof = new THREE.Mesh(
      new THREE.CylinderGeometry(width + 1.8, width + 1.1, 0.95, 8),
      new THREE.MeshStandardMaterial({ color: 0x4b5563 }),
    )
    roof.position.y = i * 3.1 + 3
    group.add(roof)
  }

  const top = new THREE.Mesh(new THREE.ConeGeometry(1.4, 6, 10), new THREE.MeshStandardMaterial({ color: 0xf59e0b }))
  top.position.y = tiers * 3.1 + 2
  group.add(top)
  scene.add(group)
  return group
}

function addSuzhouMuseum(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group()
  group.position.set(-222, 0, 150)

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(68, 16, 42),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 }),
  )
  body.position.y = 8
  group.add(body)

  const hall = new THREE.Mesh(
    new THREE.BoxGeometry(24, 22, 26),
    new THREE.MeshStandardMaterial({ color: 0xffffff }),
  )
  hall.position.set(2, 11, 3)
  group.add(hall)

  const roofMain = new THREE.Mesh(
    new THREE.ConeGeometry(26, 8, 4),
    new THREE.MeshStandardMaterial({ color: 0x1f2937 }),
  )
  roofMain.rotation.y = Math.PI / 4
  roofMain.position.set(2, 24, 3)
  group.add(roofMain)

  const sideRoof = roofMain.clone()
  sideRoof.scale.set(0.55, 0.8, 0.45)
  sideRoof.position.set(-22, 18, -9)
  group.add(sideRoof)

  scene.add(group)
  return group
}

function addBaodaiBridge(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group()
  group.position.set(-72, 0, -188)
  group.rotation.y = 0.32

  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(132, 3, 14),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }),
  )
  deck.position.y = 12
  group.add(deck)

  for (let i = 0; i < 12; i += 1) {
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(5, 0.5, 12, 30, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc }),
    )
    arch.position.set(-58 + i * 10.7, 8.5, 0)
    arch.rotation.z = Math.PI
    group.add(arch)
  }

  scene.add(group)
  return group
}

function addVitalityIsland(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group()
  group.position.set(192, 0, -128)

  const island = new THREE.Mesh(
    new THREE.CylinderGeometry(30, 34, 6, 32),
    new THREE.MeshStandardMaterial({ color: 0x86efac }),
  )
  island.position.y = 3
  group.add(island)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(16, 2, 16, 56),
    new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x06b6d4, emissiveIntensity: 0.15 }),
  )
  ring.position.y = 26
  ring.rotation.x = Math.PI / 2
  group.add(ring)

  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 7, 40, 16),
    new THREE.MeshStandardMaterial({ color: 0x22d3ee }),
  )
  tower.position.y = 21
  group.add(tower)

  const twin = tower.clone()
  twin.scale.set(0.6, 0.65, 0.6)
  twin.position.set(11, 14, -8)
  group.add(twin)

  scene.add(group)
  return group
}

export function createSuzhouLandmarks(scene: THREE.Scene): LandmarkRoutePoint[] {
  addGateOfOrient(scene)
  addJinjiLake(scene)
  addPagoda(scene, new THREE.Vector3(-126, 0, 262), 9, 0xd8b47f, 0)
  addSuzhouMuseum(scene)
  addPagoda(scene, new THREE.Vector3(-292, 0, -8), 7, 0xbc8c5a, 0.14)
  addBaodaiBridge(scene)
  addVitalityIsland(scene)

  const route: LandmarkRoutePoint[] = [
    createCheckpointRing(scene, '园区·东方之门', new THREE.Vector3(0, 48, 135), 0x67e8f9, 17),
    createCheckpointRing(scene, '园区·金鸡湖', new THREE.Vector3(110, 38, 220), 0x38bdf8, 17),
    createCheckpointRing(scene, '姑苏区·北寺塔', new THREE.Vector3(-120, 50, 220), 0xfbbf24, 16),
    createCheckpointRing(scene, '姑苏区·博物馆', new THREE.Vector3(-205, 34, 130), 0xf59e0b, 16),
    createCheckpointRing(scene, '高新区·虎丘塔', new THREE.Vector3(-268, 44, -24), 0xf97316, 16),
    createCheckpointRing(scene, '吴中区·宝带桥', new THREE.Vector3(-40, 32, -205), 0x60a5fa, 17),
    createCheckpointRing(scene, '相城区·活力岛', new THREE.Vector3(190, 42, -100), 0x22d3ee, 18),
  ]

  const routeCurve = new THREE.CatmullRomCurve3(route.map((item) => item.ringPosition))
  const points = routeCurve.getPoints(220)
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineDashedMaterial({
      color: 0x93c5fd,
      dashSize: 5,
      gapSize: 3,
      transparent: true,
      opacity: 0.45,
    }),
  )
  line.computeLineDistances()
  scene.add(line)

  return route
}
