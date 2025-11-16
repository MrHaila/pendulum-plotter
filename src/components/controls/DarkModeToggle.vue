<template>
	<div
		class="relative inline-flex w-36 rounded-full border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] bg-base-100 dark:bg-base-800 shadow-sm"
		role="group"
		aria-label="Theme selection"
	>
		<span
			class="absolute inset-1 w-[calc(50%-0.125rem)] rounded-full bg-base-0 dark:bg-base-700 shadow transition-transform duration-200"
			:class="isDark ? 'translate-x-full' : 'translate-x-0'"
			aria-hidden="true"
		/>
		<button
			type="button"
			class="relative z-10 w-1/2 px-3 py-1.5 flex items-center justify-center gap-1 text-[11px] font-display tracking-[0.2em] uppercase transition-colors"
			:class="
				isDark
					? 'text-base-500 hover:text-base-300'
					: 'text-base-900'
			"
			:aria-pressed="!isDark"
			title="Switch to light mode"
			@click="setLightMode"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
				/>
			</svg>
			<span class="tracking-wide">Light</span>
		</button>
		<button
			type="button"
			class="relative z-10 w-1/2 px-3 py-1.5 flex items-center justify-center gap-1 text-[11px] font-display tracking-[0.2em] uppercase transition-colors"
			:class="
				isDark
					? 'text-base-0'
					: 'text-base-500 hover:text-base-700'
			"
			:aria-pressed="isDark"
			title="Switch to dark mode"
			@click="setDarkMode"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
				/>
			</svg>
			<span class="tracking-wide">Dark</span>
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const updateDarkMode = (dark: boolean) => {
	isDark.value = dark
	if (dark) {
		document.documentElement.classList.add('dark')
		localStorage.setItem('theme', 'dark')
	} else {
		document.documentElement.classList.remove('dark')
		localStorage.setItem('theme', 'light')
	}
}

const setLightMode = () => {
	if (isDark.value) {
		updateDarkMode(false)
	}
}

const setDarkMode = () => {
	if (!isDark.value) {
		updateDarkMode(true)
	}
}

onMounted(() => {
	// Check for saved theme preference or default to light
	const savedTheme = localStorage.getItem('theme')
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

	updateDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark))
})
</script>
