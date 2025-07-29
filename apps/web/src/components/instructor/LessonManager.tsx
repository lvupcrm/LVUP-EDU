'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  PlusIcon,
  PlayCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

interface Lesson {
  id: string
  title: string
  order_num: number
  duration?: number
  is_preview?: boolean
  is_published?: boolean
}

interface LessonManagerProps {
  courseId: string
  lessons: Lesson[]
}

export default function LessonManager({ courseId, lessons: initialLessons }: LessonManagerProps) {
  const router = useRouter()
  const [lessons, setLessons] = useState(initialLessons)
  const [loading, setLoading] = useState(false)
  const [showNewLessonForm, setShowNewLessonForm] = useState(false)
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    duration: 0
  })

  const handleCreateLesson = async () => {
    if (!newLesson.title.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          course_id: courseId,
          title: newLesson.title,
          description: newLesson.description,
          duration: newLesson.duration || null,
          order_num: lessons.length + 1,
          is_published: false
        })
        .select()
        .single()

      if (error) throw error

      setLessons([...lessons, data])
      setNewLesson({ title: '', description: '', duration: 0 })
      setShowNewLessonForm(false)
      router.refresh()
    } catch (error) {
      console.error('Error creating lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (lessonId: string, currentStatus: boolean) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_published: !currentStatus })
        .eq('id', lessonId)

      if (error) throw error

      setLessons(lessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, is_published: !currentStatus }
          : lesson
      ))
      router.refresh()
    } catch (error) {
      console.error('Error updating lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePreview = async (lessonId: string, currentStatus: boolean) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_preview: !currentStatus })
        .eq('id', lessonId)

      if (error) throw error

      setLessons(lessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, is_preview: !currentStatus }
          : lesson
      ))
      router.refresh()
    } catch (error) {
      console.error('Error updating lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (lessonId: string, direction: 'up' | 'down') => {
    const index = lessons.findIndex(l => l.id === lessonId)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === lessons.length - 1)
    ) {
      return
    }

    const newLessons = [...lessons]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    // Swap order numbers
    const tempOrder = newLessons[index].order_num
    newLessons[index].order_num = newLessons[targetIndex].order_num
    newLessons[targetIndex].order_num = tempOrder
    
    // Swap positions in array
    ;[newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]]
    
    setLessons(newLessons)

    // Update in database
    try {
      await Promise.all([
        supabase
          .from('lessons')
          .update({ order_num: newLessons[index].order_num })
          .eq('id', newLessons[index].id),
        supabase
          .from('lessons')
          .update({ order_num: newLessons[targetIndex].order_num })
          .eq('id', newLessons[targetIndex].id)
      ])
      router.refresh()
    } catch (error) {
      console.error('Error reordering lessons:', error)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('정말 이 레슨을 삭제하시겠습니까?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId)

      if (error) throw error

      setLessons(lessons.filter(l => l.id !== lessonId))
      router.refresh()
    } catch (error) {
      console.error('Error deleting lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">레슨 관리</h2>
        <button
          onClick={() => setShowNewLessonForm(true)}
          className="btn-primary text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          새 레슨 추가
        </button>
      </div>

      {/* 새 레슨 추가 폼 */}
      {showNewLessonForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">새 레슨 만들기</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                레슨 제목 *
              </label>
              <input
                type="text"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                className="input"
                placeholder="예: 오리엔테이션"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                className="input"
                rows={2}
                placeholder="레슨에 대한 간단한 설명"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                예상 시간 (분)
              </label>
              <input
                type="number"
                value={newLesson.duration}
                onChange={(e) => setNewLesson({ ...newLesson, duration: parseInt(e.target.value) || 0 })}
                className="input"
                placeholder="30"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNewLessonForm(false)
                  setNewLesson({ title: '', description: '', duration: 0 })
                }}
                className="btn-outline text-sm"
              >
                취소
              </button>
              <button
                onClick={handleCreateLesson}
                disabled={loading || !newLesson.title.trim()}
                className="btn-primary text-sm"
              >
                레슨 생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 레슨 목록 */}
      {lessons.length > 0 ? (
        <div className="space-y-3">
          {lessons.sort((a, b) => a.order_num - b.order_num).map((lesson, index) => (
            <div
              key={lesson.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* 순서 변경 버튼 */}
                  <div className="flex flex-col">
                    <button
                      onClick={() => handleReorder(lesson.id, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium text-gray-500 text-center">
                      {lesson.order_num}
                    </span>
                    <button
                      onClick={() => handleReorder(lesson.id, 'down')}
                      disabled={index === lessons.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* 레슨 정보 */}
                  <div>
                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                    <div className="flex items-center mt-1 text-sm text-gray-500 space-x-4">
                      {lesson.duration && (
                        <span className="flex items-center">
                          <PlayCircleIcon className="h-4 w-4 mr-1" />
                          {lesson.duration}분
                        </span>
                      )}
                      {lesson.is_preview && (
                        <span className="text-primary-600">미리보기 가능</span>
                      )}
                      <span className={lesson.is_published ? 'text-green-600' : 'text-gray-400'}>
                        {lesson.is_published ? '공개됨' : '비공개'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTogglePreview(lesson.id, lesson.is_preview || false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title={lesson.is_preview ? '미리보기 비활성화' : '미리보기 활성화'}
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleTogglePublish(lesson.id, lesson.is_published || false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title={lesson.is_published ? '비공개로 전환' : '공개로 전환'}
                  >
                    {lesson.is_published ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => router.push(`/instructor/lessons/${lesson.id}/edit`)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="편집"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="p-2 text-red-400 hover:text-red-600"
                    title="삭제"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <PlayCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">아직 레슨이 없습니다</p>
          <button
            onClick={() => setShowNewLessonForm(true)}
            className="btn-primary"
          >
            첫 레슨 만들기
          </button>
        </div>
      )}
    </div>
  )
}