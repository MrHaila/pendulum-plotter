import type { PendulumState, SimulationConfig, Vec3 } from '@/types'

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
 * Calculate angular accelerations for spherical pendulum
 * Based on Lagrangian mechanics equations of motion
 */
export function calculateAccelerations(
	state: PendulumState,
	config: SimulationConfig,
): { thetaDotDot: number; phiDotDot: number } {
	const { phi, thetaDot, phiDot } = state
	const { ropeLength: L, gravity: g, damping: k } = config

	const sinPhi = Math.sin(phi)
	const cosPhi = Math.cos(phi)

	// Avoid division by zero when phi = 0
	const sinPhiSafe = Math.max(sinPhi, 1e-6)

	// phi equation: phi'' = (theta')^2 * sin(phi) * cos(phi) - (g/L) * sin(phi) - k * phi'
	const phiDotDot = thetaDot ** 2 * sinPhi * cosPhi - (g / L) * sinPhi - k * phiDot

	// theta equation: theta'' = -2 * phi' * theta' * cos(phi) / sin(phi) - k * theta'
	const thetaDotDot = (-2 * phiDot * thetaDot * cosPhi) / sinPhiSafe - k * thetaDot

	return { thetaDotDot, phiDotDot }
}

/**
 * 4th-order Runge-Kutta integration step
 * Updates state by one timestep
 */
export function integrateRK4(state: PendulumState, config: SimulationConfig): PendulumState {
	const { timestep: dt } = config

	// State derivative function
	const derivative = (s: PendulumState) => {
		const { thetaDotDot, phiDotDot } = calculateAccelerations(s, config)
		return {
			theta: s.thetaDot,
			phi: s.phiDot,
			thetaDot: thetaDotDot,
			phiDot: phiDotDot,
			time: 1,
		}
	}

	// Add two state derivatives
	const addState = (s: PendulumState, ds: PendulumState, scale: number): PendulumState => ({
		theta: s.theta + ds.theta * scale,
		phi: s.phi + ds.phi * scale,
		thetaDot: s.thetaDot + ds.thetaDot * scale,
		phiDot: s.phiDot + ds.phiDot * scale,
		time: s.time + ds.time * scale,
	})

	// RK4 stages
	const k1 = derivative(state)
	const k2 = derivative(addState(state, k1, dt / 2))
	const k3 = derivative(addState(state, k2, dt / 2))
	const k4 = derivative(addState(state, k3, dt))

	// Weighted average
	return {
		theta: state.theta + (dt / 6) * (k1.theta + 2 * k2.theta + 2 * k3.theta + k4.theta),
		phi: state.phi + (dt / 6) * (k1.phi + 2 * k2.phi + 2 * k3.phi + k4.phi),
		thetaDot: state.thetaDot + (dt / 6) * (k1.thetaDot + 2 * k2.thetaDot + 2 * k3.thetaDot + k4.thetaDot),
		phiDot: state.phiDot + (dt / 6) * (k1.phiDot + 2 * k2.phiDot + 2 * k3.phiDot + k4.phiDot),
		time: state.time + dt,
	}
}
