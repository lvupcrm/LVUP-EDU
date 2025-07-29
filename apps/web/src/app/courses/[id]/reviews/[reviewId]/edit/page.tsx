'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

interface PageProps {
  params: {
    id: string
    reviewId: string
  }
}

export default function EditReviewPage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [review, setReview] = useState<any>(null)
  
  const [form, setForm] = useState({
    rating: 0,
    title: '',
    content: '',
    would_recommend: true,
    difficulty_rating: 3
  })

  const [hoveredRating, setHoveredRating] = useState(0)

  useEffect(() => {
    loadReview()
  }, [params.id, params.reviewId])

  const loadReview = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    // 리뷰 정보 가져오기
    const { data: reviewData } = await supabase
      .from('reviews')
      .select(`
        *,
        course:courses(id, title)
      `)
      .eq('id', params.reviewId)
      .eq('user_id', user.id)
      .single()

    if (!reviewData) {
      alert('리뷰를 찾을 수 없습니다.')
      router.push(`/courses/${params.id}/reviews`)
      return
    }

    setReview(reviewData)
    setCourse(reviewData.course)
    
    // 폼에 기존 데이터 설정
    setForm({
      rating: reviewData.rating,
      title: reviewData.title || '',
      content: reviewData.content,
      would_recommend: reviewData.would_recommend,
      difficulty_rating: reviewData.difficulty_rating || 3
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (form.rating === 0) {
      alert('평점을 선택해주세요.')
      return
    }

    if (!form.content.trim()) {
      alert('리뷰 내용을 작성해주세요.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          rating: form.rating,
          title: form.title || null,
          content: form.content,
          would_recommend: form.would_recommend,
          difficulty_rating: form.difficulty_rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.reviewId)

      if (error) throw error

      router.push(`/courses/${params.id}/reviews`)
    } catch (error) {
      console.error('Error updating review:', error)
      alert('리뷰 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const renderStarRating = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hoveredRating || form.rating)
          return (
            <button
              key={star}
              type="button"
              onClick={() => setForm({ ...form, rating: star })}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              {filled ? (
                <StarIcon className="h-8 w-8 text-yellow-400" />
              ) : (
                <StarOutlineIcon className="h-8 w-8 text-gray-300" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  const difficultyOptions = [
    { value: 1, label: '매우 쉬움' },
    { value: 2, label: '쉬움' },
    { value: 3, label: '적당함' },
    { value: 4, label: '어려움' },
    { value: 5, label: '매우 어려움' }
  ]

  if (!course || !review) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <Link
              href={`/courses/${params.id}/reviews`}
              className="text-gray-600 hover:text-gray-900 text-sm mb-4 inline-block"
            >
              ← 수강평으로 돌아가기
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900">수강평 수정</h1>
            {course && (
              <p className="text-gray-600 mt-2">{course.title}</p>
            )}
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow-soft p-6 space-y-6">
              {/* 평점 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  평점 *
                </label>
                <div className="flex items-center space-x-4">
                  {renderStarRating()}
                  <span className="text-lg font-medium text-gray-900">
                    {form.rating > 0 ? `${form.rating}.0` : '평점을 선택하세요'}
                  </span>
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 (선택사항)
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                  placeholder="리뷰를 한 줄로 요약해주세요"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수강평 *
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="input min-h-[200px]"
                  placeholder="강의는 어떠셨나요? 좋았던 점이나 아쉬웠던 점을 자유롭게 작성해주세요."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  최소 20자 이상 작성해주세요. (현재 {form.content.length}자)
                </p>
              </div>

              {/* 추천 여부 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이 강의를 추천하시나요?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={form.would_recommend === true}
                      onChange={() => setForm({ ...form, would_recommend: true })}
                      className="text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">네, 추천해요</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={form.would_recommend === false}
                      onChange={() => setForm({ ...form, would_recommend: false })}
                      className="text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">아니요</span>
                  </label>
                </div>
              </div>

              {/* 난이도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  강의 난이도
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {difficultyOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`text-center py-2 px-3 border rounded-lg cursor-pointer transition-colors ${
                        form.difficulty_rating === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        value={option.value}
                        checked={form.difficulty_rating === option.value}
                        onChange={() => setForm({ ...form, difficulty_rating: option.value })}
                        className="sr-only"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 안내 사항 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  • 수강평은 다른 수강생들에게 도움이 됩니다. 진실되게 작성해주세요.<br />
                  • 욕설, 비방, 광고 등 부적절한 내용은 삭제될 수 있습니다.<br />
                  • 작성하신 수강평은 수정 가능하지만 삭제는 불가능합니다.
                </p>
              </div>

              {/* 작성 시간 정보 */}
              {review.created_at && (
                <div className="text-sm text-gray-500">
                  작성일: {new Date(review.created_at).toLocaleDateString('ko-KR')}
                  {review.updated_at && review.updated_at !== review.created_at && (
                    <span className="ml-2">
                      (수정됨: {new Date(review.updated_at).toLocaleDateString('ko-KR')})
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Link
                href={`/courses/${params.id}/reviews`}
                className="btn-outline"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading || form.rating === 0 || form.content.length < 20}
                className="btn-primary"
              >
                {loading ? '수정 중...' : '리뷰 수정'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}