<template>
	<div
		class="flex items-center gap-2 text-[11px] font-display tracking-[0.2em] uppercase text-base-400 dark:text-base-500"
	>
		<span>{{ label }}</span>
		<div class="flex-1 h-px bg-[rgba(0,0,0,0.12)] dark:bg-[rgba(255,255,255,0.14)]" />
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{ label: string }>()

const label = props.label
</script>
