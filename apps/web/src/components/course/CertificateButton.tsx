'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { AcademicCapIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface CertificateButtonProps {
  courseId: string
  enrollmentId?: string
  enrollmentProgress?: number
  enrollmentStatus?: string
  existingCertificate?: {
    id: string
    certificate_number: string
  }
}

export default function CertificateButton({
  courseId,
  enrollmentId,
  enrollmentProgress = 0,
  enrollmentStatus,
  existingCertificate
}: CertificateButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleIssueCertificate = async () => {
    if (!enrollmentId) return

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // 수료증 발급 API 호출 (서버 액션 또는 API 라우트로 구현 필요)
      const response = await fetch('/api/certificates/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId,
          userId: user.id,
          courseId
        })
      })

      if (!response.ok) {
        throw new Error('수료증 발급 실패')
      }

      const { certificateId } = await response.json()
      
      // 발급된 수료증 페이지로 이동
      router.push(`/certificates/${certificateId}`)
    } catch (error) {
      console.error('Error issuing certificate:', error)
      alert('수료증 발급 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 이미 수료증이 있는 경우
  if (existingCertificate) {
    return (
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">
              수료증 발급 완료
            </p>
            <p className="text-sm text-green-700 mt-1">
              수료증 번호: {existingCertificate.certificate_number}
            </p>
            <Link
              href={`/certificates/${existingCertificate.id}`}
              className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 mt-2"
            >
              수료증 보기 →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 수료 조건 미달
  if (!enrollmentId || (enrollmentProgress < 100 && enrollmentStatus !== 'COMPLETED')) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start">
          <AcademicCapIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              수료증 발급 조건
            </p>
            <p className="text-sm text-gray-600 mt-1">
              코스를 100% 완료하면 수료증을 발급받을 수 있습니다.
            </p>
            <div className="mt-2">
              <div className="flex items-center text-sm">
                <span className="text-gray-600">현재 진도:</span>
                <span className="font-medium text-gray-900 ml-1">
                  {enrollmentProgress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${enrollmentProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 수료증 발급 가능
  return (
    <div className="bg-primary-50 rounded-lg p-4">
      <div className="flex items-start">
        <AcademicCapIcon className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
        <div className="flex-1">
          <p className="text-sm font-medium text-primary-900">
            수료증 발급 가능
          </p>
          <p className="text-sm text-primary-700 mt-1">
            축하합니다! 코스를 완료하셨습니다.
          </p>
          <button
            onClick={handleIssueCertificate}
            disabled={loading}
            className="btn-primary mt-3"
          >
            {loading ? '발급 중...' : '수료증 발급받기'}
          </button>
        </div>
      </div>
    </div>
  )
}