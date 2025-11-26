<template>
	<div class="space-y-3">
		<!-- Auto-run Mode Indicator -->
		<div
			v-if="appMode === 'auto-run'"
			class="px-3 py-2 bg-accent-primary-100 dark:bg-accent-primary-900/20 border border-accent-primary-300 dark:border-accent-primary-700/30 rounded-lg"
		>
			<div class="flex items-center gap-2">
				<div class="w-2 h-2 rounded-full bg-accent-primary-500 animate-pulse"></div>
				<span class="text-xs font-display tracking-wider uppercase text-accent-primary-700 dark:text-accent-primary-300"
					>Auto-Run Mode</span
				>
			</div>
		</div>

		<!-- Mode Tabs -->
		<AppSegmentedToggle
			:model-value="mode"
			:options="modeOptions"
			:disabled="status === 'running'"
			@update:model-value="$emit('mode-change', $event as SimulationMode)"
		/>

		<!-- Instant Mode Controls -->
		<div v-if="mode === 'instant'" class="space-y-2">
			<div>
				<label
					for="iteration-count"
					class="block text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400"
					>Iteration Count</label
				>
				<input
					id="iteration-count"
					v-model.number="steps"
					type="number"
					min="100"
					max="20000"
					step="100"
					:disabled="status === 'running'"
					class="w-full px-2 py-2 text-sm font-mono font-light bg-base-100 dark:bg-base-800 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md text-base-800 dark:text-base-100 focus:outline-none focus:ring-4 focus:ring-[rgba(255,209,149,0.08)] focus:border-accent-primary-500/90 disabled:bg-base-200 dark:disabled:bg-base-700 disabled:cursor-not-allowed transition-all duration-120"
				/>
			</div>

			<!-- Run/Clear + Auto Toggle Row -->
			<div class="flex gap-2">
				<AppButton
					v-show="!hasContent"
					class="flex-1 px-4 py-2"
					variant="primary"
					:disabled="status === 'running'"
					@click="handleGenerate"
				>
					Run
				</AppButton>
				<AppButton
					v-show="hasContent"
					class="flex-1 px-4 py-2"
					variant="secondary"
					:disabled="status === 'running'"
					@click="$emit('reset')"
				>
					Clear
				</AppButton>

				<!-- Manual/Auto Toggle -->
				<AppSegmentedToggle
					:model-value="autoSimulate ? 'auto' : 'manual'"
					:options="autoSimulateOptions"
					size="compact"
					:disabled="status === 'running'"
					@update:model-value="setAutoSimulate($event === 'auto')"
				/>
			</div>
		</div>

		<!-- Real-time Mode Controls -->
		<div v-else class="space-y-2">
			<!-- Start/Resume Button -->
			<AppButton
				v-show="(status === 'idle' || status === 'completed') && !hasContent"
				class="w-full px-4 py-2"
				variant="primary"
				@click="$emit('start')"
			>
				Start
			</AppButton>

			<AppButton v-show="status === 'paused'" class="w-full px-4 py-2" variant="primary" @click="$emit('resume')">
				Resume
			</AppButton>

			<!-- Pause Button -->
			<AppButton v-show="status === 'running'" class="w-full px-4 py-2" variant="primary" @click="$emit('pause')">
				Stop
			</AppButton>

			<!-- Clear Button for Real-time Mode -->
			<AppButton
				class="w-full px-4 py-2"
				variant="secondary"
				:disabled="status === 'running' || status === 'idle'"
				@click="$emit('reset')"
			>
				Clear Experiment
			</AppButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AppButton from '@/components/common/AppButton.vue'
import AppSegmentedToggle from '@/components/common/AppSegmentedToggle.vue'
import type { SimulationMode, SimulationStatus } from '@/composables/useSimulation'
import type { AppMode } from '@/types'

const props = defineProps<{
	mode: SimulationMode
	status: SimulationStatus
	hasContent: boolean
	appMode: AppMode
}>()

const emit = defineEmits<{
	reset: []
	generate: [steps: number]
	start: []
	pause: []
	resume: []
	'mode-change': [mode: SimulationMode]
	'auto-simulate-change': [enabled: boolean]
}>()

const steps = ref(5000)
const autoSimulate = ref(false)

const modeOptions = [
	{ value: 'realtime', label: 'Real-time' },
	{ value: 'instant', label: 'Instant' },
]

const autoSimulateOptions = [
	{ value: 'manual', label: 'Manual' },
	{ value: 'auto', label: 'Auto' },
]

const handleGenerate = () => {
	emit('generate', steps.value)
}

const setAutoSimulate = (enabled: boolean) => {
	autoSimulate.value = enabled
	emit('auto-simulate-change', enabled)
}

// Watch steps - when changed in auto mode (instant mode only), emit generate
watch(steps, () => {
	if (autoSimulate.value && props.mode === 'instant' && props.status !== 'running') {
		emit('generate', steps.value)
	}
})

// Expose steps for App.vue to read
defineExpose({ steps })
</script>
