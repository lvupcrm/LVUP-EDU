'use client'

import { useEffect, useRef, useState } from 'react'
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid'
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline'

interface VideoPlayerProps {
  videoUrl: string
  videoId?: string
  provider?: 'cloudflare' | 'youtube' | 'vimeo' | 'direct'
  thumbnail?: string
  onProgress?: (seconds: number, percentage: number) => void
  onComplete?: () => void
  initialPosition?: number
  autoPlay?: boolean
}

export function VideoPlayer({
  videoUrl,
  videoId,
  provider = 'direct',
  thumbnail,
  onProgress,
  onComplete,
  initialPosition = 0,
  autoPlay = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressInterval = useRef<NodeJS.Timeout>()
  const handlePlayRef = useRef<() => void>()
  const handlePauseRef = useRef<() => void>()
  const handleFullscreenChangeRef = useRef<() => void>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)

  // Create stable function references to prevent memory leaks
  useEffect(() => {
    handlePlayRef.current = () => setIsPlaying(true)
    handlePauseRef.current = () => setIsPlaying(false)
    handleFullscreenChangeRef.current = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // 초기 위치 설정
    if (initialPosition > 0) {
      video.currentTime = initialPosition
    }

    // 비디오 메타데이터 로드
    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    // 진도 추적
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      const percentage = (video.currentTime / video.duration) * 100
      
      if (onProgress && !isNaN(percentage)) {
        onProgress(Math.floor(video.currentTime), percentage)
      }

      // 90% 이상 시청 시 완료 처리
      if (percentage >= 90 && onComplete) {
        onComplete()
      }
    }

    // 버퍼링 상태 추적
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const bufferedPercentage = (bufferedEnd / video.duration) * 100
        setBuffered(bufferedPercentage)
      }
    }

    // Stable event handler functions
    const handlePlay = () => handlePlayRef.current?.()
    const handlePause = () => handlePauseRef.current?.()
    const handleFullscreenChange = () => handleFullscreenChangeRef.current?.()

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('progress', handleProgress)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    
    // Add fullscreen change listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      // Clean up all event listeners
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('progress', handleProgress)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      
      // Clean up fullscreen listeners
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
      
      // Clear any pending intervals
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [initialPosition, onProgress, onComplete])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = async () => {
    const container = document.getElementById('video-container')
    if (!container) return

    try {
      if (!isFullscreen) {
        if (container.requestFullscreen) {
          await container.requestFullscreen()
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen()
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
      }
      // State will be updated by the fullscreen change event listener
    } catch (error) {
      // Fallback for browsers that don't support fullscreen API
      if (process.env.NODE_ENV === 'development') {
        console.warn('Fullscreen API not supported:', error)
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (parseFloat(e.target.value) / 100) * duration
    video.currentTime = newTime
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Cloudflare Stream URL 생성
  const getVideoSource = () => {
    if (provider === 'cloudflare' && videoId) {
      const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
      if (!accountId) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Cloudflare Account ID not configured, falling back to direct URL')
        }
        return videoUrl
      }
      return `https://customer-${accountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8`
    }
    return videoUrl
  }

  return (
    <div id="video-container" className="relative bg-black rounded-lg overflow-hidden group">
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={thumbnail}
        autoPlay={autoPlay}
        playsInline
      >
        <source src={getVideoSource()} type={provider === 'cloudflare' ? 'application/x-mpegURL' : 'video/mp4'} />
        브라우저가 비디오 재생을 지원하지 않습니다.
      </video>

      {/* 컨트롤 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity opacity-0 group-hover:opacity-100">
        {/* 진행 바 */}
        <div className="mb-4">
          <div className="relative h-1 bg-gray-600 rounded-full overflow-hidden">
            {/* 버퍼링 표시 */}
            <div 
              className="absolute h-full bg-gray-500"
              style={{ width: `${buffered}%` }}
            />
            {/* 진행도 표시 */}
            <div 
              className="absolute h-full bg-primary-500"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100 || 0}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 재생/일시정지 */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary-400 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="h-8 w-8" />
              ) : (
                <PlayIcon className="h-8 w-8" />
              )}
            </button>

            {/* 음소거 */}
            <button
              onClick={toggleMute}
              className="text-white hover:text-primary-400 transition-colors"
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="h-6 w-6" />
              ) : (
                <SpeakerWaveIcon className="h-6 w-6" />
              )}
            </button>

            {/* 시간 표시 */}
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* 전체화면 */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-primary-400 transition-colors"
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="h-6 w-6" />
            ) : (
              <ArrowsPointingOutIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}