<template>
	<div class="space-y-3">
		<h3 class="text-sm font-semibold text-gray-700">Export</h3>

		<button
			class="w-full px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
			:disabled="disabled"
			@click="$emit('export')"
		>
			Export SVG
		</button>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	disabled: boolean
}>()

defineEmits<{
	export: []
}>()
</script>
