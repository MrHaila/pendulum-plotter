import type { Point2D } from '@/types'

const EPSILON = 1e-6

export interface TrimOverrides {
	start?: Point2D
	end?: Point2D
}

export interface TrimmedRange {
	startIndex: number
	endIndex: number
	overrides: TrimOverrides | null
}

interface IntersectionResult {
	point: Point2D
	t: number
}

interface EndpointResolution {
	index: number
	override?: Point2D
}

/**
 * Auto-trim a line by finding the first and last self-intersection points.
 * This creates a closed loop from the line by trimming the "tail" portions.
 */
export function autoTrimLine(points: Point2D[]): TrimmedRange {
	const totalPoints = points.length
	if (totalPoints <= 1) {
		return {
			startIndex: 0,
			endIndex: totalPoints,
			overrides: null,
		}
	}

	const startResolution = resolveStart(points)
	const endResolution = resolveEnd(points, startResolution.index)

	if (endResolution.index <= startResolution.index + 1) {
		return {
			startIndex: 0,
			endIndex: totalPoints,
			overrides: null,
		}
	}

	const overrides: TrimOverrides = {}
	if (startResolution.override) {
		overrides.start = startResolution.override
	}
	if (endResolution.override) {
		overrides.end = endResolution.override
	}

	return {
		startIndex: startResolution.index,
		endIndex: endResolution.index,
		overrides: Object.keys(overrides).length ? overrides : null,
	}
}

/**
 * Find the first segment that intersects with a later segment.
 */
function resolveStart(points: Point2D[]): EndpointResolution {
	const lastIndex = points.length - 1
	for (let i = 0; i < lastIndex; i++) {
		const intersection = findForwardIntersection(points, i)
		if (intersection) {
			if (intersection.t <= EPSILON) {
				return { index: i }
			}
			if (intersection.t >= 1 - EPSILON) {
				return { index: i + 1 }
			}
			return { index: i, override: intersection.point }
		}
	}

	return { index: 0 }
}

/**
 * Find the last segment that intersects with an earlier segment.
 */
function resolveEnd(points: Point2D[], startIndex: number): EndpointResolution {
	for (let i = points.length - 1; i > Math.max(startIndex + 1, 0); i--) {
		const intersection = findBackwardIntersection(points, i)
		if (intersection) {
			if (intersection.t <= EPSILON) {
				return { index: i }
			}
			if (intersection.t >= 1 - EPSILON) {
				return { index: i + 1 }
			}
			return { index: i + 1, override: intersection.point }
		}
	}

	return { index: points.length }
}

function findForwardIntersection(points: Point2D[], startIndex: number): IntersectionResult | null {
	const segmentStart = points[startIndex]
	const segmentEnd = points[startIndex + 1]

	let best: IntersectionResult | null = null
	for (let i = startIndex + 2; i < points.length - 1; i++) {
		const otherStart = points[i]
		const otherEnd = points[i + 1]
		if (!boundingBoxesOverlap(segmentStart, segmentEnd, otherStart, otherEnd)) {
			continue
		}
		const intersection = segmentIntersection(segmentStart, segmentEnd, otherStart, otherEnd)
		if (!intersection) continue
		if (best === null || intersection.t < best.t) {
			best = intersection
		}
	}
	return best
}

function findBackwardIntersection(points: Point2D[], endIndex: number): IntersectionResult | null {
	const segmentStart = points[endIndex - 1]
	const segmentEnd = points[endIndex]
	let best: IntersectionResult | null = null
	for (let i = 0; i < endIndex - 2; i++) {
		const otherStart = points[i]
		const otherEnd = points[i + 1]
		if (!boundingBoxesOverlap(segmentStart, segmentEnd, otherStart, otherEnd)) {
			continue
		}
		const intersection = segmentIntersection(segmentStart, segmentEnd, otherStart, otherEnd)
		if (!intersection) continue
		if (best === null || intersection.t > best.t) {
			best = intersection
		}
	}
	return best
}

function boundingBoxesOverlap(a1: Point2D, a2: Point2D, b1: Point2D, b2: Point2D): boolean {
	const aMinX = Math.min(a1.x, a2.x)
	const aMaxX = Math.max(a1.x, a2.x)
	const aMinY = Math.min(a1.y, a2.y)
	const aMaxY = Math.max(a1.y, a2.y)
	const bMinX = Math.min(b1.x, b2.x)
	const bMaxX = Math.max(b1.x, b2.x)
	const bMinY = Math.min(b1.y, b2.y)
	const bMaxY = Math.max(b1.y, b2.y)

	return !(aMaxX < bMinX - EPSILON || bMaxX < aMinX - EPSILON || aMaxY < bMinY - EPSILON || bMaxY < aMinY - EPSILON)
}

function segmentIntersection(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D): IntersectionResult | null {
	const denominator = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)
	if (Math.abs(denominator) < EPSILON) {
		return null
	}

	const numeratorT = (p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)
	const numeratorU = (p1.x - p3.x) * (p1.y - p2.y) - (p1.y - p3.y) * (p1.x - p2.x)
	const t = numeratorT / denominator
	const u = numeratorU / denominator

	if (t <= 0 || t >= 1 || u <= 0 || u >= 1) {
		return null
	}

	return {
		point: {
			x: p1.x + t * (p2.x - p1.x),
			y: p1.y + t * (p2.y - p1.y),
		},
		t,
	}
}
