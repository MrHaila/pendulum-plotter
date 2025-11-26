import { ref, computed } from 'vue'
import type { SimulationConfig, PendulumState, PaintPoint, CanvasPaintPoint, BoundsConfig, Vec3 } from '@/types'
import { PendulumSimulator } from '@/core/PendulumSimulator'
import { calculateBounds, groundToCanvas } from '@/utils/coordinates'

export type SimulationMode = 'instant' | 'realtime'
export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface StartOptions {
	startStep?: number
	endStep?: number
}

export function useSimulation(initialConfig: SimulationConfig) {
	const simulator = new PendulumSimulator(initialConfig)

	const state = ref<PendulumState>(simulator.getState())
	const velocity = ref<Vec3>(simulator.getVelocity())
	const canvasOffset = ref<number>(simulator.getCanvasDisplacement())
	const paintPoints = ref<PaintPoint[]>(simulator.getPaintPoints())
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
	 * Paint points in canvas coordinate space with speed preserved
	 */
	const canvasPoints = computed<CanvasPaintPoint[]>(() => {
		return paintPoints.value.map(p => ({
			...groundToCanvas(p.x, p.y, bounds.value),
			speed: p.speed,
		}))
	})

	/**
	 * Advance simulation by one timestep
	 */
	const step = () => {
		simulator.step()
		state.value = simulator.getState()
		velocity.value = simulator.getVelocity()
		canvasOffset.value = simulator.getCanvasDisplacement()
		paintPoints.value = [...simulator.getPaintPoints()]
	}

	/**
	 * Run simulation instantly for N steps
	 * Supports optional startStep/endStep for consistency with realtime mode
	 */
	const runInstant = (steps: number, options?: StartOptions) => {
		const startStep = options?.startStep ?? 0
		const endStep = options?.endStep ?? steps

		status.value = 'running'

		// Pre-run silently up to startStep
		if (startStep > 0) {
			for (let i = 0; i < startStep; i++) {
				simulator.step()
			}
		}

		// Run visible steps from startStep to endStep
		const visibleSteps = Math.min(endStep, steps) - startStep
		for (let i = 0; i < visibleSteps; i++) {
			simulator.step()
		}

		state.value = simulator.getState()
		velocity.value = simulator.getVelocity()
		canvasOffset.value = simulator.getCanvasDisplacement()
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
	 * Supports optional startStep/endStep for trimmed playback
	 */
	const start = (options?: StartOptions) => {
		if (status.value === 'running') return

		const startStep = options?.startStep ?? 0
		const endStep = options?.endStep

		// If starting from completed or idle state, apply config and reset first
		if (status.value === 'completed' || status.value === 'idle') {
			simulator.updateConfig(initialConfig_ref.value)
			simulator.reset()

			// Pre-run up to startStep silently
			if (startStep > 0) {
				for (let i = 0; i < startStep; i++) {
					simulator.step()
				}
			}

			state.value = simulator.getState()
			velocity.value = simulator.getVelocity()
			canvasOffset.value = simulator.getCanvasDisplacement()
			paintPoints.value = [...simulator.getPaintPoints()]
		}

		// Set target stop index if endStep provided
		targetStopIndex = endStep ?? null

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
		status.value = 'running'
		lastFrameTime = performance.now()
		animationFrameId = requestAnimationFrame(animationLoop)
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
		canvasOffset.value = simulator.getCanvasDisplacement()
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
		canvasOffset.value = simulator.getCanvasDisplacement()
	}

	/**
	 * Set simulation mode
	 */
	const setMode = (newMode: SimulationMode) => {
		mode.value = newMode
	}

	/**
	 * Set target stop index for auto-stopping simulation
	 */
	const setTargetStopIndex = (index: number | null) => {
		targetStopIndex = index
	}

	return {
		state,
		velocity,
		canvasOffset,
		paintPoints,
		canvasPoints,
		bounds,
		mode,
		status,
		initialConfig: initialConfig_ref,
		step,
		runInstant,
		start,
		pause,
		resume,
		stop,
		completeInstant,
		reset,
		updateInitialConfig,
		updateRuntimeConfig,
		setMode,
		setTargetStopIndex,
	}
}
