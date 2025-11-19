import type { SimulationConfig, Vec3 } from '@/types'

/**
 * Convert spherical coordinates to Cartesian coordinates
 * Origin at suspension point, Y-axis down, right-handed system
 */
export function sphericalToCartesian(theta: number, phi: number, r: number): Vec3 {
	return {
		x: r * Math.sin(phi) * Math.sin(theta),
		y: r * Math.cos(phi),
		z: r * Math.sin(phi) * Math.cos(theta),
	}
}

/**
 * Convert spherical velocity to Cartesian velocity
 */
export function sphericalToCartesianVelocity(
	theta: number,
	phi: number,
	thetaDot: number,
	phiDot: number,
	r: number,
): Vec3 {
	const sinTheta = Math.sin(theta)
	const cosTheta = Math.cos(theta)
	const sinPhi = Math.sin(phi)
	const cosPhi = Math.cos(phi)

	// v = dr/dt
	// x = r * sin(phi) * sin(theta)
	// dx/dt = r * (cos(phi)*phiDot * sin(theta) + sin(phi) * cos(theta)*thetaDot)
	const vx = r * (cosPhi * phiDot * sinTheta + sinPhi * cosTheta * thetaDot)

	// y = r * cos(phi)
	// dy/dt = r * (-sin(phi)*phiDot)
	const vy = r * (-sinPhi * phiDot)

	// z = r * sin(phi) * cos(theta)
	// dz/dt = r * (cos(phi)*phiDot * cos(theta) - sin(phi) * sin(theta)*thetaDot)
	const vz = r * (cosPhi * phiDot * cosTheta - sinPhi * sinTheta * thetaDot)

	return { x: vx, y: vy, z: vz }
}

/**
 * Convert Cartesian coordinates to spherical coordinates
 */
export function cartesianToSpherical(pos: Vec3): { theta: number; phi: number } {
	const r = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z)
	// phi is angle from vertical (Y axis)
	// y = r * cos(phi) -> phi = acos(y/r)
	const phi = Math.acos(Math.max(-1, Math.min(1, pos.y / r)))

	// theta is azimuthal angle in XZ plane
	// x = r * sin(phi) * sin(theta)
	// z = r * sin(phi) * cos(theta)
	// tan(theta) = x/z
	const theta = Math.atan2(pos.x, pos.z)

	return { theta, phi }
}

/**
 * Convert Cartesian velocity to spherical velocity
 */
export function cartesianToSphericalVelocity(
	pos: Vec3,
	vel: Vec3,
): { thetaDot: number; phiDot: number } {
	const r2 = pos.x * pos.x + pos.y * pos.y + pos.z * pos.z
	const rho2 = pos.x * pos.x + pos.z * pos.z // horizontal radius squared

	// If directly vertical (rho2 approx 0), thetaDot is undefined/singular
	// We can just return 0 for thetaDot in that case as it doesn't matter visually
	if (rho2 < 1e-10) {
		return { thetaDot: 0, phiDot: 0 } // phiDot also 0 at limits usually
	}

	// phiDot derivation:
	// phi = atan2(rho, y) where rho = sqrt(x^2 + z^2)
	// phiDot = (y*v_rho - rho*vy) / r^2
	// v_rho is the velocity component in the horizontal plane towards the center
	const thetaDot = (pos.x * vel.z - pos.z * vel.x) / rho2
	const v_rho = (pos.x * vel.x + pos.z * vel.z) / Math.sqrt(rho2)
	const phiDot = (pos.y * v_rho - Math.sqrt(rho2) * vel.y) / r2

	return { thetaDot, phiDot }
}

/**
 * Calculate accelerations for Cartesian pendulum
 * Uses Lagrange multipliers to enforce rod length constraint
 */
export function calculateCartesianAccelerations(
	pos: Vec3,
	vel: Vec3,
	config: SimulationConfig,
): Vec3 {
	const { ropeLength: L, gravity: g, damping: k } = config
	const m = 1 // Mass assumed 1

	// Constraint enforcement
	// Tension T ensures |pos| = L
	// Equation of motion: a = g - (k/m)v - (T/mL)pos
	// Lambda = T/mL = (g.pos + v^2) / L^2
	// g vector is (0, g, 0)
	
	const v2 = vel.x * vel.x + vel.y * vel.y + vel.z * vel.z
	const gDotPos = g * pos.y
	
	const lambda = (gDotPos + v2) / (L * L)
	
	return {
		x: -lambda * pos.x - (k / m) * vel.x,
		y: g - lambda * pos.y - (k / m) * vel.y,
		z: -lambda * pos.z - (k / m) * vel.z
	}
}

/**
 * 4th-order Runge-Kutta integration step for Cartesian coordinates
 */
export function integrateCartesian(
	pos: Vec3,
	vel: Vec3,
	config: SimulationConfig,
): { pos: Vec3; vel: Vec3 } {
	const { timestep: dt } = config

	type State = { p: Vec3; v: Vec3 }

	const derivative = (s: State): State => {
		const acc = calculateCartesianAccelerations(s.p, s.v, config)
		return {
			p: s.v,
			v: acc,
		}
	}

	const addState = (s: State, ds: State, scale: number): State => ({
		p: {
			x: s.p.x + ds.p.x * scale,
			y: s.p.y + ds.p.y * scale,
			z: s.p.z + ds.p.z * scale,
		},
		v: {
			x: s.v.x + ds.v.x * scale,
			y: s.v.y + ds.v.y * scale,
			z: s.v.z + ds.v.z * scale,
		},
	})

	const s0 = { p: pos, v: vel }
	
	const k1 = derivative(s0)
	const k2 = derivative(addState(s0, k1, dt / 2))
	const k3 = derivative(addState(s0, k2, dt / 2))
	const k4 = derivative(addState(s0, k3, dt))

	const newPos = {
		x: pos.x + (dt / 6) * (k1.p.x + 2 * k2.p.x + 2 * k3.p.x + k4.p.x),
		y: pos.y + (dt / 6) * (k1.p.y + 2 * k2.p.y + 2 * k3.p.y + k4.p.y),
		z: pos.z + (dt / 6) * (k1.p.z + 2 * k2.p.z + 2 * k3.p.z + k4.p.z),
	}

	const newVel = {
		x: vel.x + (dt / 6) * (k1.v.x + 2 * k2.v.x + 2 * k3.v.x + k4.v.x),
		y: vel.y + (dt / 6) * (k1.v.y + 2 * k2.v.y + 2 * k3.v.y + k4.v.y),
		z: vel.z + (dt / 6) * (k1.v.z + 2 * k2.v.z + 2 * k3.v.z + k4.v.z),
	}

	// Enforce length constraint explicitly to prevent drift
	const currentLen = Math.sqrt(newPos.x * newPos.x + newPos.y * newPos.y + newPos.z * newPos.z)
	const scale = config.ropeLength / currentLen
	
	newPos.x *= scale
	newPos.y *= scale
	newPos.z *= scale

	// Enforce velocity orthogonality constraint (v . r = 0)
	// v_corrected = v - (v . r_hat) * r_hat
	const rHat = { x: newPos.x / config.ropeLength, y: newPos.y / config.ropeLength, z: newPos.z / config.ropeLength }
	const vDotR = newVel.x * rHat.x + newVel.y * rHat.y + newVel.z * rHat.z
	newVel.x -= vDotR * rHat.x
	newVel.y -= vDotR * rHat.y
	newVel.z -= vDotR * rHat.z

	return { pos: newPos, vel: newVel }
}
