import * as THREE from 'three'
import type { LandmarkRoutePoint } from './types'

/* ─── Label Sprite ─── */
function createLabelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 640; canvas.height = 160
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.Sprite()
  const r = 24
  ctx.beginPath()
  ctx.moveTo(r, 0); ctx.lineTo(canvas.width - r, 0)
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r)
  ctx.lineTo(canvas.width, canvas.height - r)
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height)
  ctx.lineTo(r, canvas.height)
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r)
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath()
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
  grad.addColorStop(0, 'rgba(15,23,42,0.88)'); grad.addColorStop(1, 'rgba(30,58,95,0.82)')
  ctx.fillStyle = grad; ctx.fill()
  ctx.strokeStyle = 'rgba(56,189,248,0.9)'; ctx.lineWidth = 5; ctx.stroke()
  ctx.shadowColor = 'rgba(56,189,248,0.6)'; ctx.shadowBlur = 12
  ctx.fillStyle = '#f0f9ff'
  ctx.font = 'bold 48px "PingFang SC","Microsoft YaHei",sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  const tex = new THREE.CanvasTexture(canvas); tex.needsUpdate = true
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }))
  s.scale.set(42, 10.5, 1); return s
}

/* ─── Checkpoint Ring ─── */
function createCheckpointRing(scene: THREE.Scene, text: string, pos: THREE.Vector3, color: number, radius: number): LandmarkRoutePoint {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 1.5, 24, 96),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.2 }),
  )
  ring.position.copy(pos); scene.add(ring)
  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(radius - 2, 0.35, 12, 72),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: 0.7, transparent: true, opacity: 0.4 }),
  )
  inner.position.copy(pos); scene.add(inner)
  const pMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: 1, transparent: true, opacity: 0.7 })
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), pMat)
    d.position.set(pos.x + Math.cos(a) * radius, pos.y + Math.sin(a) * radius, pos.z)
    scene.add(d)
  }
  const label = createLabelSprite(text)
  label.position.set(pos.x, pos.y + radius + 11, pos.z); scene.add(label)
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 8), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 }))
  arrow.position.set(pos.x, pos.y + radius + 4, pos.z); arrow.rotation.x = Math.PI; scene.add(arrow)
  return { id: text, name: text.split('·')[1] ?? text, district: text.split('·')[0] ?? '苏州', ringRadius: radius + 2, ring, ringPulse: Math.random() * Math.PI * 2, ringPosition: pos.clone() }
}

/* ══════════════════════════════════════════
   1. 东方之门 Gate of the Orient
   301.8m twin towers, connected at top forming "门" shape
   Towers lean outward at base, converge near top with arch/bridge
   Glass curtain wall, void opening in the center
   ══════════════════════════════════════════ */
function addGateOfOrient(scene: THREE.Scene): THREE.Group {
  const g = new THREE.Group(); g.position.set(0, 0, 90)
  const glass = new THREE.MeshStandardMaterial({ color: 0x7db8e0, metalness: 0.85, roughness: 0.12, transparent: true, opacity: 0.88 })
  const frame = new THREE.MeshStandardMaterial({ color: 0x8faabe, metalness: 0.9, roughness: 0.15 })
  const H = 130 // scaled height
  // Two towers forming the "裤子/门" shape: wider apart at bottom, meeting at top
  for (const side of [-1, 1]) {
    // Each tower is built from segments that curve inward
    const segs = 20
    for (let i = 0; i < segs; i++) {
      const t = i / segs
      // Parametric x-offset: spread apart at bottom, converge at ~75%, then arch outward slightly at very top
      const spread = t < 0.75
        ? 18 - t * 14  // converge from 18 to ~7.5
        : 7.5 + (t - 0.75) * 6 // slight outward at crown
      const xOff = side * spread
      const segH = H / segs
      const w = 10 - t * 1.5 // narrower toward top
      const seg = new THREE.Mesh(new THREE.BoxGeometry(w, segH, 9), glass)
      seg.position.set(xOff, i * segH + segH / 2, 0)
      g.add(seg)
      // Frame lines every 4 segments
      if (i % 4 === 0) {
        const fl = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.4, 9.3), frame)
        fl.position.copy(seg.position); fl.position.y += segH / 2; g.add(fl)
      }
    }
  }
  // Connection bridge/arch at top (~75% height, where towers meet)
  const bridgeY = H * 0.75
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(17, 12, 9), glass)
  bridge.position.set(0, bridgeY + 6, 0); g.add(bridge)
  // Crown arch above bridge
  const archCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, bridgeY + 12, 0),
    new THREE.Vector3(-5, H + 5, 0),
    new THREE.Vector3(0, H + 8, 0),
    new THREE.Vector3(5, H + 5, 0),
    new THREE.Vector3(10, bridgeY + 12, 0),
  ])
  const archGeo = new THREE.TubeGeometry(archCurve, 24, 3.5, 8, false)
  g.add(new THREE.Mesh(archGeo, glass))
  // Center void (the "门" opening) - dark space between legs below bridge
  const voidMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
  const voidP = new THREE.Mesh(new THREE.PlaneGeometry(14, bridgeY - 5), voidMat)
  voidP.position.set(0, bridgeY / 2, 0); g.add(voidP)
  // Podium base
  const podium = new THREE.Mesh(new THREE.BoxGeometry(60, 6, 30), new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.3, roughness: 0.5 }))
  podium.position.y = 3; g.add(podium)
  // Reflection pool
  const pool = new THREE.Mesh(new THREE.CircleGeometry(40, 48), new THREE.MeshStandardMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.5 }))
  pool.rotation.x = -Math.PI / 2; pool.position.y = 0.1; g.add(pool)
  scene.add(g); return g
}

/* ══════════════════════════════════════════
   2. 金鸡湖 + 摩天轮 (苏州之眼)
   128m Ferris wheel with double-column spoked design, 28 capsules
   Built ON the lake, fan-shaped base, irregular lake shape
   ══════════════════════════════════════════ */
function addJinjiLake(scene: THREE.Scene): THREE.Group {
  const g = new THREE.Group(); g.position.set(145, 0, 240)
  // Lake - irregular shape
  const lakeMat = new THREE.MeshStandardMaterial({ color: 0x3a8fd4, transparent: true, opacity: 0.8, roughness: 0.05, metalness: 0.6 })
  const lakeShape = new THREE.Shape()
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2
    const rx = 85 + Math.sin(a * 3) * 8, ry = 65 + Math.cos(a * 2) * 6
    if (i === 0) lakeShape.moveTo(Math.cos(a) * rx, Math.sin(a) * ry)
    else lakeShape.lineTo(Math.cos(a) * rx, Math.sin(a) * ry)
  }
  const lake = new THREE.Mesh(new THREE.ShapeGeometry(lakeShape), lakeMat)
  lake.rotation.x = -Math.PI / 2; lake.position.y = 0.15; g.add(lake)
  // Shore
  const shore = new THREE.Mesh(new THREE.RingGeometry(78, 92, 48), new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.85 }))
  shore.rotation.x = -Math.PI / 2; shore.position.y = 0.05; g.add(shore)
  // --- Ferris Wheel (苏州之眼) 128m → scale ~55 units ---
  const wg = new THREE.Group(); wg.position.set(35, 0, -20); g.add(wg)
  const wR = 28 // wheel radius
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xa78bfa, emissiveIntensity: 0.2, metalness: 0.7, roughness: 0.2 })
  // Double support columns (A-frame legs going into the lake)
  const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 })
  for (const z of [-5, 5]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.8, wR + 10, 8), legMat)
    leg.position.set(0, (wR + 10) / 2, z); leg.rotation.z = z > 0 ? 0.06 : -0.06; wg.add(leg)
  }
  // Cross braces
  for (let h = 8; h < wR + 6; h += 10) {
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 12), legMat)
    br.position.set(0, h, 0); wg.add(br)
  }
  // Wheel rim (double rim)
  const cy = wR + 10
  for (const dr of [-0.8, 0.8]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(wR, 0.5, 12, 64), rimMat)
    rim.position.set(0, cy, dr); rim.rotation.y = Math.PI / 2; wg.add(rim)
  }
  // Spokes (28 spokes matching 28 capsules)
  const spokeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.6 })
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, wR, 6), spokeMat)
    spoke.position.set(0, cy, 0)
    spoke.rotation.set(a, 0, Math.PI / 2); spoke.rotateOnAxis(new THREE.Vector3(0, 0, 1), 0)
    // Simplified: position at center, rotate
    spoke.rotation.x = a; spoke.rotation.y = Math.PI / 2
    wg.add(spoke)
  }
  // 28 capsules (egg-shaped pods)
  const capMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 0.15, metalness: 0.4 })
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2
    const cap = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), capMat)
    cap.scale.set(0.7, 1, 0.7)
    cap.position.set(0, cy + Math.sin(a) * wR, Math.cos(a) * wR); wg.add(cap)
  }
  // Fan-shaped base building
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.3, roughness: 0.5 })
  const fanShape = new THREE.Shape()
  fanShape.moveTo(0, 0)
  for (let a = -0.8; a <= 0.8; a += 0.1) fanShape.lineTo(Math.sin(a) * 18, Math.cos(a) * 18)
  fanShape.lineTo(0, 0)
  const fan = new THREE.Mesh(new THREE.ExtrudeGeometry(fanShape, { depth: 8, bevelEnabled: false }), baseMat)
  fan.rotation.x = -Math.PI / 2; fan.position.set(0, 0, 10); wg.add(fan)
  // Small island with trees
  const island = new THREE.Mesh(new THREE.CylinderGeometry(10, 14, 4, 24), new THREE.MeshStandardMaterial({ color: 0x5eead4, roughness: 0.7 }))
  island.position.set(-20, 2, 15); g.add(island)
  const tMat = new THREE.MeshStandardMaterial({ color: 0x16a34a })
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const tr = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), tMat)
    tr.position.set(-20 + Math.cos(a) * 6, 6, 15 + Math.sin(a) * 6); g.add(tr)
  }
  scene.add(g); return g
}

/* ══════════════════════════════════════════
   3. 北寺塔 Beisi Pagoda - 76m, 9-story octagonal
   Brick-wood, double eaves with flying corners, narrowing pyramid
   ══════════════════════════════════════════ */
function addBeiSiPagoda(scene: THREE.Scene, pos: THREE.Vector3): THREE.Group {
  const g = new THREE.Group(); g.position.copy(pos)
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd4a76a, metalness: 0.15, roughness: 0.65 })
  const eaveMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.3, roughness: 0.5 })
  const railMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.5, roughness: 0.4 })
  // Base platform
  g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(16, 18, 4, 8), new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.7 })), { position: new THREE.Vector3(0, 2, 0) }))
  let y = 4
  for (let i = 0; i < 9; i++) {
    const w = 12 - i * 0.95, h = 4.8 - i * 0.18
    // Octagonal body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.82, w, h, 8), bodyMat)
    body.position.y = y + h / 2; g.add(body)
    // Windows (dark niches on alternating faces)
    const winMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
    for (let ww = 0; ww < (i < 7 ? 4 : 0); ww++) {
      const a = (ww / 4) * Math.PI * 2 + (i % 2 ? Math.PI / 8 : 0)
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.2), winMat)
      win.position.set(Math.cos(a) * w * 0.83, y + h / 2, Math.sin(a) * w * 0.83)
      win.lookAt(0, win.position.y, 0); g.add(win)
    }
    // Double eave with upturned "flying corners"
    const eo = w + 3.2 - i * 0.25
    const eave = new THREE.Mesh(new THREE.CylinderGeometry(w + 0.4, eo, 1, 8), eaveMat)
    eave.position.y = y + h; g.add(eave)
    // Flying corner tips (small upturned spheres at each octagon vertex)
    for (let c = 0; c < 8; c++) {
      const ca = (c / 8) * Math.PI * 2 + Math.PI / 8
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), eaveMat)
      tip.position.set(Math.cos(ca) * (eo + 0.2), y + h + 0.6, Math.sin(ca) * (eo + 0.2)); g.add(tip)
    }
    // Second (inner) eave for "double eave" effect
    if (i < 7) {
      const eave2 = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.9, w + 1.5, 0.6, 8), eaveMat)
      eave2.position.y = y + h * 0.55; g.add(eave2)
    }
    // Balcony railing (gold)
    if (i < 6) {
      const rail = new THREE.Mesh(new THREE.TorusGeometry(w + 0.2, 0.1, 6, 8), railMat)
      rail.rotation.x = Math.PI / 2; rail.position.y = y + h - 0.3; g.add(rail)
    }
    y += h + 1.1
  }
  // Golden spire finial
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.7, roughness: 0.2 }))
  ball.position.y = y; g.add(ball)
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.8, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.7, roughness: 0.2 }))
  spire.position.y = y + 5; g.add(spire)
  scene.add(g); return g
}

/* ══════════════════════════════════════════
   4. 苏州博物馆 Suzhou Museum (I.M. Pei)
   White walls + dark geometric diamond roofs (白墙黛瓦)
   Triangular glass entrance, rock garden courtyard
   Low-rise, multiple wings with pyramid roofs
   ══════════════════════════════════════════ */
function addSuzhouMuseum(scene: THREE.Scene): THREE.Group {
  const g = new THREE.Group(); g.position.set(-222, 0, 150)
  const white = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.75, metalness: 0.1 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.25, roughness: 0.5 })
  const glassM = new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.5 })
  // Main hall
  const main = new THREE.Mesh(new THREE.BoxGeometry(48, 13, 34), white); main.position.set(0, 6.5, 0); g.add(main)
  // Central diamond/pyramid roof (Pei's signature: rotated 45° square pyramid = diamond)
  const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(20, 12, 4), dark)
  mainRoof.rotation.y = Math.PI / 4; mainRoof.position.set(0, 19, 0); g.add(mainRoof)
  // Left wing
  const lw = new THREE.Mesh(new THREE.BoxGeometry(26, 10, 22), white); lw.position.set(-30, 5, -3); g.add(lw)
  const lr = new THREE.Mesh(new THREE.ConeGeometry(14, 8, 4), dark)
  lr.rotation.y = Math.PI / 4; lr.position.set(-30, 13, -3); g.add(lr)
  // Right wing
  const rw = new THREE.Mesh(new THREE.BoxGeometry(26, 10, 22), white); rw.position.set(30, 5, -3); g.add(rw)
  const rr = new THREE.Mesh(new THREE.ConeGeometry(14, 8, 4), dark)
  rr.rotation.y = Math.PI / 4; rr.position.set(30, 13, -3); g.add(rr)
  // Smaller rear pavilions with diamond roofs
  for (const x of [-18, 18]) {
    const pav = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 14), white); pav.position.set(x, 4, -20); g.add(pav)
    const pr = new THREE.Mesh(new THREE.ConeGeometry(9, 6, 4), dark)
    pr.rotation.y = Math.PI / 4; pr.position.set(x, 11, -20); g.add(pr)
  }
  // Triangular glass entrance facade
  const tri = new THREE.Shape(); tri.moveTo(-7, 0); tri.lineTo(7, 0); tri.lineTo(0, 13); tri.closePath()
  const entrance = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.4, bevelEnabled: false }), glassM)
  entrance.position.set(-0.2, 0, 17.2); g.add(entrance)
  // Horizontal frame lines on facade (Pei's geometric grid)
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.4 })
  for (let i = 0; i < 3; i++) {
    const fl = new THREE.Mesh(new THREE.BoxGeometry(50, 0.25, 0.25), frameMat)
    fl.position.set(0, 3 + i * 4, 17.3); g.add(fl)
  }
  // Rock garden courtyard (Pei's abstract mountain stones)
  const pond = new THREE.Mesh(new THREE.CircleGeometry(11, 32), new THREE.MeshStandardMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.45, roughness: 0.08, metalness: 0.4 }))
  pond.rotation.x = -Math.PI / 2; pond.position.set(0, 0.2, -34); g.add(pond)
  // Abstract rock slabs (Pei's signature: thin vertical stone slabs arranged like a mountain painting)
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.8 })
  const slabs = [
    { x: -3, z: -33, w: 0.4, h: 7, d: 3 },
    { x: 0, z: -35, w: 0.4, h: 9, d: 2.5 },
    { x: 2, z: -32, w: 0.4, h: 6, d: 2.8 },
    { x: 4, z: -36, w: 0.4, h: 8, d: 2 },
    { x: -1, z: -37, w: 0.4, h: 5, d: 3.5 },
  ]
  slabs.forEach(s => {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), rockMat)
    slab.position.set(s.x, s.h / 2 + 0.3, s.z); g.add(slab)
  })
  // White perimeter wall
  const wall = new THREE.Mesh(new THREE.BoxGeometry(90, 6, 0.5), white)
  wall.position.set(0, 3, -42); g.add(wall)
  // Path to entrance
  const path = new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.8 }))
  path.position.set(0, 0.06, 25); g.add(path)
  scene.add(g); return g
}

/* ══════════════════════════════════════════
   5. 虎丘塔 Tiger Hill Pagoda (Yunyan Temple Pagoda)
   7-story octagonal brick, 47m tall, famous ~3.5° lean
   Sits on a hill, brick imitating wood, no internal stairway
   ══════════════════════════════════════════ */
function addHuqiuPagoda(scene: THREE.Scene, pos: THREE.Vector3): THREE.Group {
  // Hill base
  const hill = new THREE.Mesh(new THREE.ConeGeometry(30, 20, 16), new THREE.MeshStandardMaterial({ color: 0x6b8e4c, roughness: 0.9 }))
  hill.position.set(pos.x, 10, pos.z); scene.add(hill)
  const g = new THREE.Group(); g.position.set(pos.x, 18, pos.z)
  g.rotation.z = 0.06 // Famous 3.5° lean (~0.06 rad)
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xbc8c5a, metalness: 0.12, roughness: 0.72 })
  const eaveMat = new THREE.MeshStandardMaterial({ color: 0x44403c, metalness: 0.3, roughness: 0.55 })
  // Stone base wall
  const base = new THREE.Mesh(new THREE.CylinderGeometry(11, 13, 5, 8), new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.8 }))
  base.position.y = 2.5; g.add(base)
  let y = 5
  for (let i = 0; i < 7; i++) {
    const w = 9.5 - i * 0.95, h = 5.8 - i * 0.3
    const body = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.82, w, h, 8), bodyMat)
    body.position.y = y + h / 2; g.add(body)
    // Brick texture lines
    for (let l = 1; l <= 3; l++) {
      const bl = new THREE.Mesh(new THREE.TorusGeometry(w * 0.84, 0.06, 4, 8), new THREE.MeshStandardMaterial({ color: 0xa0845c }))
      bl.rotation.x = Math.PI / 2; bl.position.y = y + h * l / 4; g.add(bl)
    }
    // 壶门 (pot-shaped door openings) on alternating faces
    const winMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 })
    for (let ww = 0; ww < 4; ww++) {
      const a = (ww / 4) * Math.PI * 2 + (i % 2 ? Math.PI / 4 : 0)
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1, 2.5), winMat)
      win.position.set(Math.cos(a) * w * 0.83, y + h * 0.5, Math.sin(a) * w * 0.83)
      win.lookAt(0, win.position.y, 0); g.add(win)
    }
    // Eave
    const eo = w + 2.5 - i * 0.15
    const eave = new THREE.Mesh(new THREE.CylinderGeometry(w + 0.3, eo, 0.8, 8), eaveMat)
    eave.position.y = y + h; g.add(eave)
    y += h + 0.8
  }
  // Simple finial
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.7, 5, 8), new THREE.MeshStandardMaterial({ color: 0x78716c, metalness: 0.4 }))
  spire.position.y = y + 2.5; g.add(spire)
  scene.add(g); return g
}

/* ══════════════════════════════════════════
   6. 宝带桥 Baodai Bridge
   317m long, 53 arches, center 3 arches taller
   Stone bridge like a jade belt on water, stone lions at ends
   ══════════════════════════════════════════ */
function addBaodaiBridge(scene: THREE.Scene): THREE.Group {
  const g = new THREE.Group(); g.position.set(-72, 0, -188); g.rotation.y = 0.32
  const stone = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.75, metalness: 0.1 })
  const L = 180, archN = 26 // simplified from 53
  const sp = L / archN
  // Deck with gentle arch (higher in center)
  const deckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-L / 2, 7, 0), new THREE.Vector3(-L / 4, 8.5, 0),
    new THREE.Vector3(0, 10.5, 0), new THREE.Vector3(L / 4, 8.5, 0), new THREE.Vector3(L / 2, 7, 0),
  ])
  const deckShape = new THREE.Shape()
  deckShape.moveTo(-2, -1.2); deckShape.lineTo(2, -1.2); deckShape.lineTo(2, 0); deckShape.lineTo(-2, 0); deckShape.closePath()
  const deckGeo = new THREE.ExtrudeGeometry(deckShape, { steps: 60, extrudePath: deckCurve, bevelEnabled: false })
  g.add(new THREE.Mesh(deckGeo, stone))
  // Arches
  const darkStone = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.8, metalness: 0.1 })
  for (let i = 0; i < archN; i++) {
    const x = -L / 2 + sp * (i + 0.5)
    const t = (i + 0.5) / archN
    const yy = 7 + Math.sin(t * Math.PI) * 3.5
    const isCenter = Math.abs(i - archN / 2) < 1.5
    const ar = isCenter ? 4.5 : 3
    const arch = new THREE.Mesh(new THREE.TorusGeometry(ar, 0.5, 10, 20, Math.PI), darkStone)
    arch.position.set(x, yy - ar, 0); arch.rotation.z = Math.PI; g.add(arch)
  }
  // Balustrades
  const postMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f4, roughness: 0.7 })
  for (let i = 0; i < archN * 2; i++) {
    const x = -L / 2 + (L / (archN * 2)) * (i + 0.5)
    const t = (i + 0.5) / (archN * 2)
    const yBase = 7 + Math.sin(t * Math.PI) * 3.5
    for (const z of [-1.8, 1.8]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2, 6), postMat)
      post.position.set(x, yBase + 1, z); g.add(post)
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), postMat)
      cap.position.set(x, yBase + 2.1, z); g.add(cap)
    }
  }
  // Stone lions at bridge ends
  const lionMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.7 })
  for (const x of [-L / 2, L / 2]) {
    for (const z of [-2, 2]) {
      const lion = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 1.2), lionMat)
      lion.position.set(x, 8.5, z); g.add(lion)
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), lionMat)
      head.position.set(x, 10, z); g.add(head)
    }
  }
  // Octagonal stone tower at north end
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.3, 6, 8), new THREE.MeshStandardMaterial({ color: 0xd6d3d1 }))
  tower.position.set(L / 2 + 5, 10, 0); g.add(tower)
  const tTop = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2, 8), new THREE.MeshStandardMaterial({ color: 0x78716c }))
  tTop.position.set(L / 2 + 5, 14, 0); g.add(tTop)
  // Water beneath
  const water = new THREE.Mesh(new THREE.PlaneGeometry(L + 40, 40), new THREE.MeshStandardMaterial({ color: 0x4d9df5, transparent: true, opacity: 0.4, roughness: 0.08, metalness: 0.5 }))
  water.rotation.x = -Math.PI / 2; water.position.y = 0.1; g.add(water)
  scene.add(g); return g
}

/* ══════════════════════════════════════════
   7. 活力岛 Vitality Island
   Fan-shaped steel stage (小巨蛋), 100m×20m with LED
   Looks like a giant sailboat, fountain plaza, "Vitality Ring"
   ══════════════════════════════════════════ */
function addVitalityIsland(scene: THREE.Scene): THREE.Group {
  const g = new THREE.Group(); g.position.set(192, 0, -128)
  // Island base
  const isl = new THREE.Mesh(new THREE.CylinderGeometry(38, 42, 5, 32), new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.7 }))
  isl.position.y = 2.5; g.add(isl)
  // Plaza
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(30, 32), new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.6, metalness: 0.2 }))
  plaza.rotation.x = -Math.PI / 2; plaza.position.y = 5.1; g.add(plaza)
  // --- 小巨蛋: Fan-shaped steel stage (like a giant sail/shell) ---
  const stageMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.2, side: THREE.DoubleSide })
  // Create fan/sail shape using a curved surface
  const sailShape = new THREE.Shape()
  sailShape.moveTo(0, 0)
  // Fan arc
  for (let a = -1.2; a <= 1.2; a += 0.1) {
    sailShape.lineTo(Math.sin(a) * 25, Math.cos(a) * 25 - 5)
  }
  sailShape.lineTo(0, 0)
  const sail = new THREE.Mesh(new THREE.ExtrudeGeometry(sailShape, { depth: 1, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.3 }), stageMat)
  sail.position.set(0, 5, 0); sail.rotation.x = -0.3; g.add(sail)
  // Steel ribs on the fan
  const ribMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
  for (let i = -4; i <= 4; i++) {
    const a = (i / 5) * 1.2
    const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 26, 6), ribMat)
    rib.position.set(Math.sin(a) * 12.5, 17, Math.cos(a) * 12.5 - 2.5)
    rib.rotation.z = a * 0.5; g.add(rib)
  }
  // LED glow effect on the stage
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, emissive: 0x6366f1, emissiveIntensity: 0.4, transparent: true, opacity: 0.5 })
  const ledPanel = new THREE.Mesh(new THREE.PlaneGeometry(40, 18), ledMat)
  ledPanel.position.set(0, 15, -1); ledPanel.rotation.x = -0.3; g.add(ledPanel)
  // Fountain area (旱喷广场)
  const fountain = new THREE.Mesh(new THREE.CircleGeometry(8, 24), new THREE.MeshStandardMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.4, roughness: 0.05, metalness: 0.5 }))
  fountain.rotation.x = -Math.PI / 2; fountain.position.set(0, 5.2, 20); g.add(fountain)
  // Star-path LED dots
  const starMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.8 })
  for (let i = 0; i < 30; i++) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 4, 4), starMat)
    const a = Math.random() * Math.PI * 2, r = 15 + Math.random() * 15
    dot.position.set(Math.cos(a) * r, 5.15, Math.sin(a) * r); g.add(dot)
  }
  // Tall landscape lights (25m)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 15, 6), new THREE.MeshStandardMaterial({ color: 0x475569 }))
    pole.position.set(Math.cos(a) * 28, 12.5, Math.sin(a) * 28); g.add(pole)
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xfbbf24, emissiveIntensity: 0.5 }))
    light.position.set(Math.cos(a) * 28, 20.5, Math.sin(a) * 28); g.add(light)
  }
  // Trees
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e })
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), treeMat)
    canopy.position.set(Math.cos(a) * 34, 8.5, Math.sin(a) * 34); g.add(canopy)
  }
  // Surrounding water
  const water = new THREE.Mesh(new THREE.RingGeometry(42, 65, 48), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, roughness: 0.08, metalness: 0.5 }))
  water.rotation.x = -Math.PI / 2; water.position.y = 0.1; g.add(water)
  scene.add(g); return g
}

/* ─── City fill buildings ─── */
function addCityBlocks(scene: THREE.Scene) {
  const mats = [
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.3, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0xbfdbfe, metalness: 0.5, roughness: 0.3 }),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4, roughness: 0.4 }),
  ]
  const clusters = [
    { x: 60, z: 50, n: 5 }, { x: -60, z: 180, n: 4 }, { x: 100, z: 120, n: 4 },
    { x: -160, z: 60, n: 4 }, { x: 80, z: -60, n: 3 }, { x: -100, z: -100, n: 3 },
    { x: 240, z: 100, n: 3 }, { x: -200, z: -80, n: 3 }, { x: 150, z: -200, n: 3 },
  ]
  clusters.forEach(c => {
    for (let i = 0; i < c.n; i++) {
      const w = 4 + Math.random() * 7, h = 8 + Math.random() * 28, d = 4 + Math.random() * 7
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats[Math.floor(Math.random() * mats.length)])
      b.position.set(c.x + (Math.random() - 0.5) * 40, h / 2, c.z + (Math.random() - 0.5) * 40)
      scene.add(b)
    }
  })
}

/* ─── Main export ─── */
export function createSuzhouLandmarks(scene: THREE.Scene): LandmarkRoutePoint[] {
  addGateOfOrient(scene)
  addJinjiLake(scene)
  addBeiSiPagoda(scene, new THREE.Vector3(-126, 0, 262))
  addSuzhouMuseum(scene)
  addHuqiuPagoda(scene, new THREE.Vector3(-292, 0, -8))
  addBaodaiBridge(scene)
  addVitalityIsland(scene)
  addCityBlocks(scene)

  const route: LandmarkRoutePoint[] = [
    createCheckpointRing(scene, '园区·东方之门', new THREE.Vector3(0, 58, 135), 0x67e8f9, 18),
    createCheckpointRing(scene, '园区·金鸡湖', new THREE.Vector3(110, 42, 220), 0x38bdf8, 18),
    createCheckpointRing(scene, '姑苏区·北寺塔', new THREE.Vector3(-120, 55, 220), 0xfbbf24, 17),
    createCheckpointRing(scene, '姑苏区·博物馆', new THREE.Vector3(-205, 38, 130), 0xf59e0b, 17),
    createCheckpointRing(scene, '高新区·虎丘塔', new THREE.Vector3(-268, 48, -24), 0xf97316, 17),
    createCheckpointRing(scene, '吴中区·宝带桥', new THREE.Vector3(-40, 34, -205), 0x60a5fa, 18),
    createCheckpointRing(scene, '相城区·活力岛', new THREE.Vector3(190, 45, -100), 0x22d3ee, 19),
  ]

  const curve = new THREE.CatmullRomCurve3(route.map(r => r.ringPosition))
  const pts = curve.getPoints(300)
  const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
  const line = new THREE.Line(lineGeo, new THREE.LineDashedMaterial({ color: 0x93c5fd, dashSize: 6, gapSize: 3, transparent: true, opacity: 0.5 }))
  line.computeLineDistances(); scene.add(line)
  scene.add(new THREE.Line(lineGeo.clone(), new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.15 })))

  return route
}
