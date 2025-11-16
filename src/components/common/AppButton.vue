<template>
	<button
		:type="type"
		:disabled="disabled"
		class="inline-flex items-center justify-center gap-1 rounded-md px-3 py-1.5 text-xs font-display font-light tracking-[0.2em] uppercase transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-[rgba(255,209,149,0.12)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
		:class="variantClasses"
	>
		<slot />
	</button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'neutral' | 'primary' | 'secondary' | 'ghost'

const props = withDefaults(
	defineProps<{
		variant?: ButtonVariant
		type?: 'button' | 'submit' | 'reset'
		disabled?: boolean
	}>(),
	{
		variant: 'neutral',
		type: 'button',
		disabled: false,
	},
)

const variantClasses = computed(() => {
	const motion = props.disabled ? '' : 'hover:-translate-y-0.5 active:translate-y-px'
	const map: Record<ButtonVariant, string> = {
		primary: `${motion} bg-gradient-to-b from-accent-primary-500 to-accent-primary-700 text-white shadow-[0_1px_3px_rgba(69,40,20,0.12)] hover:shadow-[0_4px_8px_rgba(69,40,20,0.18)] disabled:from-base-300 disabled:to-base-300 dark:disabled:from-base-700 dark:disabled:to-base-700 disabled:text-base-900`,
		secondary: `${motion} bg-gradient-to-b from-accent-secondary-500 to-accent-secondary-700 dark:from-accent-secondary-300 dark:to-accent-secondary-500 text-white shadow-[0_1px_3px_rgba(69,40,20,0.12)] hover:shadow-[0_4px_8px_rgba(69,40,20,0.18)] disabled:from-base-300 disabled:to-base-300 dark:disabled:from-base-700 dark:disabled:to-base-700 disabled:text-base-900`,
		neutral: `${motion} bg-base-200 dark:bg-base-700 text-base-800 dark:text-base-100 border border-[#d7cbbf] dark:border-[rgba(255,210,160,0.06)] hover:bg-base-300 dark:hover:bg-base-600 disabled:bg-base-300 disabled:text-base-500 dark:disabled:bg-base-600`,
		ghost: `${motion} bg-transparent text-base-500 dark:text-base-400 hover:text-base-900 dark:hover:text-base-100 border border-transparent`,
	}
	return map[props.variant]
})

const type = computed(() => props.type)
const disabled = computed(() => props.disabled)
</script>
