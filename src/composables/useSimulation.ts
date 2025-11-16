import { ref, computed } from 'vue'
import type { SimulationConfig, PendulumState, Point2D, BoundsConfig } from '@/types'
import { PendulumSimulator } from '@/core/PendulumSimulator'
import { calculateBounds, groundToCanvas } from '@/utils/coordinates'

export function useSimulation(initialConfig: SimulationConfig) {
	const simulator = new PendulumSimulator(initialConfig)

	const state = ref<PendulumState>(simulator.getState())
	const paintPoints = ref<Point2D[]>(simulator.getPaintPoints())
	const bounds = ref<BoundsConfig>(calculateBounds(initialConfig.ropeLength))

	/**
	 * Paint points in A4 coordinate space (595x842)
	 */
	const canvasPoints = computed<Point2D[]>(() => {
		return paintPoints.value.map(p => groundToCanvas(p.x, p.y, bounds.value))
	})

	/**
	 * Advance simulation by one timestep
	 */
	const step = () => {
		simulator.step()
		state.value = simulator.getState()
		paintPoints.value = [...simulator.getPaintPoints()]
	}

	/**
	 * Run simulation instantly for N steps
	 */
	const runInstant = (steps: number) => {
		for (let i = 0; i < steps; i++) {
			simulator.step()
		}
		state.value = simulator.getState()
		paintPoints.value = [...simulator.getPaintPoints()]
	}

	/**
	 * Reset simulation to initial conditions
	 */
	const reset = () => {
		simulator.reset()
		state.value = simulator.getState()
		paintPoints.value = [...simulator.getPaintPoints()]
	}

	/**
	 * Update configuration and recalculate bounds
	 */
	const updateConfig = (newConfig: Partial<SimulationConfig>) => {
		simulator.updateConfig(newConfig)
		if (newConfig.ropeLength !== undefined) {
			bounds.value = calculateBounds(newConfig.ropeLength)
		}
	}

	return {
		state,
		paintPoints,
		canvasPoints,
		bounds,
		step,
		runInstant,
		reset,
		updateConfig,
	}
}
