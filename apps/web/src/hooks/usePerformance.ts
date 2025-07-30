/**
 * Performance Monitoring Hooks
 * - Web Vitals tracking
 * - Component performance
 * - Memory usage monitoring
 * - Network performance
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { logger } from '@/lib/logger'

// Web Vitals tracking
export function useWebVitals() {
  useEffect(() => {
    // Dynamically import web-vitals to avoid SSR issues
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS((metric: any) => {
        logger.info('CLS', { value: metric.value, rating: metric.rating })
      })
      
      onFID((metric: any) => {
        logger.info('FID', { value: metric.value, rating: metric.rating })
      })
      
      onFCP((metric: any) => {
        logger.info('FCP', { value: metric.value, rating: metric.rating })
      })
      
      onLCP((metric: any) => {
        logger.info('LCP', { value: metric.value, rating: metric.rating })
      })
      
      onTTFB((metric: any) => {
        logger.info('TTFB', { value: metric.value, rating: metric.rating })
      })
    })
  }, [])
}

// Component render performance tracking
export function useRenderPerformance(componentName: string) {
  const renderStart = useRef<number>()
  const renderCount = useRef(0)

  useEffect(() => {
    renderStart.current = performance.now()
    renderCount.current++
  })

  useEffect(() => {
    if (renderStart.current) {
      const renderTime = performance.now() - renderStart.current
      
      // Log slow renders (>16ms for 60fps)
      if (renderTime > 16) {
        logger.warn('Slow render detected', {
          component: componentName,
          renderTime,
          renderCount: renderCount.current
        })
      }
    }
  })

  return {
    renderCount: renderCount.current,
    markRenderStart: () => {
      renderStart.current = performance.now()
    },
    measureRender: (label?: string) => {
      if (renderStart.current) {
        const renderTime = performance.now() - renderStart.current
        logger.info('Render time', {
          component: componentName,
          label,
          renderTime
        })
        return renderTime
      }
      return 0
    }
  }
}

// Memory usage monitoring
export function useMemoryMonitoring() {
  const checkMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryInfo = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }

      // Warn if memory usage is high
      if (memoryInfo.usagePercentage > 80) {
        logger.warn('High memory usage detected', memoryInfo)
      }

      return memoryInfo
    }
    return null
  }, [])

  useEffect(() => {
    // Check memory usage every 30 seconds
    const interval = setInterval(checkMemory, 30000)
    return () => clearInterval(interval)
  }, [checkMemory])

  return { checkMemory }
}

// Network performance monitoring
export function useNetworkPerformance() {
  const measureNetworkSpeed = useCallback(async () => {
    // Type guard for navigator.connection (not standard API)
    const connection = (navigator as any).connection;
    if (!connection) return null

    const networkInfo = {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }

    logger.info('Network info', networkInfo)
    return networkInfo
  }, [])

  useEffect(() => {
    measureNetworkSpeed()

    // Listen for network changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', measureNetworkSpeed)
      return () => {
        connection?.removeEventListener('change', measureNetworkSpeed)
      }
    }
  }, [measureNetworkSpeed])

  return { measureNetworkSpeed }
}

// API call performance tracking
export function useAPIPerformance() {
  const trackAPICall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const start = performance.now()
    
    try {
      const result = await apiCall()
      const duration = performance.now() - start
      
      logger.info('API call completed', {
        endpoint,
        duration,
        success: true
      })
      
      // Warn on slow API calls
      if (duration > 3000) {
        logger.warn('Slow API call detected', {
          endpoint,
          duration
        })
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      
      logger.error('API call failed', {
        endpoint,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }, [])

  return { trackAPICall }
}

// Resource loading performance
export function useResourcePerformance() {
  useEffect(() => {
    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming
          
          // Log slow resource loads
          if (resource.duration > 1000) {
            logger.warn('Slow resource load', {
              name: resource.name,
              duration: resource.duration,
              transferSize: resource.transferSize,
              type: resource.initiatorType
            })
          }
        }
      }
    })

    observer.observe({ entryTypes: ['resource'] })
    
    return () => observer.disconnect()
  }, [])
}

// Bundle size tracking
export function useBundleAnalysis() {
  useEffect(() => {
    // Track chunk loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('chunk') || entry.name.includes('bundle')) {
          logger.info('Chunk loaded', {
            name: entry.name,
            duration: entry.duration,
            size: (entry as any).transferSize
          })
        }
      }
    })

    observer.observe({ entryTypes: ['resource'] })
    
    return () => observer.disconnect()
  }, [])
}

// Combined performance monitoring hook
export function usePerformanceMonitoring(componentName?: string) {
  useWebVitals()
  useMemoryMonitoring()
  useNetworkPerformance()
  useResourcePerformance()
  
  const renderPerf = componentName ? useRenderPerformance(componentName) : null
  const { trackAPICall } = useAPIPerformance()

  return {
    renderPerf,
    trackAPICall
  }
}