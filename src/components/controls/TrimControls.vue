<template>
	<div class="space-y-3">
		<AppButton
			class="w-full px-4 py-2"
			variant="secondary"
			:disabled="disabled || pointCount < 2"
			@click="$emit('auto-trim')"
		>
			Auto Trim Path
		</AppButton>

		<!-- Trim Controls -->
		<div>
			<div class="grid grid-cols-2 gap-3">
				<!-- Start Trim -->
				<div>
					<label
						class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400 mb-1"
						>Start Point</label
					>
					<input
						:value="props.trimStart"
						type="number"
						:min="0"
						:max="Math.max(0, pointCount - 1)"
						:disabled="disabled || pointCount === 0"
						class="w-full px-2 py-1.5 text-sm font-mono font-light bg-base-100 dark:bg-base-800 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md text-base-800 dark:text-base-100 focus:outline-none focus:ring-4 focus:ring-[rgba(255,209,149,0.08)] focus:border-accent-primary-500/90 disabled:bg-base-200 dark:disabled:bg-base-700 disabled:text-base-400 dark:disabled:text-base-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-120"
						@input="updateStart"
					/>
				</div>

				<!-- End Trim -->
				<div>
					<label
						class="block text-xs font-display font-light tracking-wider uppercase text-base-500 dark:text-base-400 mb-1"
						>End Point</label
					>
					<input
						:value="props.trimEnd"
						type="number"
						:min="0"
						:max="Math.max(0, pointCount)"
						:disabled="disabled || pointCount === 0"
						class="w-full px-2 py-1.5 text-sm font-mono font-light bg-base-100 dark:bg-base-800 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md text-base-800 dark:text-base-100 focus:outline-none focus:ring-4 focus:ring-[rgba(255,209,149,0.08)] focus:border-accent-primary-500/90 disabled:bg-base-200 dark:disabled:bg-base-700 disabled:text-base-400 dark:disabled:text-base-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-120"
						@input="updateEnd"
					/>
				</div>
			</div>
		</div>

		<!-- Reset Trim Button -->
		<AppButton
			class="w-full"
			:disabled="disabled || (props.trimStart === 0 && props.trimEnd === pointCount)"
			variant="secondary"
			@click="resetTrim"
		>
			Reset Trim Range
		</AppButton>
	</div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import AppButton from '@/components/common/AppButton.vue'

const props = defineProps<{
	pointCount: number
	trimStart: number
	trimEnd: number
	disabled?: boolean
}>()

const emit = defineEmits<{
	'auto-trim': []
	'update:trimStart': [value: number]
	'update:trimEnd': [value: number]
}>()

// Watch for disabled -> enabled transition, reset to full range
watch(
	() => props.disabled,
	(newDisabled, oldDisabled) => {
		if (oldDisabled && !newDisabled) {
			// Just became enabled, reset to full range
			emit('update:trimStart', 0)
			emit('update:trimEnd', props.pointCount)
		}
	},
)

const updateStart = (e: Event) => {
	const value = parseInt((e.target as HTMLInputElement).value, 10)
	if (!isNaN(value) && value >= 0 && value <= props.trimEnd) {
		emit('update:trimStart', value)
	}
}

const updateEnd = (e: Event) => {
	const value = parseInt((e.target as HTMLInputElement).value, 10)
	if (!isNaN(value) && value >= props.trimStart && value <= props.pointCount) {
		emit('update:trimEnd', value)
	}
}

const resetTrim = () => {
	emit('update:trimStart', 0)
	emit('update:trimEnd', props.pointCount)
}
</script>
