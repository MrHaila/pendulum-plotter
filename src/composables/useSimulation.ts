import { ref, computed } from 'vue'
import type { SimulationConfig, PendulumState, Point2D, BoundsConfig, Vec3 } from '@/types'
import { PendulumSimulator } from '@/core/PendulumSimulator'
import { calculateBounds, groundToCanvas } from '@/utils/coordinates'

export type SimulationMode = 'instant' | 'realtime'
export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed'

export function useSimulation(initialConfig: SimulationConfig) {
	const simulator = new PendulumSimulator(initialConfig)

	const state = ref<PendulumState>(simulator.getState())
	const velocity = ref<Vec3>(simulator.getVelocity())
	const paintPoints = ref<Point2D[]>(simulator.getPaintPoints())
	const bounds = ref<BoundsConfig>(
		calculateBounds(initialConfig.ropeLength, initialConfig.zoom, initialConfig.canvasShape),
	)

	const mode = ref<SimulationMode>('realtime')
	const status = ref<SimulationStatus>('idle')
	const initialConfig_ref = ref<SimulationConfig>({ ...initialConfig })

	let animationFrameId: number | null = null
	let lastFrameTime = 0
	const targetFps = 60
	const frameInterval = 1000 / targetFps
	let targetStopIndex: number | null = null // For auto-stopping at trim end

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
		velocity.value = simulator.getVelocity()
		paintPoints.value = [...simulator.getPaintPoints()]
	}

	/**
	 * Run simulation instantly for N steps
	 */
	const runInstant = (steps: number) => {
		status.value = 'running'
		for (let i = 0; i < steps; i++) {
			simulator.step()
		}
		state.value = simulator.getState()
		velocity.value = simulator.getVelocity()
		paintPoints.value = [...simulator.getPaintPoints()]
		status.value = 'completed'
	}

	/**
	 * Animation loop for real-time mode
	 */
	const animationLoop = (timestamp: number) => {
		if (status.value !== 'running') {
			return
		}

		// Check if we've reached the target stop index
		if (targetStopIndex !== null && paintPoints.value.length >= targetStopIndex) {
			stop()
			return
		}

		const elapsed = timestamp - lastFrameTime
		if (elapsed >= frameInterval) {
			lastFrameTime = timestamp - (elapsed % frameInterval)
			step()
		}

		animationFrameId = requestAnimationFrame(animationLoop)
	}

	/**
	 * Start real-time simulation
	 */
	const startRealtime = () => {
		if (status.value === 'running') return

		// If starting from completed or idle state, apply config and reset first
		if (status.value === 'completed' || status.value === 'idle') {
			simulator.updateConfig(initialConfig_ref.value)
			simulator.reset()
			state.value = simulator.getState()
			velocity.value = simulator.getVelocity()
			paintPoints.value = [...simulator.getPaintPoints()]
		}

		status.value = 'running'
		lastFrameTime = performance.now()
		animationFrameId = requestAnimationFrame(animationLoop)
	}

	/**
	 * Pause real-time simulation
	 */
	const pause = () => {
		if (status.value !== 'running') return

		status.value = 'paused'
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId)
			animationFrameId = null
		}
	}

	/**
	 * Resume paused simulation
	 */
	const resume = () => {
		if (status.value !== 'paused') return
		startRealtime()
	}

	/**
	 * Stop real-time simulation and mark as completed
	 */
	const stop = () => {
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId)
			animationFrameId = null
		}
		targetStopIndex = null
		status.value = 'completed'
	}

	/**
	 * Complete instant simulation when switching from realtime
	 */
	const completeInstant = (remainingSteps: number) => {
		reset()
		runInstant(remainingSteps)
	}

	/**
	 * Reset simulation to initial conditions
	 */
	const reset = () => {
		stop()
		targetStopIndex = null
		simulator.updateConfig(initialConfig_ref.value)
		simulator.reset()
		state.value = simulator.getState()
		velocity.value = simulator.getVelocity()
		paintPoints.value = [...simulator.getPaintPoints()]
		status.value = 'idle'
	}

	/**
	 * Update initial configuration (used before starting simulation)
	 */
	const updateInitialConfig = (newConfig: Partial<SimulationConfig>) => {
		initialConfig_ref.value = { ...initialConfig_ref.value, ...newConfig }
		if (newConfig.ropeLength !== undefined || newConfig.zoom !== undefined || newConfig.canvasShape !== undefined) {
			bounds.value = calculateBounds(
				initialConfig_ref.value.ropeLength,
				initialConfig_ref.value.zoom,
				initialConfig_ref.value.canvasShape,
			)
		}
	}

	/**
	 * Update runtime configuration (used during paused state)
	 */
	const updateRuntimeConfig = (newConfig: Partial<SimulationConfig>) => {
		simulator.updateConfig(newConfig)
		if (newConfig.ropeLength !== undefined || newConfig.zoom !== undefined || newConfig.canvasShape !== undefined) {
			bounds.value = calculateBounds(
				initialConfig_ref.value.ropeLength,
				initialConfig_ref.value.zoom,
				initialConfig_ref.value.canvasShape,
			)
		}
		// Force state update to reflect new config
		state.value = simulator.getState()
		velocity.value = simulator.getVelocity()
	}

	/**
	 * Set simulation mode
	 */
	const setMode = (newMode: SimulationMode) => {
		mode.value = newMode
	}

	/**
	 * Start real-time simulation with trim bounds (for auto-play from shared links)
	 * Pre-runs simulation up to trimStart, then animates from trimStart to trimEnd
	 */
	const startRealtimeWithTrim = (trimStart: number, trimEnd: number) => {
		if (status.value === 'running') return

		// Reset and apply config
		simulator.updateConfig(initialConfig_ref.value)
		simulator.reset()

		// Pre-run up to trimStart silently
		if (trimStart > 0) {
			for (let i = 0; i < trimStart; i++) {
				simulator.step()
			}
		}

		// Update state after pre-run
		state.value = simulator.getState()
		velocity.value = simulator.getVelocity()
		paintPoints.value = [...simulator.getPaintPoints()]

		// Set target stop index
		targetStopIndex = trimEnd

		// Start animation from this point
		status.value = 'running'
		lastFrameTime = performance.now()
		animationFrameId = requestAnimationFrame(animationLoop)
	}

	return {
		state,
		velocity,
		paintPoints,
		canvasPoints,
		bounds,
		mode,
		status,
		initialConfig: initialConfig_ref,
		step,
		runInstant,
		startRealtime,
		startRealtimeWithTrim,
		pause,
		resume,
		stop,
		completeInstant,
		reset,
		updateInitialConfig,
		updateRuntimeConfig,
		setMode,
	}
}
