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
	initialTheta: number // radians
	initialPhi: number // radians
	initialThetaDot: number // rad/s
	initialPhiDot: number // rad/s
}

export interface BoundsConfig {
	centerX: number
	centerZ: number
	scale: number
}
