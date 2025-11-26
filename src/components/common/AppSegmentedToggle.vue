<template>
	<div class="rounded-lg flex" :class="[sizeClasses.container, disabled ? 'opacity-60' : '']">
		<button
			v-for="option in options"
			:key="option.value"
			type="button"
			:class="buttonClasses(option.value)"
			:aria-pressed="modelValue === option.value"
			:disabled="disabled"
			@click="$emit('update:modelValue', option.value)"
		>
			{{ option.label }}
		</button>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ToggleOption<T = string> {
	value: T
	label: string
}

const props = withDefaults(
	defineProps<{
		modelValue: string
		options: ToggleOption[]
		size?: 'normal' | 'compact'
		disabled?: boolean
	}>(),
	{
		size: 'normal',
		disabled: false,
	},
)

defineEmits<{
	'update:modelValue': [value: string]
}>()

const sizeClasses = computed(() => {
	if (props.size === 'compact') {
		return {
			container: 'bg-base-200 dark:bg-base-700 p-0.5 gap-0',
			button: 'px-2 py-1.5 text-[10px] tracking-[0.15em]',
		}
	}
	return {
		container: 'bg-base-200 dark:bg-base-700 p-1 gap-1',
		button: 'flex-1 px-3 py-2 text-[11px] tracking-[0.2em]',
	}
})

const buttonClasses = (value: string) => [
	sizeClasses.value.button,
	'font-display uppercase rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary-400',
	props.modelValue === value
		? 'bg-base-0 text-base-900 shadow-sm dark:bg-linear-to-b dark:from-accent-primary-300 dark:to-accent-primary-500 dark:text-base-0'
		: 'text-base-600 dark:text-base-200 hover:bg-base-0/70 hover:text-base-900 hover:shadow-sm dark:hover:bg-base-600 dark:hover:text-base-100',
	props.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
]
</script>
