import type { PendulumState, SimulationConfig, Point2D, Vec3 } from '@/types'
import {
	integrateCartesian,
	sphericalToCartesian,
	sphericalToCartesianVelocity,
	cartesianToSpherical,
	cartesianToSphericalVelocity,
} from './physics'

export class PendulumSimulator {
	private pos: Vec3
	private vel: Vec3
	private config: SimulationConfig
	private paintPoints: Point2D[] = []
	private time: number = 0

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

		// Start with empty paint points array
		// First step() call will add the first point
	}

	/**
	 * Advance simulation by one timestep
	 */
	step(): void {
		const result = integrateCartesian(this.pos, this.vel, this.config)
		this.pos = result.pos
		this.vel = result.vel
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
	 * Get 2D paint points (X, Z coordinates projected to ground)
	 */
	getPaintPoints(): Point2D[] {
		return this.paintPoints
	}

	/**
	 * Add current bucket position as paint point
	 * Projects 3D position to 2D ground plane (XZ)
	 */
	private addPaintPoint(): void {
		// Paint drips to ground (Y = ropeLength), use X and Z for 2D position
		// In our Cartesian system, y is vertical (down), x and z are horizontal
		this.paintPoints.push({
			x: this.pos.x,
			y: this.pos.z, // Using Z as Y for 2D canvas (top-down view)
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
}
