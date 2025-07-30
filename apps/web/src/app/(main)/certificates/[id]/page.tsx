import { getSupabaseClientSafe, fetchCertificateById } from '@/lib/supabase-helpers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowDownTrayIcon as DocumentDownloadIcon, ShareIcon } from '@heroicons/react/24/outline'
import CertificateView from '@/components/certificate/CertificateView'

interface PageProps {
  params: {
    id: string
  }
}

export default async function CertificateDetailPage({ params }: PageProps) {
  try {
    // 수료증 정보 가져오기
    const certificate = await fetchCertificateById(params.id)

    if (!certificate) {
      notFound()
    }

    // 현재 사용자 확인 (수료증 소유자인지)
    const supabase = getSupabaseClientSafe()
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = user?.id === (certificate as any)?.user_id

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            {isOwner && (
              <Link
                href="/certificates"
                className="text-gray-600 hover:text-gray-900 text-sm mb-4 inline-block"
              >
                ← 내 수료증 목록으로
              </Link>
            )}
            
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">수료증</h1>
              
              <div className="flex gap-3">
                {(certificate as any).pdf_url && (
                  <a
                    href={(certificate as any).pdf_url}
                    download
                    className="btn-outline"
                  >
                    <DocumentDownloadIcon className="h-5 w-5 mr-2" />
                    PDF 다운로드
                  </a>
                )}
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    alert('수료증 링크가 복사되었습니다.')
                  }}
                  className="btn-outline"
                >
                  <ShareIcon className="h-5 w-5 mr-2" />
                  공유
                </button>
              </div>
            </div>
          </div>

          {/* 수료증 본문 */}
          <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <CertificateView certificate={certificate as any} />
          </div>

          {/* 검증 정보 */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              수료증 검증
            </h3>
            <p className="text-sm text-blue-700">
              이 수료증은 LVUP EDU에서 발급한 정식 수료증입니다.<br />
              수료증 번호: <span className="font-medium">{(certificate as any).certificate_number || 'N/A'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
  } catch (error) {
    console.error('Error loading certificate page:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            오류가 발생했습니다
          </h1>
          <p className="text-gray-600 mb-6">
            수료증을 불러오는 중 문제가 발생했습니다.
          </p>
          <Link href="/certificates" className="btn-primary">
            수료증 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }
}