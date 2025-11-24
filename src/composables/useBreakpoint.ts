import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable to track window width and determine if screen is too narrow
 * Minimum width: 1350px (wider sidebars + canvas spacing)
 */
export function useBreakpoint() {
	const MIN_WIDTH = 1250
	const windowWidth = ref(0)
	const isTooNarrow = ref(false)

	const updateWidth = () => {
		windowWidth.value = window.innerWidth
		isTooNarrow.value = windowWidth.value < MIN_WIDTH
	}

	onMounted(() => {
		updateWidth()
		window.addEventListener('resize', updateWidth)
	})

	onUnmounted(() => {
		window.removeEventListener('resize', updateWidth)
	})

	return {
		windowWidth,
		isTooNarrow,
		minWidth: MIN_WIDTH,
	}
}
