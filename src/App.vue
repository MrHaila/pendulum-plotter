<template>
	<!-- Show narrow screen message when window is too small -->
	<NarrowScreenMessage v-if="isTooNarrow" :current-width="windowWidth" :min-width="minWidth" />

	<!-- Main application layout -->
	<div v-else class="flex h-full bg-base-50 dark:bg-base-900">
		<!-- Left Sidebar -->
		<aside
			class="w-80 border-r border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] bg-base-100 dark:bg-base-800 p-3 space-y-0 flex flex-col"
		>
			<div class="flex-1 overflow-y-auto pr-1 space-y-6">
				<!-- Parameters Section (always visible) -->
				<section>
					<SidebarSectionHeader label="Reality Configuration" />
					<div class="mt-3">
						<InitialParameterControls
							:config="initialConfig"
							:disabled="status === 'running'"
							@update="handleInitialConfigUpdate"
						/>
					</div>
				</section>

				<!-- Simulation Controls Section -->
				<section>
					<SidebarSectionHeader label="Simulation Controls" />
					<div class="mt-3">
						<ControlPanel
							:mode="mode"
							:status="status"
							@reset="handleReset"
							@generate="handleGenerate"
							@start="handleStart"
							@pause="handlePause"
							@resume="handleResume"
							@mode-change="handleModeChange"
						/>
					</div>
				</section>

				<!-- Export Section -->
				<section>
					<SidebarSectionHeader label="Export" />
					<div class="mt-3">
						<ExportPanel
							:point-count="pointCount"
							:trim-start="trimStart"
							:trim-end="trimEnd"
							:disabled="status === 'running' || status === 'idle'"
							@update:trim-start="handleTrimStartUpdate"
							@update:trim-end="handleTrimEndUpdate"
							@export="handleExport"
						/>
					</div>
				</section>
			</div>
			<div class="pt-4">
				<DarkModeToggle />
			</div>
		</aside>

		<!-- Main Canvas Area -->
		<main class="flex-1 flex items-center justify-center p-8 bg-base-50 dark:bg-base-900 relative">
			<RawDataDisplay :points="trimmedCanvasPoints" />
			<PaintCanvas :points="trimmedCanvasPoints" />
		</main>

		<!-- Right Diagnostics -->
		<aside
			class="w-80 border-l border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] bg-base-100 dark:bg-base-800 overflow-y-auto p-3 space-y-0"
		>
			<!-- Runtime Stats Section -->
			<div class="pb-3">
				<h3 class="text-xs font-display font-light tracking-wider uppercase mb-3 text-base-500 dark:text-base-400">
					Spatio-Temporal Analysis
				</h3>
				<div class="space-y-3">
					<!-- Time -->
					<div>
						<label
							class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400 mb-1"
							>Elapsed Time</label
						>
						<div class="text-base font-mono font-light text-base-800 dark:text-base-100">
							{{ state.time.toFixed(2) }}s
						</div>
					</div>

					<!-- Point Count -->
					<div>
						<label
							class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400 mb-1"
							>Points Generated</label
						>
						<div class="text-sm font-mono font-light text-base-800 dark:text-base-100">
							{{ state.time === 0 ? '0' : pointCount.toLocaleString() }}
						</div>
					</div>

					<!-- Current State -->
					<div class="pt-2 border-t border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)]">
						<label
							class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400 mb-2"
							>Current State</label
						>
						<div class="space-y-2">
							<!-- Theta -->
							<div>
								<div class="text-xs font-mono font-light text-base-500 dark:text-base-400 mb-1">
									θ: {{ state.theta.toFixed(3) }} rad
								</div>
								<div class="h-1.5 bg-base-200 dark:bg-base-700 rounded-full overflow-hidden">
									<div
										class="h-full bg-accent-primary-500 transition-all duration-100"
										:style="{ width: `${((state.theta + Math.PI) / (2 * Math.PI)) * 100}%` }"
									/>
								</div>
							</div>

							<!-- Phi -->
							<div>
								<div class="text-xs font-mono font-light text-base-500 dark:text-base-400 mb-1">
									φ: {{ state.phi.toFixed(3) }} rad
								</div>
								<div class="h-1.5 bg-base-200 dark:bg-base-700 rounded-full overflow-hidden">
									<div
										class="h-full bg-accent-primary-500 transition-all duration-100"
										:style="{ width: `${(state.phi / Math.PI) * 100}%` }"
									/>
								</div>
							</div>

							<!-- Theta Dot -->
							<div>
								<div class="text-xs font-mono font-light text-base-500 dark:text-base-400 mb-1">
									θ̇: {{ state.thetaDot.toFixed(3) }} rad/s
								</div>
								<div class="h-1.5 bg-base-200 dark:bg-base-700 rounded-full overflow-hidden">
									<div
										class="h-full bg-accent-secondary-500 dark:bg-accent-secondary-300 transition-all duration-100"
										:style="{ width: `${Math.min((Math.abs(state.thetaDot) / 10) * 100, 100)}%` }"
									/>
								</div>
							</div>

							<!-- Phi Dot -->
							<div>
								<div class="text-xs font-mono font-light text-base-500 dark:text-base-400 mb-1">
									φ̇: {{ state.phiDot.toFixed(3) }} rad/s
								</div>
								<div class="h-1.5 bg-base-200 dark:bg-base-700 rounded-full overflow-hidden">
									<div
										class="h-full bg-accent-secondary-500 dark:bg-accent-secondary-300 transition-all duration-100"
										:style="{ width: `${Math.min((Math.abs(state.phiDot) / 10) * 100, 100)}%` }"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="border-t border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)]" />

			<!-- Top-Down View Section -->
			<div class="py-3">
				<TopDownView
					:position="currentGroundPosition"
					:position3-d="current3DPosition"
					:rope-length="currentRopeLength"
				/>
			</div>

			<div class="border-t border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)]" />

			<!-- Side View Section -->
			<div class="py-3">
				<SideView :position3-d="current3DPosition" :rope-length="currentRopeLength" />
			</div>
		</aside>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSimulation } from '@/composables/useSimulation'
import { useBreakpoint } from '@/composables/useBreakpoint'
import type { SimulationMode } from '@/composables/useSimulation'
import { sphericalToCartesian } from '@/core/physics'
import { downloadSVG } from '@/utils/svg'
import ControlPanel from '@/components/controls/ControlPanel.vue'
import InitialParameterControls from '@/components/controls/InitialParameterControls.vue'
import ExportPanel from '@/components/controls/ExportPanel.vue'
import DarkModeToggle from '@/components/controls/DarkModeToggle.vue'
import SidebarSectionHeader from '@/components/controls/SidebarSectionHeader.vue'
import PaintCanvas from '@/components/canvas/PaintCanvas.vue'
import TopDownView from '@/components/debug/TopDownView.vue'
import SideView from '@/components/debug/SideView.vue'
import RawDataDisplay from '@/components/debug/RawDataDisplay.vue'
import NarrowScreenMessage from '@/components/NarrowScreenMessage.vue'
import type { SimulationConfig, Point2D, Vec3 } from '@/types'

// Responsive breakpoint detection
const { windowWidth, isTooNarrow, minWidth } = useBreakpoint()

// Default configuration
const defaultConfig: SimulationConfig = {
	ropeLength: 1.0,
	gravity: 9.81,
	damping: 0.05,
	timestep: 0.01,
	initialTheta: 0.5,
	initialPhi: Math.PI / 4,
	initialThetaDot: 0.3,
	initialPhiDot: 0,
}

const {
	canvasPoints,
	paintPoints,
	state,
	mode,
	status,
	initialConfig,
	reset,
	runInstant,
	startRealtime,
	pause,
	resume,
	updateInitialConfig,
	setMode,
} = useSimulation(defaultConfig)

// Point count for stats
const pointCount = computed(() => paintPoints.value.length)

// Trim controls for export
const trimStart = ref(0)
const trimEnd = ref(0)

// Reset trim to full range when pointCount changes (new simulation)
watch(pointCount, newCount => {
	trimStart.value = 0
	trimEnd.value = newCount
})

// Trimmed canvas points for display and export
const trimmedCanvasPoints = computed(() => {
	return canvasPoints.value.slice(trimStart.value, trimEnd.value)
})

// Current rope length (from initial config)
const currentRopeLength = computed(() => initialConfig.value.ropeLength)

// Current 3D position for diagnostics
const current3DPosition = computed<Vec3>(() => {
	return sphericalToCartesian(state.value.theta, state.value.phi, currentRopeLength.value)
})

// Current ground position (XZ) for top-down view
const currentGroundPosition = computed<Point2D>(() => {
	const pos = current3DPosition.value
	return { x: pos.x, y: pos.z }
})

const handleReset = () => {
	reset()
}

const handleGenerate = (steps: number) => {
	reset()
	runInstant(steps)
}

const handleStart = () => {
	startRealtime()
}

const handlePause = () => {
	pause()
}

const handleResume = () => {
	resume()
}

const handleModeChange = (newMode: SimulationMode) => {
	// If switching from realtime to instant while running, reset the simulation
	if (mode.value === 'realtime' && newMode === 'instant' && status.value === 'running') {
		reset()
	}
	setMode(newMode)
}

const handleInitialConfigUpdate = (newConfig: Partial<SimulationConfig>) => {
	updateInitialConfig(newConfig)
}

const handleTrimStartUpdate = (value: number) => {
	trimStart.value = value
}

const handleTrimEndUpdate = (value: number) => {
	trimEnd.value = value
}

const handleExport = () => {
	downloadSVG(trimmedCanvasPoints.value)
}
</script>
