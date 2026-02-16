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
]

function createJetliner(material: THREE.MeshStandardMaterial): THREE.Group {
  const group = new THREE.Group()

  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3, 24, 16), material)
  fuselage.rotation.x = Math.PI / 2
  group.add(fuselage)

  const nose = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4.8, 16), material)
  nose.rotation.x = Math.PI / 2
  nose.position.z = 14
  group.add(nose)

  const wing = new THREE.Mesh(new THREE.BoxGeometry(20, 0.8, 4), material)
  wing.position.set(0, -0.2, 2)
  group.add(wing)

  const tailWing = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 2.2), material)
  tailWing.position.set(0, 1.6, -9)
  group.add(tailWing)

  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.5, 2.2), material)
  fin.position.set(0, 3, -9)
  group.add(fin)

  return group
}

function createFighter(material: THREE.MeshStandardMaterial): THREE.Group {
  const group = new THREE.Group()

  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.4, 19, 16), material)
  fuselage.rotation.x = Math.PI / 2
  group.add(fuselage)

  const nose = new THREE.Mesh(new THREE.ConeGeometry(1.9, 4.5, 16), material)
  nose.rotation.x = Math.PI / 2
  nose.position.z = 11.5
  group.add(nose)

  const wing = new THREE.Mesh(new THREE.ConeGeometry(10, 0.9, 3), material)
  wing.rotation.z = Math.PI / 2
  wing.position.set(0, -0.3, 1)
  group.add(wing)

  const tail = new THREE.Mesh(new THREE.BoxGeometry(5, 0.7, 2), material)
  tail.position.set(0, 1.2, -7)
  group.add(tail)

  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.5, 1.8), material)
  fin.position.set(0, 2.3, -7)
  group.add(fin)

  return group
}

function createBiplane(material: THREE.MeshStandardMaterial): THREE.Group {
  const group = new THREE.Group()

  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 18, 14), material)
  fuselage.rotation.x = Math.PI / 2
  group.add(fuselage)

  const nose = new THREE.Mesh(new THREE.ConeGeometry(1.8, 4, 14), material)
  nose.rotation.x = Math.PI / 2
  nose.position.z = 10.5
  group.add(nose)

  const upperWing = new THREE.Mesh(new THREE.BoxGeometry(16, 0.6, 3.2), material)
  upperWing.position.set(0, 2.2, 0)
  group.add(upperWing)

  const lowerWing = upperWing.clone()
  lowerWing.position.y = -1
  group.add(lowerWing)

  const strutMat = new THREE.MeshStandardMaterial({ color: 0x2f2f2f, metalness: 0.2 })
  ;[-5, 0, 5].forEach((x) => {
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 0.25), strutMat)
    left.position.set(x, 0.6, -0.4)
    group.add(left)

    const right = left.clone()
    right.position.z = 0.8
    group.add(right)
  })

  const tail = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 1.8), material)
  tail.position.set(0, 1, -6.8)
  group.add(tail)

  return group
}

export function createAircraft(type: AircraftType): THREE.Group {
  const group = new THREE.Group()
  const material = new THREE.MeshStandardMaterial({
    color:
      type === 'jetliner' ? 0x6ea8ff : type === 'fighter' ? 0xff8a3d : 0x43c786,
    roughness: 0.38,
    metalness: 0.55,
  })

  const core =
    type === 'jetliner'
      ? createJetliner(material)
      : type === 'fighter'
        ? createFighter(material)
        : createBiplane(material)

  group.add(core)

  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.3,
      roughness: 0.15,
      transparent: true,
      opacity: 0.8,
    }),
  )
  cockpit.scale.set(1.1, 0.7, 1)
  cockpit.position.set(0, 1.2, 5)
  group.add(cockpit)

  return group
}
