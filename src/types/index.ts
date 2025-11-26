export interface Vec2 {
	x: number
	y: number
}

export interface Vec3 {
	x: number
	y: number
	z: number
}

export interface Point2D {
	x: number
	y: number
}

export interface PendulumState {
	theta: number // Azimuthal angle (radians)
	phi: number // Polar angle from vertical (radians)
	thetaDot: number // Angular velocity theta (rad/s)
	phiDot: number // Angular velocity phi (rad/s)
	time: number // Elapsed time (s)
}

export interface SimulationConfig {
	ropeLength: number // meters
	gravity: number // m/s^2
	damping: number // damping coefficient (0 = no damping)
	timestep: number // seconds per step
	zoom: number // scale factor for visualization
	canvasShape: CanvasShape // measurement area configuration
	initialTheta: number // radians
	initialPhi: number // radians
	initialThetaDot: number // rad/s
	initialPhiDot: number // rad/s
	canvasSwingStart: number // initial canvas swing angle (radians, -0.5 to +0.5)
}

export interface CanvasOscillatorState {
	angle: number // current swing angle (radians)
	angularVelocity: number // angular velocity (rad/s)
}

export interface BoundsConfig {
	centerX: number
	centerZ: number
	scale: number
	canvasWidth: number
	canvasHeight: number
}

export type CanvasShape = 'square-center' | 'a4-portrait' | 'a4-landscape' | '16x9-portrait' | '16x9-landscape'

export type AppMode = 'manual' | 'auto-run'
