/**
 * Prometheus Metrics Endpoint
 * - Application performance metrics
 * - Business metrics
 * - System health metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getMetrics, updateMetrics, getAverageResponseTime } from '@/lib/metrics'

export async function GET(request: NextRequest) {
  try {
    // Update business metrics from database
    await updateBusinessMetrics()

    // Get current metrics
    const currentMetrics = getMetrics()
    
    // Calculate average response time
    const avgResponseTime = getAverageResponseTime()

    // Generate Prometheus format metrics
    const prometheusMetrics = `
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${currentMetrics.requests_total}

# HELP http_request_duration_ms Average HTTP request duration in milliseconds
# TYPE http_request_duration_ms gauge
http_request_duration_ms ${avgResponseTime.toFixed(2)}

# HELP active_users_total Number of active users
# TYPE active_users_total gauge
active_users_total ${currentMetrics.active_users}

# HELP courses_total Total number of courses
# TYPE courses_total gauge
courses_total ${currentMetrics.courses_total}

# HELP enrollments_total Total number of enrollments
# TYPE enrollments_total gauge
enrollments_total ${currentMetrics.enrollments_total}

# HELP revenue_total Total revenue in KRW
# TYPE revenue_total gauge
revenue_total ${currentMetrics.revenue_total}

# HELP nodejs_memory_usage_bytes Node.js memory usage
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="rss"} ${process.memoryUsage().rss}
nodejs_memory_usage_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}
nodejs_memory_usage_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}
nodejs_memory_usage_bytes{type="external"} ${process.memoryUsage().external}

# HELP nodejs_uptime_seconds Node.js uptime in seconds
# TYPE nodejs_uptime_seconds gauge
nodejs_uptime_seconds ${process.uptime()}

# HELP nodejs_version_info Node.js version information
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}"} 1
`.trim()

    return new NextResponse(prometheusMetrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8'
      }
    })

  } catch (error) {
    console.error('Metrics endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    )
  }
}

async function updateBusinessMetrics() {
  try {
    // Get total courses count
    const { count: coursesCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })

    // Get total enrollments count
    const { count: enrollmentsCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })

    // Get active users (logged in within last 24 hours)
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)

    const { count: activeUsersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', yesterday.toISOString())

    // Get total revenue from completed orders
    const { data: orders } = await supabase
      .from('orders')
      .select('amount')
      .eq('status', 'COMPLETED')

    const revenue = orders?.reduce((sum, order) => sum + order.amount, 0) || 0

    // Update metrics using the utility function
    updateMetrics({
      courses_total: coursesCount || 0,
      enrollments_total: enrollmentsCount || 0,
      active_users: activeUsersCount || 0,
      revenue_total: revenue
    })

  } catch (error) {
    console.error('Failed to update business metrics:', error)
  }
}