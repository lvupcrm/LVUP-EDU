/**
 * Application Metrics Utilities
 * - Request tracking and performance metrics
 * - Business metrics collection
 */

// Simple metrics storage (in production, use a proper metrics library like prom-client)
const metrics = {
  requests_total: 0,
  requests_duration_ms: [] as number[],
  active_users: 0,
  courses_total: 0,
  enrollments_total: 0,
  revenue_total: 0
}

/**
 * Track HTTP request metrics
 * @param duration Request duration in milliseconds
 */
export function trackRequest(duration: number) {
  metrics.requests_total++
  metrics.requests_duration_ms.push(duration)
  
  // Keep only last 1000 requests for average calculation
  if (metrics.requests_duration_ms.length > 1000) {
    metrics.requests_duration_ms = metrics.requests_duration_ms.slice(-1000)
  }
}

/**
 * Get current metrics data
 */
export function getMetrics() {
  return { ...metrics }
}

/**
 * Update business metrics
 * @param updates Partial metrics update object
 */
export function updateMetrics(updates: Partial<typeof metrics>) {
  Object.assign(metrics, updates)
}

/**
 * Calculate average response time
 */
export function getAverageResponseTime() {
  return metrics.requests_duration_ms.length > 0
    ? metrics.requests_duration_ms.reduce((a, b) => a + b, 0) / metrics.requests_duration_ms.length
    : 0
}

/**
 * Reset all metrics (useful for testing)
 */
export function resetMetrics() {
  metrics.requests_total = 0
  metrics.requests_duration_ms = []
  metrics.active_users = 0
  metrics.courses_total = 0
  metrics.enrollments_total = 0
  metrics.revenue_total = 0
}