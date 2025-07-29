/**
 * Virtualized List Component
 * - Renders only visible items
 * - Smooth scrolling
 * - Dynamic item heights
 * - Memory efficient for large datasets
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number | ((index: number) => number)
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number // Number of items to render outside of visible area
  onScroll?: (scrollTop: number) => void
}

export default function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5,
  onScroll
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const getItemHeight = useCallback(
    (index: number): number => {
      return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight
    },
    [itemHeight]
  )

  // Calculate total height
  const totalHeight = items.reduce((acc, _, index) => acc + getItemHeight(index), 0)

  // Calculate visible range
  const getVisibleRange = useCallback(() => {
    let start = 0
    let startOffset = 0
    
    // Find start index
    while (start < items.length && startOffset + getItemHeight(start) < scrollTop) {
      startOffset += getItemHeight(start)
      start++
    }
    
    // Find end index
    let end = start
    let endOffset = startOffset
    
    while (end < items.length && endOffset < scrollTop + containerHeight) {
      endOffset += getItemHeight(end)
      end++
    }

    // Apply overscan
    const overscanStart = Math.max(0, start - overscan)
    const overscanEnd = Math.min(items.length, end + overscan)

    return {
      start: overscanStart,
      end: overscanEnd,
      offsetY: startOffset - (start - overscanStart) * getItemHeight(overscanStart)
    }
  }, [scrollTop, containerHeight, items.length, getItemHeight, overscan])

  const { start, end, offsetY } = getVisibleRange()

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop
      setScrollTop(newScrollTop)
      onScroll?.(newScrollTop)
    },
    [onScroll]
  )

  // Render visible items
  const visibleItems = []
  for (let i = start; i < end; i++) {
    if (i < items.length) {
      visibleItems.push(
        <div
          key={i}
          style={{
            height: getItemHeight(i),
            position: 'relative'
          }}
        >
          {renderItem(items[i], i)}
        </div>
      )
    }
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'relative'
          }}
        >
          {visibleItems}
        </div>
      </div>
    </div>
  )
}

// Hook for easy usage with dynamic data
export function useVirtualizedList<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number | ((index: number) => number) = 50
) {
  const [visibleItems, setVisibleItems] = useState<T[]>([])
  const [scrollTop, setScrollTop] = useState(0)

  const handleScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop)
  }, [])

  return {
    VirtualizedList: (props: Omit<VirtualizedListProps<T>, 'items' | 'containerHeight' | 'itemHeight' | 'onScroll'>) => (
      <VirtualizedList
        items={items}
        containerHeight={containerHeight}
        itemHeight={itemHeight}
        onScroll={handleScroll}
        {...props}
      />
    ),
    scrollTop,
    visibleItemCount: Math.ceil(containerHeight / (typeof itemHeight === 'number' ? itemHeight : 50))
  }
}