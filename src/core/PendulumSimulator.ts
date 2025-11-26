import type { PendulumState, SimulationConfig, PaintPoint, Vec3, CanvasOscillatorState } from '@/types'
import {
	integrateCartesian,
	sphericalToCartesian,
	sphericalToCartesianVelocity,
	cartesianToSpherical,
	cartesianToSphericalVelocity,
} from './physics'
import { createCanvasOscillatorState, integrateCanvasOscillator } from './canvasOscillator'

export class PendulumSimulator {
	private pos: Vec3
	private vel: Vec3
	private config: SimulationConfig
	private paintPoints: PaintPoint[] = []
	private time: number = 0
	private canvasState: CanvasOscillatorState

	constructor(config: SimulationConfig) {
		this.config = config
		this.time = 0

		// Initialize state from spherical config
		this.pos = sphericalToCartesian(config.initialTheta, config.initialPhi, config.ropeLength)
		this.vel = sphericalToCartesianVelocity(
			config.initialTheta,
			config.initialPhi,
			config.initialThetaDot,
			config.initialPhiDot,
			config.ropeLength,
		)

		// Initialize canvas oscillator
		this.canvasState = createCanvasOscillatorState(config.canvasSwingStart)

		// Start with empty paint points array
		// First step() call will add the first point
	}

	/**
	 * Advance simulation by one timestep
	 */
	step(): void {
		// Step pendulum
		const result = integrateCartesian(this.pos, this.vel, this.config)
		this.pos = result.pos
		this.vel = result.vel

		// Step canvas oscillator
		this.canvasState = integrateCanvasOscillator(this.canvasState, {
			damping: this.config.damping,
			timestep: this.config.timestep,
			gravity: this.config.gravity,
			ropeLength: this.config.ropeLength,
		})

		this.time += this.config.timestep
		this.addPaintPoint()
	}

	/**
	 * Reset simulation to initial conditions
	 */
	reset(): void {
		this.time = 0
		this.pos = sphericalToCartesian(this.config.initialTheta, this.config.initialPhi, this.config.ropeLength)
		this.vel = sphericalToCartesianVelocity(
			this.config.initialTheta,
			this.config.initialPhi,
			this.config.initialThetaDot,
			this.config.initialPhiDot,
			this.config.ropeLength,
		)
		this.canvasState = createCanvasOscillatorState(this.config.canvasSwingStart)
		this.paintPoints = []
	}

	/**
	 * Get current simulation state
	 * Converts internal Cartesian state back to spherical for UI
	 */
	getState(): PendulumState {
		const { theta, phi } = cartesianToSpherical(this.pos)
		const { thetaDot, phiDot } = cartesianToSphericalVelocity(this.pos, this.vel)

		return {
			theta,
			phi,
			thetaDot,
			phiDot,
			time: this.time,
		}
	}

	/**
	 * Get 2D paint points (X, Z coordinates projected to ground) with speed
	 */
	getPaintPoints(): PaintPoint[] {
		return this.paintPoints
	}

	/**
	 * Add current bucket position as paint point
	 * Projects 3D position to 2D ground plane (XZ)
	 * Canvas oscillation affects the Y coordinate on the 2D canvas
	 */
	private addPaintPoint(): void {
		// Compute velocity magnitude for stroke styling
		const speed = Math.sqrt(this.vel.x ** 2 + this.vel.y ** 2 + this.vel.z ** 2)

		// Paint drips to ground (Y = ropeLength), use X and Z for 2D position
		// In our Cartesian system, y is vertical (down), x and z are horizontal
		// Canvas swing angle is converted to physical displacement:
		// displacement = sin(angle) * ropeLength * SWING_SCALE
		// SWING_SCALE of 0.15 gives a gentle effect (~15% of rope length at max angle)
		const SWING_SCALE = 0.15
		const canvasDisplacement = Math.sin(this.canvasState.angle) * this.config.ropeLength * SWING_SCALE
		this.paintPoints.push({
			x: this.pos.x,
			y: this.pos.z + canvasDisplacement,
			speed,
		})
	}

	/**
	 * Get current Cartesian velocity
	 */
	getVelocity(): Vec3 {
		return { ...this.vel }
	}

	/**
	 * Update simulation configuration
	 */
	updateConfig(newConfig: Partial<SimulationConfig>): void {
		this.config = { ...this.config, ...newConfig }
	}

	/**
	 * Get current canvas oscillator angle (for visual feedback)
	 */
	getCanvasAngle(): number {
		return this.canvasState.angle
	}

	/**
	 * Get current canvas displacement in meters (for visual feedback)
	 */
	getCanvasDisplacement(): number {
		const SWING_SCALE = 0.15
		return Math.sin(this.canvasState.angle) * this.config.ropeLength * SWING_SCALE
	}
}
