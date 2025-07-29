'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  QuestionMarkCircleIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline'

interface PageProps {
  params: {
    id: string
  }
}

export default function NewQuestionPage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [form, setForm] = useState({
    title: '',
    content: '',
    lesson_id: '',
    is_private: false
  })

  useEffect(() => {
    fetchCourseData()
  }, [params.id])

  const fetchCourseData = async () => {
    // 코스 정보 가져오기
    const { data: courseData } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', params.id)
      .single()

    if (courseData) {
      setCourse(courseData)
    }

    // 레슨 목록 가져오기
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('id, title, order_num')
      .eq('course_id', params.id)
      .order('order_num')

    if (lessonsData) {
      setLessons(lessonsData)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim() || !form.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('로그인이 필요합니다.')
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('questions')
        .insert({
          course_id: params.id,
          user_id: user.id,
          lesson_id: form.lesson_id || null,
          title: form.title,
          content: form.content,
          is_private: form.is_private
        })
        .select()
        .single()

      if (error) throw error

      // 질문 상세 페이지로 이동
      router.push(`/courses/${params.id}/qa/${data.id}`)
    } catch (error) {
      console.error('Error creating question:', error)
      alert('질문 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <Link
              href={`/courses/${params.id}/qa`}
              className="text-gray-600 hover:text-gray-900 text-sm mb-4 inline-block"
            >
              ← Q&A로 돌아가기
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900">새 질문하기</h1>
            {course && (
              <p className="text-gray-600 mt-2">{course.title}</p>
            )}
          </div>

          {/* 안내 사항 */}
          <div className="bg-primary-50 rounded-lg p-4 mb-8">
            <div className="flex">
              <QuestionMarkCircleIcon className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-primary-800">
                <p className="font-medium mb-1">질문하기 전에 확인해주세요</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>비슷한 질문이 이미 있는지 검색해보세요</li>
                  <li>구체적이고 명확한 제목을 작성해주세요</li>
                  <li>문제 상황을 자세히 설명해주세요</li>
                  <li>개인정보나 민감한 정보는 포함하지 마세요</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow-soft p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관련 레슨 (선택사항)
                </label>
                <select
                  value={form.lesson_id}
                  onChange={(e) => setForm({ ...form, lesson_id: e.target.value })}
                  className="input"
                >
                  <option value="">전체 강의 관련</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.order_num}. {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  질문 제목 *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                  placeholder="예: 3번 레슨의 실습 코드가 작동하지 않습니다"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  질문 내용 *
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="input min-h-[300px]"
                  placeholder="질문 내용을 자세히 작성해주세요.

예시:
- 어떤 문제가 발생했나요?
- 어떤 시도를 해보셨나요?
- 오류 메시지가 있다면 함께 공유해주세요.
- 스크린샷이 필요한 경우 이미지 URL을 포함해주세요."
                  required
                />
              </div>

              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_private}
                    onChange={(e) => setForm({ ...form, is_private: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    {form.is_private ? (
                      <>
                        <LockClosedIcon className="h-4 w-4 mr-1" />
                        비공개 질문 (강사만 볼 수 있습니다)
                      </>
                    ) : (
                      <>
                        <LockOpenIcon className="h-4 w-4 mr-1" />
                        공개 질문 (모든 수강생이 볼 수 있습니다)
                      </>
                    )}
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  개인적인 내용이 포함된 경우 비공개로 설정하세요
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Link
                href={`/courses/${params.id}/qa`}
                className="btn-outline"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? '등록 중...' : '질문 등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}