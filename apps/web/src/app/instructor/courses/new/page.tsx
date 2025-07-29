'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  AcademicCapIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  PlayCircleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface CourseForm {
  title: string
  subtitle: string
  description: string
  category_id: string
  level: string
  price: number
  original_price: number
  duration: number
  max_students: number
  language: string
  learning_goals: string[]
  requirements: string[]
  target_audience: string[]
  thumbnail: File | null
  preview_video: File | null
}

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  
  const [form, setForm] = useState<CourseForm>({
    title: '',
    subtitle: '',
    description: '',
    category_id: '',
    level: 'BEGINNER',
    price: 0,
    original_price: 0,
    duration: 0,
    max_students: 0,
    language: 'ko',
    learning_goals: [''],
    requirements: [''],
    target_audience: [''],
    thumbnail: null,
    preview_video: null
  })

  const [categories, setCategories] = useState<any[]>([])

  // 카테고리 목록 가져오기
  useState(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (data) {
        setCategories(data)
      }
    }
    fetchCategories()
  })

  const handleArrayInput = (field: 'learning_goals' | 'requirements' | 'target_audience', index: number, value: string) => {
    const newArray = [...form[field]]
    newArray[index] = value
    setForm({ ...form, [field]: newArray })
  }

  const addArrayInput = (field: 'learning_goals' | 'requirements' | 'target_audience') => {
    setForm({ ...form, [field]: [...form[field], ''] })
  }

  const removeArrayInput = (field: 'learning_goals' | 'requirements' | 'target_audience', index: number) => {
    const newArray = form[field].filter((_, i) => i !== index)
    setForm({ ...form, [field]: newArray })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step < 4) {
      setStep(step + 1)
      return
    }

    setLoading(true)
    setError('')

    try {
      // 현재 사용자 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      // 강사 프로필 확인
      const { data: instructorProfile } = await supabase
        .from('instructor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!instructorProfile) throw new Error('강사 권한이 없습니다')

      // 썸네일 업로드
      let thumbnailUrl = null
      if (form.thumbnail) {
        const fileExt = form.thumbnail.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('course-thumbnails')
          .upload(fileName, form.thumbnail)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('course-thumbnails')
          .getPublicUrl(fileName)

        thumbnailUrl = publicUrl
      }

      // 강의 생성
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: form.title,
          subtitle: form.subtitle,
          description: form.description,
          category_id: form.category_id,
          level: form.level,
          price: form.price,
          original_price: form.original_price || form.price,
          total_duration: form.duration,
          max_students: form.max_students || null,
          language: form.language,
          learning_goals: form.learning_goals.filter(g => g.trim()),
          requirements: form.requirements.filter(r => r.trim()),
          target_audience: form.target_audience.filter(t => t.trim()),
          thumbnail: thumbnailUrl,
          instructor_id: instructorProfile.id,
          status: 'DRAFT'
        })
        .select()
        .single()

      if (courseError) throw courseError

      // 성공 시 강의 편집 페이지로 이동
      router.push(`/instructor/courses/${course.id}/edit`)
    } catch (err: any) {
      console.error('Error creating course:', err)
      setError(err.message || '강의 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">기본 정보</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강의 제목 *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input"
                placeholder="예: 피트니스 트레이너를 위한 해부학 마스터"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                부제목
              </label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="input"
                placeholder="예: 근육과 뼈의 구조를 완벽하게 이해하는 12주 과정"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강의 소개 *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input min-h-[200px]"
                placeholder="강의에 대한 자세한 설명을 작성해주세요"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">선택하세요</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  난이도 *
                </label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="input"
                  required
                >
                  <option value="BEGINNER">초급</option>
                  <option value="INTERMEDIATE">중급</option>
                  <option value="ADVANCED">고급</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  언어
                </label>
                <select
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="input"
                >
                  <option value="ko">한국어</option>
                  <option value="en">영어</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  총 강의 시간 (분)
                </label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })}
                  className="input"
                  placeholder="예: 360"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">학습 정보</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학습 목표
              </label>
              <p className="text-sm text-gray-500 mb-3">
                이 강의를 통해 학생들이 배울 수 있는 내용을 구체적으로 작성해주세요
              </p>
              <div className="space-y-2">
                {form.learning_goals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => handleArrayInput('learning_goals', index, e.target.value)}
                      className="input flex-1"
                      placeholder="예: 인체의 주요 근육과 뼈의 명칭을 정확히 알 수 있다"
                    />
                    {form.learning_goals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayInput('learning_goals', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayInput('learning_goals')}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                학습 목표 추가
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수강 대상
              </label>
              <p className="text-sm text-gray-500 mb-3">
                이 강의가 도움이 될 수 있는 사람들을 설명해주세요
              </p>
              <div className="space-y-2">
                {form.target_audience.map((target, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={target}
                      onChange={(e) => handleArrayInput('target_audience', index, e.target.value)}
                      className="input flex-1"
                      placeholder="예: 피트니스 트레이너 자격증을 준비하는 수험생"
                    />
                    {form.target_audience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayInput('target_audience', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayInput('target_audience')}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                수강 대상 추가
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선수 지식
              </label>
              <p className="text-sm text-gray-500 mb-3">
                이 강의를 수강하기 전에 필요한 사전 지식이나 준비물
              </p>
              <div className="space-y-2">
                {form.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleArrayInput('requirements', index, e.target.value)}
                      className="input flex-1"
                      placeholder="예: 기초적인 생물학 지식"
                    />
                    {form.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayInput('requirements', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayInput('requirements')}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                선수 지식 추가
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">가격 설정</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  판매 가격 *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₩
                  </span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                    className="input pl-8"
                    placeholder="50000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정가 (할인 전 가격)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₩
                  </span>
                  <input
                    type="number"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: parseInt(e.target.value) || 0 })}
                    className="input pl-8"
                    placeholder="70000"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최대 수강 인원
              </label>
              <input
                type="number"
                value={form.max_students}
                onChange={(e) => setForm({ ...form, max_students: parseInt(e.target.value) || 0 })}
                className="input"
                placeholder="무제한인 경우 0 입력"
              />
              <p className="text-sm text-gray-500 mt-1">
                0으로 설정하면 수강 인원 제한이 없습니다
              </p>
            </div>

            <div className="bg-primary-50 rounded-lg p-4">
              <h3 className="font-medium text-primary-900 mb-2">가격 책정 팁</h3>
              <ul className="text-sm text-primary-700 space-y-1">
                <li>• 비슷한 강의의 가격을 참고하세요</li>
                <li>• 할인 가격을 설정하면 수강생 유치에 도움이 됩니다</li>
                <li>• 첫 강의는 낮은 가격으로 시작하는 것을 권장합니다</li>
              </ul>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">미디어 업로드</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강의 썸네일 *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="thumbnail-upload" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>파일 업로드</span>
                      <input
                        id="thumbnail-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setForm({ ...form, thumbnail: file })
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">또는 드래그 앤 드롭</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG 최대 10MB
                  </p>
                </div>
              </div>
              {form.thumbnail && (
                <p className="mt-2 text-sm text-gray-600">
                  선택된 파일: {form.thumbnail.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                미리보기 동영상
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <PlayCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="video-upload" className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>파일 업로드</span>
                      <input
                        id="video-upload"
                        type="file"
                        className="sr-only"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setForm({ ...form, preview_video: file })
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">또는 드래그 앤 드롭</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    MP4, MOV 최대 100MB
                  </p>
                </div>
              </div>
              {form.preview_video && (
                <p className="mt-2 text-sm text-gray-600">
                  선택된 파일: {form.preview_video.name}
                </p>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">새 강의 만들기</h1>
            <p className="text-gray-600 mt-2">단계별로 강의 정보를 입력해주세요</p>
          </div>

          {/* 진행 상태 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      step >= s
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        step > s ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">기본 정보</span>
              <span className="text-sm text-gray-600">학습 정보</span>
              <span className="text-sm text-gray-600">가격 설정</span>
              <span className="text-sm text-gray-600">미디어</span>
            </div>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {renderStep()}
            </div>

            {/* 버튼 */}
            <div className="flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn-outline"
                >
                  이전
                </button>
              )}
              {step === 1 && <div />}
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    생성 중...
                  </div>
                ) : step < 4 ? (
                  '다음'
                ) : (
                  '강의 생성'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}