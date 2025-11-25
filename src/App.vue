<template>
	<!-- Show narrow screen message when window is too small -->
	<NarrowScreenMessage v-if="isTooNarrow" :current-width="windowWidth" :min-width="minWidth" />

	<!-- Main application layout -->
	<div v-else class="flex h-full bg-base-50 dark:bg-base-900">
		<!-- Left Sidebar -->
		<aside
			class="w-80 flex-none border-r border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] bg-base-100 dark:bg-base-800 p-3 space-y-0 flex flex-col"
		>
			<div class="flex-1 overflow-y-auto pr-1 space-y-6">
				<!-- Parameters Section -->
				<section class="space-y-3">
					<SidebarSectionHeader label="Experiment Parameters" />
					<InitialParameterControls
						:config="initialConfig"
						:disabled="status === 'running'"
						@update="handleInitialConfigUpdate"
					/>
				</section>

				<!-- Simulation Controls Section -->
				<section class="space-y-3">
					<SidebarSectionHeader label="Time Simulation" />
					<ControlPanel
						:mode="mode"
						:status="status"
						:has-content="pointCount > 0"
						:app-mode="appMode"
						@reset="handleReset"
						@generate="handleGenerate"
						@start="handleStart"
						@pause="handlePause"
						@resume="handleResume"
						@mode-change="handleModeChange"
					/>
				</section>

				<!-- Path Trimming Section -->
				<section class="space-y-3">
					<SidebarSectionHeader label="Data Cleanup" />
					<TrimControls
						:point-count="pointCount"
						:trim-start="trimStart"
						:trim-end="trimEnd"
						:disabled="status === 'running' || status === 'idle'"
						@auto-trim="handleAutoTrim"
						@update:trim-start="handleTrimStartUpdate"
						@update:trim-end="handleTrimEndUpdate"
					/>
				</section>

				<!-- Export Section -->
				<section class="space-y-3">
					<SidebarSectionHeader label="Share Findings" />
					<ExportPanel
						:disabled="status === 'running' || status === 'idle'"
						@share="handleShare"
						@export-svg="handleExportSVG"
						@export-png="handleExportPNG"
					/>
				</section>
			</div>
			<div class="pt-4">
				<DarkModeToggle />
			</div>
		</aside>

		<!-- Main Canvas Area -->
		<main class="flex-1 flex items-center justify-center p-8 bg-base-50 dark:bg-base-900 relative overflow-hidden">
			<RawDataDisplay :points="trimmedCanvasPoints" />
			<PaintCanvas :points="trimmedCanvasPoints" :bounds="bounds" :show-placeholder="showCanvasPlaceholder" />
		</main>

		<!-- Right Diagnostics -->
		<aside
			class="w-80 flex-none border-l border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] bg-base-100 dark:bg-base-800 overflow-y-auto p-3 space-y-6"
		>
			<!-- Runtime Stats Section -->
			<section class="space-y-3">
				<SidebarSectionHeader label="Spatio-Temporal Observations" />
				<RuntimeStats :state="state" :point-count="pointCount" />
			</section>

			<!-- Top-Down View Section -->
			<section class="space-y-3">
				<SidebarSectionHeader label="XZ Planar Projection" />
				<TopDownView
					:position="currentGroundPosition"
					:position3-d="current3DPosition"
					:velocity="velocity"
					:rope-length="currentRopeLength"
				/>
			</section>

			<!-- Side View Section -->
			<section class="space-y-3">
				<SidebarSectionHeader label="XY Planar Projection" />
				<SideView :position3-d="current3DPosition" :velocity="velocity" :rope-length="currentRopeLength" />
			</section>
		</aside>
	</div>

	<!-- Share Modal -->
	<ShareModal
		:show="showShareModal"
		:config="initialConfig"
		:mode="mode"
		:steps="instantSteps"
		:trim-start="trimStart"
		:trim-end="trimEnd"
		:trim-overrides="trimOverrides"
		:trimmed-points="trimmedCanvasPoints"
		:bounds="bounds"
		@close="handleCloseShareModal"
	/>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useSimulation } from '@/composables/useSimulation'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useAppMode } from '@/composables/useAppMode'
import { useAppInitialization } from '@/composables/useAppInitialization'
import type { SimulationMode } from '@/composables/useSimulation'
import { sphericalToCartesian } from '@/core/physics'
import { autoTrimLine, type TrimOverrides } from '@/core/trimming'
import { downloadSVG } from '@/utils/svg'
import { downloadPNG } from '@/utils/png'
import ControlPanel from '@/components/controls/ControlPanel.vue'
import InitialParameterControls from '@/components/controls/InitialParameterControls.vue'
import TrimControls from '@/components/controls/TrimControls.vue'
import ExportPanel from '@/components/controls/ExportPanel.vue'
import ShareModal from '@/components/controls/ShareModal.vue'
import DarkModeToggle from '@/components/controls/DarkModeToggle.vue'
import SidebarSectionHeader from '@/components/controls/SidebarSectionHeader.vue'
import PaintCanvas from '@/components/canvas/PaintCanvas.vue'
import TopDownView from '@/components/debug/TopDownView.vue'
import SideView from '@/components/debug/SideView.vue'
import RawDataDisplay from '@/components/debug/RawDataDisplay.vue'
import RuntimeStats from '@/components/debug/RuntimeStats.vue'
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
	zoom: 2.0,
	canvasShape: 'a4-portrait',
	initialTheta: 0.5,
	initialPhi: Math.PI / 4,
	initialThetaDot: 0.3,
	initialPhiDot: 0,
}

// Initialize app state from query params or defaults
const initialState = useAppInitialization(defaultConfig)

// App mode management (manual vs auto-run)
const { mode: appMode, isManualMode, setManualMode, setAutoRunMode } = useAppMode()

// Set auto-run mode if loading from shared link (preserves URL-provided trim settings)
// This applies regardless of autoPlay - autoPlay only controls automatic start, not trim preservation
if (initialState.isFromSharedLink) {
	setAutoRunMode()
}

const {
	canvasPoints,
	paintPoints,
	state,
	velocity,
	mode,
	status,
	bounds,
	initialConfig,
	reset,
	runInstant,
	start,
	pause,
	resume,
	updateInitialConfig,
	setMode,
	setTargetStopIndex,
} = useSimulation(initialState.config)

// Point count for stats
const pointCount = computed(() => paintPoints.value.length)

// Share modal state
const showShareModal = ref(false)
const instantSteps = ref(initialState.steps)

const hasPlaceholderBeenDismissed = ref(false)

const showCanvasPlaceholder = computed(
	() => !hasPlaceholderBeenDismissed.value && status.value === 'idle' && pointCount.value === 0,
)

// Trim controls for export
const trimStart = ref(initialState.trimStart)
const trimEnd = ref(initialState.trimEnd)
const trimOverrides = ref<TrimOverrides | null>(initialState.trimOverrides)

// Reset trim to full range when pointCount changes (new simulation)
// Only in manual mode - auto-run mode preserves trim settings
watch(pointCount, newCount => {
	if (isManualMode.value) {
		trimStart.value = 0
		trimEnd.value = newCount
		trimOverrides.value = null
	}

	if (newCount >= 1) {
		hasPlaceholderBeenDismissed.value = true
	}
})

// Trimmed canvas points for display and export
const trimmedCanvasPoints = computed(() => {
	const points = canvasPoints.value
	const segment = points.slice(trimStart.value, trimEnd.value)
	if (segment.length === 0) {
		return segment
	}
	if (!trimOverrides.value) {
		return segment
	}
	const result = [...segment]
	// Apply start override immediately (first point is stable)
	if (trimOverrides.value.start) {
		result[0] = trimOverrides.value.start
	}
	// Only apply end override when we have the complete segment
	// This prevents the override from shifting indices during progressive animation
	const expectedLength = trimEnd.value - trimStart.value
	if (trimOverrides.value.end && result.length > 1 && result.length >= expectedLength) {
		result[result.length - 1] = trimOverrides.value.end
	}
	return result
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
	setManualMode()
	reset()
}

const handleGenerate = (steps: number) => {
	setManualMode()
	instantSteps.value = steps
	reset()
	runInstant(steps)
}

const handleStart = () => {
	setManualMode()
	start()
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
	reset()
}

const handleTrimStartUpdate = (value: number) => {
	trimStart.value = value
	trimOverrides.value = null
}

const handleTrimEndUpdate = (value: number) => {
	trimEnd.value = value
	trimOverrides.value = null
}

const handleAutoTrim = () => {
	if (canvasPoints.value.length < 2) {
		return
	}
	const result = autoTrimLine(canvasPoints.value)
	trimStart.value = result.startIndex
	trimEnd.value = result.endIndex
	trimOverrides.value = result.overrides
}

const handleExportSVG = () => {
	downloadSVG(trimmedCanvasPoints.value, bounds.value)
}

const handleExportPNG = () => {
	downloadPNG(trimmedCanvasPoints.value, bounds.value)
}

const handleShare = () => {
	showShareModal.value = true
}

const handleCloseShareModal = () => {
	showShareModal.value = false
}

// Initialize simulation mode from shared link
setMode(initialState.mode)

// Handle auto-play from shared link
onMounted(() => {
	if (initialState.autoPlay) {
		reset()
		if (initialState.mode === 'instant') {
			runInstant(initialState.steps, {
				startStep: initialState.trimStart,
				endStep: initialState.trimEnd,
			})
		} else if (initialState.mode === 'realtime') {
			start({
				startStep: initialState.trimStart,
				endStep: initialState.trimEnd,
			})
		}
	}
})

// Watch for mode transitions from auto-run to manual
// When transitioning to manual, clear target stop index
watch(isManualMode, newIsManual => {
	if (newIsManual) {
		setTargetStopIndex(null)
	}
})
</script>
