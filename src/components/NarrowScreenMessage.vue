<template>
	<div class="flex flex-col items-center justify-center h-full bg-gray-50">
		<!-- Content -->
		<div class="max-w-md text-center space-y-4">
			<div class="text-6xl">📐</div>
			<h1 class="text-2xl font-bold text-gray-900">Screen Too Narrow</h1>
			<p class="text-gray-600">
				This pendulum plotter requires a minimum screen width of
				<strong>{{ minWidth }}px</strong> to display the controls, canvas, and diagnostic views.
			</p>
			<p class="text-gray-600">Please resize your window or use a larger display.</p>
		</div>

		<!-- Current width with arrows pointing to screen edges -->
		<div class="w-full flex items-center px-4 mt-8">
			<div class="text-2xl text-gray-400">←</div>
			<div class="flex-1 h-0.5 bg-gray-300 mx-2" />
			<p class="text-sm text-gray-500 whitespace-nowrap">
				Current width: <strong>{{ currentWidth }}px</strong>
			</p>
			<div class="flex-1 h-0.5 bg-gray-300 mx-2" />
			<div class="text-2xl text-gray-400">→</div>
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	currentWidth: number
	minWidth: number
}>()
</script>
