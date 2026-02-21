import * as THREE from 'three'
import type { AircraftOption, AircraftType } from './types'

export const AIRCRAFT_OPTIONS: AircraftOption[] = [
  {
    id: 'jetliner',
    name: '云翼客机',
    subtitle: '稳定巡航',
    description: '机身宽、速度适中，适合第一次体验苏州航线。',
    accent: '#3b82f6',
  },
  {
    id: 'fighter',
    name: '雷霆战机',
    subtitle: '灵活转向',
    description: '机翼后掠、加速更快，适合高机动穿越挑战。',
    accent: '#f97316',
  },
  {
    id: 'biplane',
    name: '复古双翼机',
    subtitle: '观景飞行',
    description: '双翼结构、低速更稳，适合欣赏地标建筑细节。',
    accent: '#16a34a',
  },
  {
    id: 'helicopter',
    name: '城市直升机',
    subtitle: '悬停观察',
    description: '可悬停、转向灵活，最适合近距离欣赏苏州地标。',
    accent: '#ef4444',
  },
]

/* ─── Helper Materials ─── */
function metalMat(color: number, metalness = 0.7, roughness = 0.25): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness })
}

function glassMat(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    metalness: 0.4,
    roughness: 0.08,
    transparent: true,
    opacity: 0.72,
    envMapIntensity: 1.2,
  })
}

function engineGlowMat(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.85,
  })
}

/* ─── Jetliner (commercial airliner) ─── */
function createJetliner(): THREE.Group {
  const group = new THREE.Group()
  const bodyColor = 0xe8ecf2
  const accentColor = 0x3b82f6
  const darkAccent = 0x1e3a5f

  // Fuselage – smooth cylinder tapering toward tail
  const fuselageGeo = new THREE.CylinderGeometry(2.8, 2.4, 28, 20)
  const fuselage = new THREE.Mesh(fuselageGeo, metalMat(bodyColor, 0.5, 0.35))
  fuselage.rotation.x = Math.PI / 2
  group.add(fuselage)

  // Blue accent stripe along fuselage
  const stripe = new THREE.Mesh(
    new THREE.CylinderGeometry(2.85, 2.45, 26, 20, 1, false, -0.15, 0.3),
    metalMat(accentColor, 0.6, 0.3),
  )
  stripe.rotation.x = Math.PI / 2
  stripe.position.y = 0.4
  group.add(stripe)

  // Nose cone – sleek rounded
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(2.8, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    metalMat(bodyColor, 0.5, 0.35),
  )
  nose.rotation.x = -Math.PI / 2
  nose.position.z = 14
  group.add(nose)

  // Tail cone
  const tailCone = new THREE.Mesh(new THREE.ConeGeometry(2.4, 6, 20), metalMat(bodyColor, 0.5, 0.35))
  tailCone.rotation.x = -Math.PI / 2
  tailCone.position.z = -17
  group.add(tailCone)

  // Cockpit windshield
  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 3),
    glassMat(),
  )
  cockpit.rotation.x = -Math.PI / 2.5
  cockpit.position.set(0, 1.4, 12)
  group.add(cockpit)

  // Main wings – swept back, with winglets
  const wingShape = new THREE.Shape()
  wingShape.moveTo(0, 0)
  wingShape.lineTo(14, -2)
  wingShape.lineTo(14.5, -2)
  wingShape.lineTo(14.8, -1)       // winglet start
  wingShape.lineTo(14.5, 0.6)      // winglet tip
  wingShape.lineTo(14, 0)
  wingShape.lineTo(1, 1.5)
  wingShape.lineTo(0, 1.2)
  wingShape.closePath()

  const wingExtrudeSettings = { depth: 0.6, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1 }
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings)
  const wingMat = metalMat(bodyColor, 0.55, 0.3)

  const rightWing = new THREE.Mesh(wingGeo, wingMat)
  rightWing.position.set(0, -0.3, 2)
  rightWing.rotation.x = -Math.PI / 2
  group.add(rightWing)

  const leftWing = rightWing.clone()
  leftWing.scale.x = -1
  group.add(leftWing)

  // Horizontal stabilizers
  const hStab = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 3), metalMat(bodyColor, 0.5, 0.35))
  hStab.position.set(0, 0, -15)
  group.add(hStab)

  // Vertical stabilizer (tail fin)
  const vFinShape = new THREE.Shape()
  vFinShape.moveTo(0, 0)
  vFinShape.lineTo(-2, 7)
  vFinShape.lineTo(0.5, 7.5)
  vFinShape.lineTo(2.5, 1)
  vFinShape.closePath()
  const vFinGeo = new THREE.ExtrudeGeometry(vFinShape, { depth: 0.4, bevelEnabled: false })
  const vFin = new THREE.Mesh(vFinGeo, metalMat(accentColor, 0.6, 0.3))
  vFin.position.set(-0.2, 0, -15)
  group.add(vFin)

  // Engines (2 under-wing nacelles)
  const engineGeo = new THREE.CylinderGeometry(1.2, 1.4, 5, 16)
  const engineMaterial = metalMat(darkAccent, 0.7, 0.2)
  const glowMat = engineGlowMat(0x66aaff)

    ;[-6, 6].forEach((x) => {
      const engine = new THREE.Mesh(engineGeo, engineMaterial)
      engine.rotation.x = Math.PI / 2
      engine.position.set(x, -1.8, 1)
      group.add(engine)

      // Engine intake ring
      const intake = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.15, 12, 24), metalMat(0x94a3b8))
      intake.position.set(x, -1.8, 3.5)
      group.add(intake)

      // Engine glow
      const glow = new THREE.Mesh(new THREE.CircleGeometry(1, 16), glowMat)
      glow.position.set(x, -1.8, -1.6)
      glow.rotation.x = Math.PI
      group.add(glow)

      // Pylon connecting engine to wing
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 3), metalMat(bodyColor, 0.5, 0.35))
      pylon.position.set(x, -0.9, 1)
      group.add(pylon)
    })

  // Window dots along fuselage
  const windowMat = glassMat()
  for (let i = -8; i <= 10; i += 1.5) {
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.28, 8), windowMat)
    win.position.set(2.78, 0.6, i)
    win.rotation.y = Math.PI / 2
    group.add(win)

    const winL = win.clone()
    winL.position.x = -2.78
    winL.rotation.y = -Math.PI / 2
    group.add(winL)
  }

  // Landing gear (front and rear)
  const gearMat = metalMat(0x333333, 0.6, 0.4)
  const wheelMat = metalMat(0x1a1a1a, 0.4, 0.7)

  // Front landing gear
  const frontStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.5, 8), gearMat)
  frontStrut.position.set(0, -2.5, 5)
  group.add(frontStrut)

  const frontWheel = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.25, 8, 16), wheelMat)
  frontWheel.position.set(0, -3.8, 5)
  frontWheel.rotation.y = Math.PI / 2
  group.add(frontWheel)

    // Rear landing gear (left and right)
    ;[-4, 4].forEach((x) => {
      const rearStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3, 8), gearMat)
      rearStrut.position.set(x, -2.2, -4)
      rearStrut.rotation.z = x > 0 ? 0.1 : -0.1
      group.add(rearStrut)

      const rearWheel = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.3, 8, 16), wheelMat)
      rearWheel.position.set(x, -3.8, -4)
      rearWheel.rotation.y = Math.PI / 2
      group.add(rearWheel)
    })

  return group
}

/* ─── Fighter Jet ─── */
function createFighter(): THREE.Group {
  const group = new THREE.Group()
  const bodyColor = 0x3d3d4a
  const accentColor = 0xf97316
  const glowColor = 0xff6600

  // Fuselage – sleek elongated
  const fuselage = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 2.2, 22, 16),
    metalMat(bodyColor, 0.75, 0.2),
  )
  fuselage.rotation.x = Math.PI / 2
  group.add(fuselage)

  // Nose cone – very sharp
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 7, 16),
    metalMat(0x555566, 0.8, 0.15),
  )
  nose.rotation.x = Math.PI / 2
  nose.position.z = 14.5
  group.add(nose)

  // Nose sensor/pitot
  const pitot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 3, 8),
    metalMat(0xaaaaaa),
  )
  pitot.rotation.x = Math.PI / 2
  pitot.position.z = 18.5
  group.add(pitot)

  // Canopy (fighter cockpit bubble)
  const canopyGeo = new THREE.SphereGeometry(1.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.2)
  const canopy = new THREE.Mesh(canopyGeo, glassMat())
  canopy.position.set(0, 1.3, 7)
  canopy.rotation.x = -0.2
  group.add(canopy)

  // Canopy frame
  const frameSegMat = metalMat(0x222222)
  for (let a = -0.4; a <= 0.4; a += 0.4) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 3.5), frameSegMat)
    frame.position.set(a, 1.8, 7)
    group.add(frame)
  }

  // Delta wings – aggressive sweep
  const deltaShape = new THREE.Shape()
  deltaShape.moveTo(0, 0)
  deltaShape.lineTo(12, -4)
  deltaShape.lineTo(12.5, -3.5)
  deltaShape.lineTo(3, 2)
  deltaShape.lineTo(0, 2)
  deltaShape.closePath()

  const deltaGeo = new THREE.ExtrudeGeometry(deltaShape, {
    depth: 0.35,
    bevelEnabled: true,
    bevelSize: 0.05,
    bevelThickness: 0.05,
  })

  const rightWing = new THREE.Mesh(deltaGeo, metalMat(bodyColor, 0.75, 0.2))
  rightWing.position.set(0, -0.2, -1)
  rightWing.rotation.x = -Math.PI / 2
  group.add(rightWing)

  const leftWing = rightWing.clone()
  leftWing.scale.x = -1
  group.add(leftWing)

  // Wing accent stripes
  const stripeGeo = new THREE.BoxGeometry(8, 0.02, 0.5)
  const stripeMat = metalMat(accentColor, 0.6, 0.3)
    ;[-1, 1].forEach((side) => {
      const s = new THREE.Mesh(stripeGeo, stripeMat)
      s.position.set(side * 5, 0.1, -0.5)
      group.add(s)
    })

  // Canard wings (small forward wings)
  const canardGeo = new THREE.BoxGeometry(5, 0.2, 1.8)
    ;[-1, 1].forEach((side) => {
      const canard = new THREE.Mesh(canardGeo, metalMat(bodyColor, 0.75, 0.2))
      canard.position.set(side * 3.5, 0, 8)
      canard.rotation.z = side * 0.05
      group.add(canard)
    })

  // Twin vertical stabilizers
  const finShape = new THREE.Shape()
  finShape.moveTo(0, 0)
  finShape.lineTo(-1, 5)
  finShape.lineTo(0, 5.5)
  finShape.lineTo(2, 1)
  finShape.closePath()
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.25, bevelEnabled: false })
    ;[-2.5, 2.5].forEach((x) => {
      const fin = new THREE.Mesh(finGeo, metalMat(bodyColor, 0.75, 0.2))
      fin.position.set(x, 0, -10)
      fin.rotation.z = x > 0 ? -0.15 : 0.15
      group.add(fin)
    })

  // Horizontal stabilizers
  const hStab = new THREE.Mesh(new THREE.BoxGeometry(7, 0.25, 2.5), metalMat(bodyColor, 0.75, 0.2))
  hStab.position.set(0, 0.3, -10)
  group.add(hStab)

  // Afterburner nozzle
  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 1.4, 3, 16),
    metalMat(0x444455, 0.8, 0.15),
  )
  nozzle.rotation.x = Math.PI / 2
  nozzle.position.z = -12
  group.add(nozzle)

  // Afterburner glow
  const abGlow = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 4, 16),
    engineGlowMat(glowColor),
  )
  abGlow.rotation.x = -Math.PI / 2
  abGlow.position.z = -15
  group.add(abGlow)

  // Orange accent on nose and tail tip
  const noseTip = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 12), metalMat(accentColor))
  noseTip.rotation.x = Math.PI / 2
  noseTip.position.z = 18
  group.add(noseTip)

  // Landing gear (front and rear) – folded position
  const gearMat = metalMat(0x2a2a35, 0.7, 0.3)
  const wheelMat = metalMat(0x1a1a1a, 0.5, 0.6)

  // Front landing gear (centerline)
  const frontStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2, 8), gearMat)
  frontStrut.position.set(0, -1.5, 4)
  group.add(frontStrut)

  const frontWheel = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.18, 8, 16), wheelMat)
  frontWheel.position.set(0, -2.6, 4)
  frontWheel.rotation.y = Math.PI / 2
  group.add(frontWheel)

    // Rear landing gear (left and right)
    ;[-2, 2].forEach((x) => {
      const rearStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.2, 8), gearMat)
      rearStrut.position.set(x, -1.3, -6)
      rearStrut.rotation.z = x > 0 ? 0.12 : -0.12
      group.add(rearStrut)

      const rearWheel = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.22, 8, 16), wheelMat)
      rearWheel.position.set(x, -2.4, -6)
      rearWheel.rotation.y = Math.PI / 2
      group.add(rearWheel)
    })

  return group
}

/* ─── Biplane (vintage/retro) ─── */
function createBiplane(): THREE.Group {
  const group = new THREE.Group()
  const bodyColor = 0x1a6b3c
  const accentColor = 0xf5d062
  const woodColor = 0x8b6914

  // Fuselage – rounded vintage shape
  const fuselage = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 2, 18, 14),
    metalMat(bodyColor, 0.3, 0.6),
  )
  fuselage.rotation.x = Math.PI / 2
  group.add(fuselage)

  // Forward cowling
  const cowling = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2, 3, 14),
    metalMat(0x555555, 0.7, 0.3),
  )
  cowling.rotation.x = Math.PI / 2
  cowling.position.z = 10.5
  group.add(cowling)

  // Propeller hub
  const hub = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 12, 12),
    metalMat(0x333333),
  )
  hub.position.z = 12.5
  group.add(hub)

  // Propeller blades
  const bladeMat = metalMat(woodColor, 0.2, 0.7)
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 6, 0.15),
      bladeMat,
    )
    blade.rotation.z = (i * Math.PI * 2) / 3
    blade.position.z = 12.8
    group.add(blade)
  }

  // Tail section
  const tailSection = new THREE.Mesh(
    new THREE.ConeGeometry(1.6, 5, 14),
    metalMat(bodyColor, 0.3, 0.6),
  )
  tailSection.rotation.x = -Math.PI / 2
  tailSection.position.z = -11.5
  group.add(tailSection)

  // Upper wing (wider)
  const upperWing = new THREE.Mesh(
    new THREE.BoxGeometry(22, 0.45, 3.5),
    metalMat(accentColor, 0.25, 0.65),
  )
  upperWing.position.set(0, 3.2, 1)
  group.add(upperWing)

    // Wing tips rounded
    ;[-11, 11].forEach((x) => {
      const tipU = new THREE.Mesh(
        new THREE.CylinderGeometry(1.75, 1.75, 0.45, 12, 1, false, 0, Math.PI),
        metalMat(accentColor, 0.25, 0.65),
      )
      tipU.rotation.z = x > 0 ? 0 : Math.PI
      tipU.rotation.y = Math.PI / 2
      tipU.position.set(x, 3.2, 1)
      group.add(tipU)
    })

  // Lower wing (slightly narrower)
  const lowerWing = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.45, 3.2),
    metalMat(accentColor, 0.25, 0.65),
  )
  lowerWing.position.set(0, -1.2, 1)
  group.add(lowerWing)

  // Struts between wings
  const strutMat = metalMat(woodColor, 0.2, 0.7)
    ;[-7, -3.5, 3.5, 7].forEach((x) => {
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.4, 8), strutMat)
      strut.position.set(x, 1, 1)
      group.add(strut)

      // Cross-wires (diagonal bracing)
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 5.2, 6), metalMat(0x888888))
      wire.rotation.z = 0.35
      wire.position.set(x + 0.5, 1, 1)
      group.add(wire)
    })

  // Tail fin
  const finShape = new THREE.Shape()
  finShape.moveTo(0, 0)
  finShape.lineTo(-1, 4.5)
  finShape.lineTo(0.3, 5)
  finShape.lineTo(2, 0.5)
  finShape.closePath()
  const fin = new THREE.Mesh(
    new THREE.ExtrudeGeometry(finShape, { depth: 0.2, bevelEnabled: false }),
    metalMat(bodyColor, 0.3, 0.6),
  )
  fin.position.set(-0.1, 0, -12)
  group.add(fin)

  // Rudder accent
  const rudder = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 3, 1.5),
    metalMat(accentColor, 0.25, 0.65),
  )
  rudder.position.set(0.15, 2.5, -12.5)
  group.add(rudder)

  // Horizontal tail
  const hTail = new THREE.Mesh(
    new THREE.BoxGeometry(7, 0.35, 2),
    metalMat(bodyColor, 0.3, 0.6),
  )
  hTail.position.set(0, 0.5, -12)
  group.add(hTail)

  // Open cockpit
  const cockpitRim = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.18, 12, 20),
    metalMat(woodColor, 0.2, 0.7),
  )
  cockpitRim.rotation.x = Math.PI / 2
  cockpitRim.position.set(0, 1.6, 4)
  group.add(cockpitRim)

  // Windshield
  const windshield = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.4),
    glassMat(),
  )
  windshield.position.set(0, 2.2, 5.5)
  windshield.rotation.x = -0.4
  group.add(windshield)

  // Landing gear (fixed)
  const gearMat = metalMat(0x444444)
    ;[-2.5, 2.5].forEach((x) => {
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 8), gearMat)
      strut.position.set(x, -3, 3)
      strut.rotation.z = x > 0 ? 0.15 : -0.15
      group.add(strut)

      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.2, 8, 16), metalMat(0x222222))
      wheel.position.set(x, -4.5, 3)
      wheel.rotation.y = Math.PI / 2
      group.add(wheel)
    })

    // Exhaust stubs
    ;[-0.6, 0.6].forEach((x) => {
      const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1, 8), metalMat(0x333333))
      ex.rotation.x = Math.PI / 2
      ex.position.set(x, -0.8, 9)
      group.add(ex)
    })

  return group
}

/* ─── Helicopter ─── */
function createHelicopter(): THREE.Group {
  const group = new THREE.Group()
  const bodyColor = 0xdc2626
  const darkColor = 0x1f2937
  const accentWhite = 0xf8fafc

  // Main fuselage – teardrop / egg shape
  const fuselage = new THREE.Mesh(
    new THREE.SphereGeometry(3, 16, 14),
    metalMat(bodyColor, 0.45, 0.4),
  )
  fuselage.scale.set(1, 0.85, 1.6)
  fuselage.position.set(0, 0, 1)
  group.add(fuselage)

  // White accent stripe
  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 0.05, 0.8),
    metalMat(accentWhite, 0.3, 0.5),
  )
  stripe.position.set(0, 0.4, 1)
  group.add(stripe)

  // Cockpit glass dome (front bubble)
  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat(),
  )
  cockpit.scale.set(1, 0.7, 1.1)
  cockpit.position.set(0, 0.8, 3.5)
  cockpit.rotation.x = -0.3
  group.add(cockpit)

  // Cockpit frame dividers
  const frameMat = metalMat(darkColor, 0.7, 0.3)
  for (let a = -0.4; a <= 0.4; a += 0.4) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 3), frameMat)
    frame.position.set(a, 1.3, 3.5)
    group.add(frame)
  }

  // Engine housing on top
  const engineHousing = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.4, 3),
    metalMat(darkColor, 0.6, 0.35),
  )
  engineHousing.position.set(0, 2.2, 0)
  group.add(engineHousing)

  // Exhaust pipes
  for (const x of [-0.6, 0.6]) {
    const exhaust = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 1.2, 8),
      metalMat(0x555555),
    )
    exhaust.rotation.x = Math.PI / 2
    exhaust.position.set(x, 2.4, -1.8)
    group.add(exhaust)
  }

  // ── Main rotor mast ──
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 2, 8),
    metalMat(darkColor),
  )
  mast.position.set(0, 3.2, 0.5)
  group.add(mast)

  // Rotor hub
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.3, 12),
    metalMat(0x444444),
  )
  hub.position.set(0, 4.3, 0.5)
  group.add(hub)

  // Main rotor blades (4 blades)
  const bladeMat = metalMat(0x374151, 0.5, 0.4)
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.1, 0.8),
      bladeMat,
    )
    blade.rotation.y = (i * Math.PI) / 2
    blade.position.set(0, 4.4, 0.5)
    group.add(blade)
  }

  // ── Tail boom ──
  const tailBoom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 1, 12, 8),
    metalMat(bodyColor, 0.45, 0.4),
  )
  tailBoom.rotation.x = Math.PI / 2
  tailBoom.position.set(0, 0.5, -8)
  group.add(tailBoom)

  // Tail boom white stripe
  const tailStripe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 1.02, 1, 8),
    metalMat(accentWhite, 0.3, 0.5),
  )
  tailStripe.rotation.x = Math.PI / 2
  tailStripe.position.set(0, 0.5, -5)
  group.add(tailStripe)

  // ── Tail fin (vertical stabilizer) ──
  const finShape = new THREE.Shape()
  finShape.moveTo(0, 0)
  finShape.lineTo(-1, 3.5)
  finShape.lineTo(0, 4)
  finShape.lineTo(1.5, 0.5)
  finShape.closePath()
  const fin = new THREE.Mesh(
    new THREE.ExtrudeGeometry(finShape, { depth: 0.15, bevelEnabled: false }),
    metalMat(bodyColor, 0.45, 0.4),
  )
  fin.position.set(-0.08, 0, -13.5)
  group.add(fin)

  // Horizontal stabilizer at tail
  const hStab = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.2, 1.5),
    metalMat(bodyColor, 0.45, 0.4),
  )
  hStab.position.set(0, 1, -13)
  group.add(hStab)

  // ── Tail rotor ──
  const tailRotorMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.8, 6),
    metalMat(darkColor),
  )
  tailRotorMast.rotation.z = Math.PI / 2
  tailRotorMast.position.set(0.5, 2.5, -13.5)
  group.add(tailRotorMast)

  const tailHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.15, 8),
    metalMat(0x444444),
  )
  tailHub.rotation.z = Math.PI / 2
  tailHub.position.set(1, 2.5, -13.5)
  group.add(tailHub)

  // Tail rotor blades (2 blades)
  for (let i = 0; i < 2; i++) {
    const tBlade = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 3.5, 0.5),
      bladeMat,
    )
    tBlade.rotation.z = Math.PI / 2
    tBlade.rotation.x = (i * Math.PI) / 2
    tBlade.position.set(1, 2.5, -13.5)
    group.add(tBlade)
  }

  // ── Skid landing gear ──
  const skidMat = metalMat(darkColor, 0.6, 0.4)
  for (const x of [-1.8, 1.8]) {
    // Skid tube (horizontal)
    const skid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 8, 8),
      skidMat,
    )
    skid.rotation.x = Math.PI / 2
    skid.position.set(x, -2.8, 1)
    group.add(skid)

    // Front support strut
    const frontStrut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6),
      skidMat,
    )
    frontStrut.position.set(x, -1.6, 3)
    frontStrut.rotation.z = x > 0 ? 0.15 : -0.15
    group.add(frontStrut)

    // Rear support strut
    const rearStrut = frontStrut.clone()
    rearStrut.position.set(x, -1.6, -1)
    group.add(rearStrut)
  }

  // ── Doors (side panels) ──
  for (const x of [-3.05, 3.05]) {
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 2),
      metalMat(0xb91c1c, 0.45, 0.4),
    )
    door.position.set(x, 0, 2)
    door.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2
    group.add(door)

    // Door window
    const doorWin = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.8),
      glassMat(),
    )
    doorWin.position.set(x > 0 ? x + 0.02 : x - 0.02, 0.5, 2)
    doorWin.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2
    group.add(doorWin)
  }

  return group
}

export function createAircraft(type: AircraftType): THREE.Group {
  const group = new THREE.Group()

  const core =
    type === 'jetliner'
      ? createJetliner()
      : type === 'fighter'
        ? createFighter()
        : type === 'biplane'
          ? createBiplane()
          : createHelicopter()

  group.add(core)
  return group
}
