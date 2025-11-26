<template>
	<div>
		<div class="space-y-3">
			<!-- Zoom -->
			<div>
				<div class="flex justify-between items-baseline mb-1">
					<label
						for="experiment-scale"
						class="text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400"
					>
						Experiment Scale
					</label>
					<span class="text-sm font-mono font-light text-base-800 dark:text-base-100"
						>{{ localConfig.zoom.toFixed(2) }}x</span
					>
				</div>
				<input
					id="experiment-scale"
					v-model.number="localConfig.zoom"
					type="range"
					min="0.5"
					max="5.0"
					step="0.1"
					:disabled="disabled"
					class="w-full h-1.5 bg-base-200 dark:bg-base-700 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-accent-primary-500 [&::-webkit-slider-thumb]:to-accent-primary-700 [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-md [&::-moz-range-thumb]:bg-gradient-to-b [&::-moz-range-thumb]:from-accent-primary-500 [&::-moz-range-thumb]:to-accent-primary-700 [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-moz-range-thumb]:border-0"
					@input="emitUpdate"
				/>
				<!-- <p class="text-[10px] text-base-500 dark:text-base-400 mt-1">
					Scale of the experiment.
				</p> -->
			</div>

			<!-- Measurement Area -->
			<div>
				<div class="flex justify-between items-baseline mb-1">
					<label
						for="measurement-area"
						class="text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400"
					>
						Measurement Area
					</label>
					<span class="text-sm font-mono font-light text-base-800 dark:text-base-100">{{
						CANVAS_SHAPES[localConfig.canvasShape].description
					}}</span>
				</div>
				<input
					id="measurement-area"
					:value="localShapeIndex"
					type="range"
					min="0"
					:max="canvasShapeOptions.length - 1"
					step="1"
					:disabled="disabled"
					class="w-full h-1.5 bg-base-200 dark:bg-base-700 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-accent-primary-500 [&::-webkit-slider-thumb]:to-accent-primary-700 [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-md [&::-moz-range-thumb]:bg-gradient-to-b [&::-moz-range-thumb]:from-accent-primary-500 [&::-moz-range-thumb]:to-accent-primary-700 [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-moz-range-thumb]:border-0"
					@input="e => handleShapeChange(Number((e.target as HTMLInputElement).value))"
				/>
				<!-- <p class="text-[10px] text-base-500 dark:text-base-400 mt-1">
					Canvas dimensions and aspect ratio.
				</p> -->
			</div>

			<!-- Damping -->
			<div>
				<div class="flex justify-between items-baseline mb-1">
					<label
						for="damping"
						class="text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400"
					>
						Dissipative Friction Factor
					</label>
					<span class="text-sm font-mono font-light text-base-800 dark:text-base-100">{{
						localConfig.damping.toFixed(3)
					}}</span>
				</div>
				<input
					id="damping"
					v-model.number="localConfig.damping"
					type="range"
					min="0"
					max="0.1"
					step="0.001"
					:disabled="disabled"
					class="w-full h-1.5 bg-base-200 dark:bg-base-700 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-accent-primary-500 [&::-webkit-slider-thumb]:to-accent-primary-700 [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-md [&::-moz-range-thumb]:bg-gradient-to-b [&::-moz-range-thumb]:from-accent-primary-500 [&::-moz-range-thumb]:to-accent-primary-700 [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-moz-range-thumb]:border-0"
					@input="emitUpdate"
				/>
				<p class="text-[10px] text-base-500 dark:text-base-400 mt-1">Air resistance. Bigger = stop faster.</p>
			</div>

			<!-- Initial Theta -->
			<div>
				<div class="flex justify-between items-baseline mb-1">
					<label
						for="initial-theta"
						class="text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400"
					>
						Rotation θ
					</label>
					<span class="text-sm font-mono font-light text-base-800 dark:text-base-100"
						>{{ localConfig.initialTheta.toFixed(2) }} rad</span
					>
				</div>
				<input
					id="initial-theta"
					v-model.number="localConfig.initialTheta"
					type="range"
					min="-3.14"
					max="3.14"
					step="0.01"
					:disabled="disabled"
					class="w-full h-1.5 bg-base-200 dark:bg-base-700 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-accent-primary-500 [&::-webkit-slider-thumb]:to-accent-primary-700 [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-md [&::-moz-range-thumb]:bg-gradient-to-b [&::-moz-range-thumb]:from-accent-primary-500 [&::-moz-range-thumb]:to-accent-primary-700 [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-moz-range-thumb]:border-0"
					@input="emitUpdate"
				/>
				<!-- <p class="text-[10px] text-base-500 dark:text-base-400 mt-1">
					Starting angle around the center.
				</p> -->
			</div>

			<!-- Initial Phi -->
			<div>
				<div class="flex justify-between items-baseline mb-1">
					<label
						for="initial-phi"
						class="text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400"
					>
						Starting Height φ
					</label>
					<span class="text-sm font-mono font-light text-base-800 dark:text-base-100"
						>{{ localConfig.initialPhi.toFixed(2) }} rad</span
					>
				</div>
				<input
					id="initial-phi"
					v-model.number="localConfig.initialPhi"
					type="range"
					min="0"
					max="1.57"
					step="0.01"
					:disabled="disabled"
					class="w-full h-1.5 bg-base-200 dark:bg-base-700 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-accent-primary-500 [&::-webkit-slider-thumb]:to-accent-primary-700 [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-md [&::-moz-range-thumb]:bg-gradient-to-b [&::-moz-range-thumb]:from-accent-primary-500 [&::-moz-range-thumb]:to-accent-primary-700 [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-moz-range-thumb]:border-0"
					@input="emitUpdate"
				/>
				<!-- <p class="text-[10px] text-base-500 dark:text-base-400 mt-1">
					Starting rotation around the center.
				</p> -->
			</div>

			<!-- Initial Theta Dot -->
			<div>
				<div class="flex justify-between items-baseline mb-1">
					<label
						for="initial-theta-dot"
						class="text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400"
					>
						Starting Spin θ̇
					</label>
					<span class="text-sm font-mono font-light text-base-800 dark:text-base-100"
						>{{ localConfig.initialThetaDot.toFixed(2) }} rad/s</span
					>
				</div>
				<input
					id="initial-theta-dot"
					v-model.number="localConfig.initialThetaDot"
					type="range"
					min="-2.5"
					max="2.5"
					step="0.01"
					:disabled="disabled"
					class="w-full h-1.5 bg-base-200 dark:bg-base-700 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-accent-primary-500 [&::-webkit-slider-thumb]:to-accent-primary-700 [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-md [&::-moz-range-thumb]:bg-gradient-to-b [&::-moz-range-thumb]:from-accent-primary-500 [&::-moz-range-thumb]:to-accent-primary-700 [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-moz-range-thumb]:border-0"
					@input="emitUpdate"
				/>
				<!-- <p class="text-[10px] text-base-500 dark:text-base-400 mt-1">Initial push away from the center.</p> -->
			</div>

			<!-- Initial Phi Dot
			<div>
				<div class="flex justify-between items-baseline mb-1">
					<label class="text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400">
						Initial Velocity φ̇
					</label>
					<span class="text-sm font-mono font-light text-base-800 dark:text-base-100"
						>{{ localConfig.initialPhiDot.toFixed(2) }} rad/s</span
					>
				</div>
				<input
					v-model.number="localConfig.initialPhiDot"
					type="range"
					min="-5"
					max="5"
					step="0.1"
					:disabled="disabled"
					class="w-full h-1.5 bg-base-200 dark:bg-base-700 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-accent-primary-500 [&::-webkit-slider-thumb]:to-accent-primary-700 [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-md [&::-moz-range-thumb]:bg-gradient-to-b [&::-moz-range-thumb]:from-accent-primary-500 [&::-moz-range-thumb]:to-accent-primary-700 [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-moz-range-thumb]:border-0"
					@input="emitUpdate"
				/>
				<p class="text-[10px] text-base-500 dark:text-base-400 mt-1">Initial spin speed around the center.</p>
			</div> -->

			<!-- Canvas Swing Start -->
			<div>
				<div class="flex justify-between items-baseline mb-1">
					<label
						for="canvas-swing-start"
						class="text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400"
					>
						Canvas Swing Start
					</label>
					<span class="text-sm font-mono font-light text-base-800 dark:text-base-100"
						>{{ localConfig.canvasSwingStart.toFixed(2) }} rad</span
					>
				</div>
				<input
					id="canvas-swing-start"
					v-model.number="localConfig.canvasSwingStart"
					type="range"
					min="-0.5"
					max="0.5"
					step="0.01"
					:disabled="disabled"
					class="w-full h-1.5 bg-base-200 dark:bg-base-700 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-accent-primary-500 [&::-webkit-slider-thumb]:to-accent-primary-700 [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-md [&::-moz-range-thumb]:bg-gradient-to-b [&::-moz-range-thumb]:from-accent-primary-500 [&::-moz-range-thumb]:to-accent-primary-700 [&::-moz-range-thumb]:shadow-[0_1px_3px_rgba(69,40,20,0.08)] [&::-moz-range-thumb]:border-0"
					@input="emitUpdate"
				/>
				<p class="text-[10px] text-base-500 dark:text-base-400 mt-1">Simulates canvas on a swing. 0 = static.</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import type { SimulationConfig, CanvasShape } from '@/types'
import { CANVAS_SHAPES } from '@/utils/coordinates'

const props = defineProps<{
	config: SimulationConfig
	disabled?: boolean
}>()

const emit = defineEmits<{
	update: [config: Partial<SimulationConfig>]
}>()

const localConfig = reactive({
	ropeLength: props.config.ropeLength,
	gravity: props.config.gravity,
	zoom: props.config.zoom,
	canvasShape: props.config.canvasShape,
	damping: props.config.damping,
	initialTheta: props.config.initialTheta,
	initialPhi: props.config.initialPhi,
	initialThetaDot: props.config.initialThetaDot,
	initialPhiDot: props.config.initialPhiDot,
	canvasSwingStart: props.config.canvasSwingStart,
})

// Sync with props when they change externally
watch(
	() => props.config,
	newConfig => {
		localConfig.ropeLength = newConfig.ropeLength
		localConfig.gravity = newConfig.gravity
		localConfig.zoom = newConfig.zoom
		localConfig.canvasShape = newConfig.canvasShape
		localConfig.damping = newConfig.damping
		localConfig.initialTheta = newConfig.initialTheta
		localConfig.initialPhi = newConfig.initialPhi
		localConfig.initialThetaDot = newConfig.initialThetaDot
		localConfig.initialPhiDot = newConfig.initialPhiDot
		localConfig.canvasSwingStart = newConfig.canvasSwingStart
	},
	{ deep: true },
)

const emitUpdate = () => {
	emit('update', { ...localConfig })
}

// Canvas shape utilities
const canvasShapeOptions = Object.entries(CANVAS_SHAPES)
const localShapeIndex = computed(() => canvasShapeOptions.findIndex(([shape]) => shape === localConfig.canvasShape))

const handleShapeChange = (index: number) => {
	const [shapeKey] = canvasShapeOptions[index]
	localConfig.canvasShape = shapeKey as CanvasShape
	emitUpdate()
}
</script>
