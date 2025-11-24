<template>
	<div class="space-y-3">
		<!-- Export Buttons -->
		<div class="grid grid-cols-2 gap-2">
			<AppButton class="px-3 py-2" variant="primary" :disabled="disabled" @click="$emit('export-svg')"> SVG </AppButton>
			<AppButton class="px-3 py-2" variant="primary" :disabled="disabled" @click="$emit('export-png')"> PNG </AppButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import AppButton from '@/components/common/AppButton.vue'

defineProps<{
	disabled?: boolean
}>()

defineEmits<{
	'export-svg': []
	'export-png': []
}>()
</script>
