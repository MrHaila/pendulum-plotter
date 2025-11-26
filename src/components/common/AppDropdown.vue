<template>
	<div class="relative">
		<label
			v-if="label"
			:for="id"
			class="block text-xs font-display font-light tracking-wider uppercase text-base-700 dark:text-base-400 mb-1"
		>
			{{ label }}
		</label>
		<select
			:id="id"
			:value="modelValue"
			:disabled="disabled"
			class="w-full px-2 py-1.5 text-sm font-mono font-light bg-base-100 dark:bg-base-800 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] rounded-md text-base-800 dark:text-base-100 focus:outline-none focus:ring-4 focus:ring-[rgba(255,209,149,0.08)] focus:border-accent-primary-500/90 disabled:bg-base-200 dark:disabled:bg-base-700 disabled:text-base-400 dark:disabled:text-base-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-120 appearance-none cursor-pointer pr-8"
			@change="handleChange"
		>
			<option v-for="option in options" :key="option.value" :value="option.value">
				{{ option.label }}
			</option>
		</select>
		<!-- Dropdown chevron -->
		<div
			class="absolute right-2 pointer-events-none text-base-500"
			:class="label ? 'bottom-2' : 'top-1/2 -translate-y-1/2'"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>
	</div>
</template>

<script setup lang="ts">
export interface DropdownOption {
	value: string
	label: string
}

defineProps<{
	id: string
	modelValue: string
	options: DropdownOption[]
	label?: string
	disabled?: boolean
}>()

const emit = defineEmits<{
	'update:modelValue': [value: string]
}>()

const handleChange = (e: Event) => {
	emit('update:modelValue', (e.target as HTMLSelectElement).value)
}
</script>
