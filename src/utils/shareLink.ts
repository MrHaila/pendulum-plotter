import type { SimulationConfig } from '@/types'
import type { SimulationMode } from '@/composables/useSimulation'
import type { TrimOverrides } from '@/core/trimming'

export interface ShareableState {
	config: SimulationConfig
	mode: SimulationMode
	steps?: number // for instant mode
	trimStart: number
	trimEnd: number
	trimOverrides: TrimOverrides | null
	autoPlay: boolean
}

/**
 * Get base URL based on environment
 */
function getBaseUrl(): string {
	return import.meta.env.PROD ? 'https://plotter.haila.fi' : 'http://localhost:5173'
}

/**
 * Encode shareable state to URL
 */
export function encodeShareLink(state: ShareableState): string {
	try {
		const json = JSON.stringify(state)
		const base64 = btoa(json)
		const baseUrl = getBaseUrl()
		return `${baseUrl}?s=${encodeURIComponent(base64)}`
	} catch (error) {
		console.error('Failed to encode share link:', error)
		throw new Error('Failed to generate share link')
	}
}

/**
 * Decode and validate shareable state from URL query param
 */
export function decodeShareLink(queryParam: string): ShareableState | null {
	try {
		const decoded = atob(decodeURIComponent(queryParam))
		const parsed = JSON.parse(decoded) as ShareableState

		// Validate and sanitize
		if (!isValidShareableState(parsed)) {
			console.warn('Invalid shareable state format')
			return null
		}

		return sanitizeShareableState(parsed)
	} catch (error) {
		console.error('Failed to decode share link:', error)
		return null
	}
}

/**
 * Check if parsed object has valid ShareableState structure
 */
function isValidShareableState(state: unknown): state is ShareableState {
	if (typeof state !== 'object' || state === null) return false

	const s = state as Record<string, unknown>

	return (
		typeof s.config === 'object' &&
		s.config !== null &&
		(s.mode === 'instant' || s.mode === 'realtime') &&
		typeof s.trimStart === 'number' &&
		typeof s.trimEnd === 'number' &&
		typeof s.autoPlay === 'boolean'
	)
}

/**
 * Sanitize and bound-check values
 */
function sanitizeShareableState(state: ShareableState): ShareableState {
	const config = state.config

	return {
		config: {
			ropeLength: clamp(config.ropeLength ?? 1.0, 0.1, 10),
			gravity: clamp(config.gravity ?? 9.81, 0.1, 50),
			damping: clamp(config.damping ?? 0.05, 0, 1),
			timestep: clamp(config.timestep ?? 0.01, 0.001, 0.1),
			zoom: clamp(config.zoom ?? 2.0, 0.5, 5),
			canvasShape: isValidCanvasShape(config.canvasShape) ? config.canvasShape : 'a4-portrait',
			initialTheta: clamp(config.initialTheta ?? 0.5, -Math.PI, Math.PI),
			initialPhi: clamp(config.initialPhi ?? Math.PI / 4, 0, Math.PI / 2),
			initialThetaDot: clamp(config.initialThetaDot ?? 0.3, -10, 10),
			initialPhiDot: clamp(config.initialPhiDot ?? 0, -10, 10),
			canvasSwingStart: clamp(config.canvasSwingStart ?? 0, -0.5, 0.5),
		},
		mode: state.mode,
		steps: state.steps !== undefined ? clamp(Math.floor(state.steps), 100, 20000) : undefined,
		trimStart: Math.max(0, Math.floor(state.trimStart)),
		trimEnd: Math.max(0, Math.floor(state.trimEnd)),
		trimOverrides: state.trimOverrides,
		autoPlay: Boolean(state.autoPlay),
	}
}

/**
 * Validate canvas shape
 */
function isValidCanvasShape(shape: unknown): shape is SimulationConfig['canvasShape'] {
	return (
		shape === 'square-center' ||
		shape === 'a4-portrait' ||
		shape === 'a4-landscape' ||
		shape === '16x9-portrait' ||
		shape === '16x9-landscape'
	)
}

/**
 * Clamp number between min and max
 */
function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max)
}

/**
 * Get current URL query params
 */
export function getShareQueryParam(): string | null {
	if (typeof window === 'undefined') return null
	const params = new URLSearchParams(window.location.search)
	return params.get('s')
}

/**
 * Copy text to clipboard using Clipboard API
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text)
		return true
	} catch (error) {
		console.error('Failed to copy to clipboard:', error)
		return false
	}
}
