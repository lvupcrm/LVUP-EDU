/**
 * Optimized Lazy Loading Image Component
 * - Intersection Observer API
 * - Progressive loading
 * - Blur placeholder
 * - Error handling
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { logger } from '@/lib/logger'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  quality?: number
  onLoad?: () => void
  onError?: () => void
}

export default function LazyImage({
  src,
  alt,
  width = 400,
  height = 225,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  quality = 75,
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="#9ca3af">Loading...</text>
    </svg>`
  ).toString('base64')}`

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, isInView])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    logger.warn('Image load error', { src, alt })
    onError?.()
  }

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {hasError ? (
        // Error state with fallback
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <svg 
            className="w-12 h-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      ) : (
        <>
          {/* Loading placeholder */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          )}
          
          {/* Actual image */}
          {(isInView || priority) && (
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              quality={quality}
              priority={priority}
              placeholder={placeholder}
              blurDataURL={blurDataURL || defaultBlurDataURL}
              className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%'
              }}
              onLoad={handleLoad}
              onError={handleError}
              loading={priority ? 'eager' : 'lazy'}
            />
          )}
        </>
      )}
    </div>
  )
}