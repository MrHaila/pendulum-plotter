<template>
	<div class="flex flex-col items-center justify-center h-full bg-base-100 dark:bg-base-800">
		<!-- Content -->
		<div class="max-w-md text-center space-y-4 px-6">
			<div class="text-6xl">📐</div>
			<h1 class="text-lg font-display font-light tracking-wider uppercase text-base-800 dark:text-base-100">
				Viewport Too Small
			</h1>
			<p class="text-sm font-mono font-light text-base-500 dark:text-base-400">
				This is a super seriously scientific project and thus requires a minimum screen width of
				<strong class="text-base-800 dark:text-base-100">{{ minWidth }}px</strong>.
			</p>
			<p class="text-sm font-mono font-light text-base-500 dark:text-base-400">
				Please resize your window or use a larger display.
			</p>
		</div>

		<!-- Current width with arrows pointing to screen edges -->
		<div class="w-full flex items-center px-4 mt-8">
			<div class="text-2xl text-base-400">←</div>
			<div class="flex-1 h-0.5 bg-[#d7cbbf] dark:bg-[rgba(255,210,160,0.06)] mx-2" />
			<p class="text-xs font-mono font-light text-base-500 dark:text-base-400 whitespace-nowrap">
				Current width: <strong class="text-base-800 dark:text-base-100">{{ currentWidth }}px</strong>
			</p>
			<div class="flex-1 h-0.5 bg-[#d7cbbf] dark:bg-[rgba(255,210,160,0.06)] mx-2" />
			<div class="text-2xl text-base-400">→</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	currentWidth: number
	minWidth: number
}>()
</script>
