<template>
	<div class="space-y-3">
		<h3 class="text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400">
			Execution Mode
		</h3>

		<!-- Mode Toggle -->
		<div class="flex gap-2">
			<AppButton
				class="flex-1 px-3 py-2"
				:variant="mode === 'instant' ? 'primary' : 'neutral'"
				:disabled="status === 'running'"
				@click="$emit('mode-change', 'instant')"
			>
				Instant
			</AppButton>
			<AppButton
				class="flex-1 px-3 py-2"
				:variant="mode === 'realtime' ? 'primary' : 'neutral'"
				:disabled="status === 'running'"
				@click="$emit('mode-change', 'realtime')"
			>
				Real-time
			</AppButton>
		</div>

		<!-- Instant Mode Controls -->
		<div v-if="mode === 'instant'" class="space-y-2">
			<label class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400"
				>Iteration Count</label
			>
			<input
				v-model.number="steps"
				type="number"
				min="100"
				max="20000"
				step="100"
				:disabled="status !== 'idle' && status !== 'completed'"
				class="w-full px-2 py-2 text-sm font-mono font-light bg-base-100 dark:bg-base-800 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md text-base-800 dark:text-base-100 focus:outline-none focus:ring-4 focus:ring-[rgba(255,209,149,0.08)] focus:border-accent-primary-500/90 disabled:bg-base-200 dark:disabled:bg-base-700 disabled:cursor-not-allowed transition-all duration-120"
			/>
			<AppButton class="w-full px-4 py-2" variant="primary" :disabled="status === 'running'" @click="handleGenerate">
				Execute: Instant
			</AppButton>
		</div>

		<!-- Real-time Mode Controls -->
		<div v-else class="space-y-2">
			<!-- Start/Resume Button -->
			<AppButton
				v-if="status === 'idle' || status === 'completed'"
				class="w-full px-4 py-2"
				variant="primary"
				@click="$emit('start')"
			>
				Execute: Real-Time
			</AppButton>

			<AppButton
				v-else-if="status === 'paused'"
				class="w-full px-4 py-2"
				variant="primary"
				@click="$emit('resume')"
			>
				Resume
			</AppButton>

			<!-- Pause Button -->
			<AppButton
				v-if="status === 'running'"
				class="w-full px-4 py-2"
				variant="secondary"
				@click="$emit('pause')"
			>
				Pause
			</AppButton>

			<!-- Reset Button (always visible) -->
			<AppButton
				class="w-full px-4 py-2"
				:disabled="status === 'running'"
				@click="$emit('reset')"
			>
				State Reinitialization
			</AppButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/common/AppButton.vue'
import type { SimulationMode, SimulationStatus } from '@/composables/useSimulation'

defineProps<{
	mode: SimulationMode
	status: SimulationStatus
}>()

const emit = defineEmits<{
	reset: []
	generate: [steps: number]
	start: []
	pause: []
	resume: []
	'mode-change': [mode: SimulationMode]
}>()

const steps = ref(5000)

const handleGenerate = () => {
	emit('generate', steps.value)
}
</script>
