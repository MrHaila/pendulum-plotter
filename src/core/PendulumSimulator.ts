import type { PendulumState, SimulationConfig, Point2D } from '@/types'
import { integrateRK4, sphericalToCartesian } from './physics'

export class PendulumSimulator {
	private state: PendulumState
	private config: SimulationConfig
	private paintPoints: Point2D[] = []

	constructor(config: SimulationConfig) {
		this.config = config
		this.state = {
			theta: config.initialTheta,
			phi: config.initialPhi,
			thetaDot: config.initialThetaDot,
			phiDot: config.initialPhiDot,
			time: 0,
		}
		// Add initial paint point
		this.addPaintPoint()
	}

	/**
	 * Advance simulation by one timestep
	 */
	step(): void {
		this.state = integrateRK4(this.state, this.config)
		this.addPaintPoint()
	}

	/**
	 * Reset simulation to initial conditions
	 */
	reset(): void {
		this.state = {
			theta: this.config.initialTheta,
			phi: this.config.initialPhi,
			thetaDot: this.config.initialThetaDot,
			phiDot: this.config.initialPhiDot,
			time: 0,
		}
		this.paintPoints = []
		this.addPaintPoint()
	}

	/**
	 * Get current simulation state
	 */
	getState(): PendulumState {
		return { ...this.state }
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
		const pos = sphericalToCartesian(this.state.theta, this.state.phi, this.config.ropeLength)
		// Paint drips to ground (Y = ropeLength), use X and Z for 2D position
		this.paintPoints.push({
			x: pos.x,
			y: pos.z, // Using Z as Y for 2D canvas (top-down view)
		})
	}

	/**
	 * Update simulation configuration
	 */
	updateConfig(newConfig: Partial<SimulationConfig>): void {
		this.config = { ...this.config, ...newConfig }
	}
}
