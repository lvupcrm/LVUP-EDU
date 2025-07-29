'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface CourseSettingsProps {
  course: any
}

export default function CourseSettings({ course }: CourseSettingsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: course.title,
    subtitle: course.subtitle || '',
    description: course.description || '',
    price: course.price,
    original_price: course.original_price || course.price,
    status: course.status,
    max_students: course.max_students || 0,
    certificate_enabled: course.certificate_enabled || false,
    is_public: course.is_public ?? true,
    allow_preview: course.allow_preview ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: form.title,
          subtitle: form.subtitle,
          description: form.description,
          price: form.price,
          original_price: form.original_price,
          status: form.status,
          max_students: form.max_students || null,
          certificate_enabled: form.certificate_enabled,
          is_public: form.is_public,
          allow_preview: form.allow_preview,
          updated_at: new Date().toISOString()
        })
        .eq('id', course.id)

      if (error) throw error

      setSuccess(true)
      router.refresh()
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating course:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          강의 설정이 저장되었습니다.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          강의 상태
        </label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="input"
        >
          <option value="DRAFT">비공개 (초안)</option>
          <option value="PUBLISHED">공개</option>
          <option value="ARCHIVED">보관됨</option>
        </select>
        <p className="text-sm text-gray-500 mt-1">
          공개로 설정하면 학생들이 강의를 볼 수 있습니다
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          강의 제목 *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input"
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
          placeholder="강의를 한 줄로 설명해주세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          강의 소개
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input min-h-[200px]"
          placeholder="강의에 대한 자세한 설명을 작성해주세요"
        />
      </div>

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
          placeholder="0 입력 시 무제한"
        />
        <p className="text-sm text-gray-500 mt-1">
          현재 수강생: {course.enrollment_count || 0}명
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={form.certificate_enabled}
            onChange={(e) => setForm({ ...form, certificate_enabled: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
          />
          <span className="text-sm font-medium text-gray-700">
            수료증 발급 가능
          </span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
          />
          <span className="text-sm font-medium text-gray-700">
            강의 목록에 표시
          </span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={form.allow_preview}
            onChange={(e) => setForm({ ...form, allow_preview: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
          />
          <span className="text-sm font-medium text-gray-700">
            미리보기 허용
          </span>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? '저장 중...' : '설정 저장'}
        </button>
      </div>
    </form>
  )
}