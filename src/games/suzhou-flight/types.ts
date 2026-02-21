import type * as THREE from 'three'

export type AircraftType = 'jetliner' | 'fighter' | 'biplane' | 'helicopter'

export interface AircraftOption {
  id: AircraftType
  name: string
  subtitle: string
  description: string
  accent: string
}

export interface LandmarkRoutePoint {
  id: string
  name: string
  district: string
  ringRadius: number
  ring: THREE.Mesh
  ringPulse: number
  ringPosition: THREE.Vector3
}
