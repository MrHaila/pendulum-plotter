import type { CanvasOscillatorState } from '@/types'

/**
 * 1D damped harmonic oscillator for canvas swing motion.
 *
 * Physics: θ'' = -(g/L)*θ - damping*θ'
 * - g/L: effective spring constant (matches pendulum physics)
 * - damping: same coefficient as main pendulum
 *
 * This matches the small-angle pendulum equation, so the canvas
 * swings at the same rate as a pendulum of the same rope length.
 */

export interface CanvasOscillatorConfig {
	damping: number
	timestep: number
	gravity: number
	ropeLength: number
}

/**
 * Create initial canvas oscillator state
 */
export function createCanvasOscillatorState(startAngle: number): CanvasOscillatorState {
	return {
		angle: startAngle,
		angularVelocity: 0,
	}
}

/**
 * Integrate canvas oscillator by one timestep using RK4
 *
 * Equation of motion: θ'' = -k*θ - damping*θ'
 */
export function integrateCanvasOscillator(
	state: CanvasOscillatorState,
	config: CanvasOscillatorConfig,
): CanvasOscillatorState {
	const { damping, timestep, gravity, ropeLength } = config
	// Use g/L as spring constant - matches pendulum small-angle approximation
	const k = gravity / ropeLength

	// Angular acceleration: α = -k*θ - damping*ω
	const angularAccel = (theta: number, omega: number): number => {
		return -k * theta - damping * omega
	}

	// RK4 integration
	const theta0 = state.angle
	const omega0 = state.angularVelocity
	const dt = timestep

	// k1
	const alpha1 = angularAccel(theta0, omega0)
	const k1theta = omega0
	const k1omega = alpha1

	// k2
	const theta1 = theta0 + 0.5 * dt * k1theta
	const omega1 = omega0 + 0.5 * dt * k1omega
	const alpha2 = angularAccel(theta1, omega1)
	const k2theta = omega1
	const k2omega = alpha2

	// k3
	const theta2 = theta0 + 0.5 * dt * k2theta
	const omega2 = omega0 + 0.5 * dt * k2omega
	const alpha3 = angularAccel(theta2, omega2)
	const k3theta = omega2
	const k3omega = alpha3

	// k4
	const theta3 = theta0 + dt * k3theta
	const omega3 = omega0 + dt * k3omega
	const alpha4 = angularAccel(theta3, omega3)
	const k4theta = omega3
	const k4omega = alpha4

	// Combine
	const newAngle = theta0 + (dt / 6) * (k1theta + 2 * k2theta + 2 * k3theta + k4theta)
	const newAngularVelocity = omega0 + (dt / 6) * (k1omega + 2 * k2omega + 2 * k3omega + k4omega)

	return {
		angle: newAngle,
		angularVelocity: newAngularVelocity,
	}
}
