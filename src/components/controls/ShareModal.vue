<template>
	<Teleport to="body">
		<Transition
			enter-active-class="transition-opacity duration-200"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition-opacity duration-150"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="show"
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
				@click.self="handleClose"
			>
				<Transition
					enter-active-class="transition-all duration-200"
					enter-from-class="opacity-0 scale-95"
					enter-to-class="opacity-100 scale-100"
					leave-active-class="transition-all duration-150"
					leave-from-class="opacity-100 scale-100"
					leave-to-class="opacity-0 scale-95"
				>
					<div
						v-if="show"
						class="relative bg-base-100 dark:bg-base-800 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
						style="width: 712px"
					>
						<!-- Modal Content -->
						<div class="grid grid-cols-2 gap-6 p-6 flex-1 overflow-hidden">
							<!-- Left Column: Preview -->
							<div class="flex flex-col space-y-3 w-80">
								<SidebarSectionHeader label="Preview" />
								<div
									class="relative overflow-hidden flex items-center justify-center"
									style="width: 320px; height: 320px"
								>
									<canvas
										ref="previewCanvasRef"
										:width="canvasWidth"
										:height="canvasHeight"
										class="bg-base-50 dark:bg-base-900 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md"
										:style="{ width: previewWidth + 'px', height: previewHeight + 'px' }"
									/>
								</div>
							</div>

							<!-- Right Column: Info & Actions -->
							<div class="flex flex-col space-y-4 overflow-y-auto w-80">
								<!-- Mode Selection -->
								<div class="space-y-3">
									<SidebarSectionHeader label="Playback Mode" />
									<AppSegmentedToggle v-model="shareMode" :options="modeOptions" />
								</div>

								<!-- Parameters Summary -->
								<div class="space-y-3">
									<SidebarSectionHeader label="Parameters" />
									<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
										<div class="text-base-500 dark:text-base-400">Steps</div>
										<div class="font-mono text-base-800 dark:text-base-100 text-right">
											{{ trimStart }} - {{ trimEnd }}
										</div>

										<div class="text-base-500 dark:text-base-400">Scale</div>
										<div class="font-mono text-base-800 dark:text-base-100 text-right">
											{{ config.zoom.toFixed(2) }}x
										</div>

										<div class="text-base-500 dark:text-base-400">Damping</div>
										<div class="font-mono text-base-800 dark:text-base-100 text-right">
											{{ config.damping.toFixed(3) }}
										</div>

										<div class="text-base-500 dark:text-base-400">Rotation θ</div>
										<div class="font-mono text-base-800 dark:text-base-100 text-right">
											{{ config.initialTheta.toFixed(2) }}
										</div>

										<div class="text-base-500 dark:text-base-400">Height φ</div>
										<div class="font-mono text-base-800 dark:text-base-100 text-right">
											{{ config.initialPhi.toFixed(2) }}
										</div>

										<div class="text-base-500 dark:text-base-400">Spin θ̇</div>
										<div class="font-mono text-base-800 dark:text-base-100 text-right">
											{{ config.initialThetaDot.toFixed(2) }}
										</div>
									</div>
								</div>

								<!-- Share Link -->
								<div class="space-y-2">
									<SidebarSectionHeader label="Share Link" />
									<div class="flex gap-2">
										<input
											ref="linkInputRef"
											:value="shareUrl"
											readonly
											class="flex-1 px-3 py-2 text-xs font-mono bg-base-200 dark:bg-base-700 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md text-base-800 dark:text-base-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-primary-400 select-all"
											@click="handleSelectAll"
										/>
										<AppButton variant="primary" class="px-4 py-2" @click="handleCopy">
											{{ copyButtonText }}
										</AppButton>
									</div>
								</div>
							</div>
						</div>

						<!-- Footer with Close Button -->
						<div class="border-t border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] px-6 py-3 flex justify-end">
							<AppButton variant="neutral" class="px-4 py-2" @click="handleClose"> Close </AppButton>
						</div>
					</div>
				</Transition>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { SimulationConfig, Point2D, BoundsConfig } from '@/types'
import type { SimulationMode } from '@/composables/useSimulation'
import type { TrimOverrides } from '@/core/trimming'
import { encodeShareLink, copyToClipboard, type ShareableState } from '@/utils/shareLink'
import AppButton from '@/components/common/AppButton.vue'
import AppSegmentedToggle from '@/components/common/AppSegmentedToggle.vue'
import SidebarSectionHeader from '@/components/controls/SidebarSectionHeader.vue'

const props = defineProps<{
	show: boolean
	config: SimulationConfig
	mode: SimulationMode
	steps?: number
	trimStart: number
	trimEnd: number
	trimOverrides: TrimOverrides | null
	trimmedPoints: Point2D[]
	bounds: BoundsConfig
}>()

const emit = defineEmits<{
	close: []
}>()

const shareMode = ref<SimulationMode>(props.mode)
const copyButtonText = ref('Copy')

const modeOptions = [
	{ value: 'realtime', label: 'Real-time' },
	{ value: 'instant', label: 'Instant' },
]
const linkInputRef = ref<HTMLInputElement>()
const previewCanvasRef = ref<HTMLCanvasElement>()

// Animation state for realtime preview
let animationFrameId: number | null = null
let currentPointIndex = 0

const dpr = window.devicePixelRatio || 1
const maxPreviewSize = 320

// Calculate preview dimensions to fit within 320x320 while maintaining aspect ratio
const previewWidth = computed(() => {
	const aspectRatio = props.bounds.canvasWidth / props.bounds.canvasHeight
	if (aspectRatio >= 1) {
		// Landscape or square: width is constrained to 320
		return maxPreviewSize
	} else {
		// Portrait: scale width based on aspect ratio
		return Math.round(maxPreviewSize * aspectRatio)
	}
})

const previewHeight = computed(() => {
	const aspectRatio = props.bounds.canvasWidth / props.bounds.canvasHeight
	if (aspectRatio >= 1) {
		// Landscape or square: scale height based on aspect ratio
		return Math.round(maxPreviewSize / aspectRatio)
	} else {
		// Portrait: height is constrained to 320
		return maxPreviewSize
	}
})

// High-res canvas dimensions
const canvasWidth = computed(() => previewWidth.value * dpr)
const canvasHeight = computed(() => previewHeight.value * dpr)

// Generate share URL
const shareUrl = computed(() => {
	const state: ShareableState = {
		config: props.config,
		mode: shareMode.value,
		steps: props.steps,
		trimStart: props.trimStart,
		trimEnd: props.trimEnd,
		trimOverrides: props.trimOverrides,
		autoPlay: true, // Always auto-play when sharing
	}
	return encodeShareLink(state)
})

// Get current stroke color based on theme (match PaintCanvas colors)
const getStrokeColor = () => {
	const isDark = document.documentElement.classList.contains('dark')
	return isDark ? '#b8a691' : '#2b2014' // base-400 in dark, base-900 in light
}

// Draw preview canvas
const drawPreview = (pointsToDraw: Point2D[]) => {
	const canvas = previewCanvasRef.value
	if (!canvas) {
		return
	}

	const ctx = canvas.getContext('2d')
	if (!ctx) {
		return
	}

	// Reset and set transform for high DPI
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

	// Scale to fit preview canvas
	const scaleX = previewWidth.value / props.bounds.canvasWidth
	const scaleY = previewHeight.value / props.bounds.canvasHeight

	// Clear canvas
	ctx.clearRect(0, 0, previewWidth.value, previewHeight.value)

	// Draw path
	if (pointsToDraw.length > 1) {
		ctx.strokeStyle = getStrokeColor()
		ctx.lineWidth = 1
		ctx.lineCap = 'round'
		ctx.lineJoin = 'round'

		ctx.beginPath()
		ctx.moveTo(pointsToDraw[0].x * scaleX, pointsToDraw[0].y * scaleY)

		for (let i = 1; i < pointsToDraw.length; i++) {
			ctx.lineTo(pointsToDraw[i].x * scaleX, pointsToDraw[i].y * scaleY)
		}

		ctx.stroke()
	}
}

// Animation loop for realtime mode preview
const animatePreview = () => {
	if (shareMode.value !== 'realtime' || props.trimmedPoints.length === 0) return

	const segmentLength = 5 // Draw 5 points per frame
	currentPointIndex = (currentPointIndex + segmentLength) % props.trimmedPoints.length

	const pointsToDraw = props.trimmedPoints.slice(0, currentPointIndex + 1)
	drawPreview(pointsToDraw)

	animationFrameId = requestAnimationFrame(animatePreview)
}

// Initialize preview
const initializePreview = async () => {
	await nextTick()

	// Ensure canvas is ready
	if (!previewCanvasRef.value) {
		setTimeout(initializePreview, 50)
		return
	}

	if (shareMode.value === 'instant') {
		// Static preview for instant mode
		drawPreview(props.trimmedPoints)
	} else {
		// Start looping animation for realtime mode
		currentPointIndex = 0
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId)
		}
		animatePreview()
	}
}

// Handle close
const handleClose = () => {
	if (animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId)
		animationFrameId = null
	}
	emit('close')
}

// Handle copy
const handleCopy = async () => {
	const success = await copyToClipboard(shareUrl.value)
	if (success) {
		copyButtonText.value = 'Copied!'
		setTimeout(() => {
			copyButtonText.value = 'Copy'
		}, 2000)
	} else {
		// Fallback: select the input
		linkInputRef.value?.select()
		copyButtonText.value = 'Select & Copy'
		setTimeout(() => {
			copyButtonText.value = 'Copy'
		}, 2000)
	}
}

// Handle select all on click
const handleSelectAll = () => {
	linkInputRef.value?.select()
}

// Handle ESC key
const handleEscKey = (e: KeyboardEvent) => {
	if (e.key === 'Escape' && props.show) {
		handleClose()
	}
}

// Watch for modal open/close
watch(
	() => props.show,
	async newShow => {
		if (newShow) {
			// Reset shareMode to current mode when opening
			shareMode.value = props.mode
			initializePreview()
			document.addEventListener('keydown', handleEscKey)
		} else {
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId)
				animationFrameId = null
			}
			document.removeEventListener('keydown', handleEscKey)
		}
	},
)

// Watch for changes to trimmedPoints and redraw if modal is open
watch(
	() => props.trimmedPoints,
	() => {
		if (props.show && shareMode.value === 'instant') {
			drawPreview(props.trimmedPoints)
		}
	},
	{ deep: true },
)

// Watch for shareMode changes and update preview
watch(shareMode, newMode => {
	if (!props.show) return

	if (newMode === 'instant') {
		// Stop animation and draw static preview
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId)
			animationFrameId = null
		}
		drawPreview(props.trimmedPoints)
	} else {
		// Start looping animation
		currentPointIndex = 0
		animatePreview()
	}
})

// Watch for theme changes and redraw
const themeObserver = new MutationObserver(() => {
	if (props.show) {
		if (shareMode.value === 'instant') {
			drawPreview(props.trimmedPoints)
		}
	}
})

onMounted(() => {
	if (props.show) {
		initializePreview()
		document.addEventListener('keydown', handleEscKey)
	}

	// Observe theme changes
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['class'],
	})
})

onUnmounted(() => {
	if (animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId)
	}
	document.removeEventListener('keydown', handleEscKey)
	themeObserver.disconnect()
})
</script>
