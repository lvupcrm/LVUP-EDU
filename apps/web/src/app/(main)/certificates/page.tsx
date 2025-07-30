import { getSupabaseClientSafe, fetchUserCertificates } from '@/lib/supabase-helpers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AcademicCapIcon, ArrowDownTrayIcon as DocumentDownloadIcon } from '@heroicons/react/24/outline'

export default async function CertificatesPage() {
  try {
    const supabase = getSupabaseClientSafe()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/auth/login')
    }

    // 사용자의 수료증 목록 가져오기
    const certificates = await fetchUserCertificates(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">내 수료증</h1>
            <p className="text-gray-600 mt-2">
              완료한 코스의 수료증을 확인하고 다운로드할 수 있습니다
            </p>
          </div>

          {/* 수료증 목록 */}
          {certificates && certificates.length > 0 ? (
            <div className="grid gap-6">
              {certificates.map((certificate: any) => (
                <div
                  key={certificate.id}
                  className="bg-white rounded-xl shadow-soft overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-6">
                      {/* 코스 썸네일 */}
                      <div className="flex-shrink-0">
                        {certificate.course?.thumbnail ? (
                          <img
                            src={certificate.course.thumbnail}
                            alt={certificate.course?.title || '코스'}
                            className="w-32 h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            <AcademicCapIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* 수료증 정보 */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {certificate.course?.title || '알 수 없는 코스'}
                        </h3>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>수료증 번호: <span className="font-medium text-gray-900">{certificate.certificate_number || 'N/A'}</span></p>
                          <p>발급일: {certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString('ko-KR') : 'N/A'}</p>
                          {certificate.enrollment?.completed_at && (
                            <p>수료일: {new Date(certificate.enrollment.completed_at).toLocaleDateString('ko-KR')}</p>
                          )}
                          <p>진도율: {certificate.enrollment?.progress || 0}%</p>
                        </div>

                        <div className="flex gap-3 mt-4">
                          <Link
                            href={`/certificates/${certificate.id}`}
                            className="btn-primary"
                          >
                            수료증 보기
                          </Link>
                          
                          {certificate.pdf_url && (
                            <a
                              href={certificate.pdf_url}
                              download
                              className="btn-outline"
                            >
                              <DocumentDownloadIcon className="h-5 w-5 mr-2" />
                              PDF 다운로드
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-soft p-12 text-center">
              <AcademicCapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                아직 발급받은 수료증이 없습니다
              </h3>
              <p className="text-gray-600 mb-6">
                코스를 100% 완료하면 수료증을 발급받을 수 있습니다
              </p>
              <Link href="/courses" className="btn-primary">
                코스 둘러보기
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
  } catch (error) {
    console.error('Error loading certificates page:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            오류가 발생했습니다
          </h1>
          <p className="text-gray-600 mb-6">
            수료증을 불러오는 중 문제가 발생했습니다.
          </p>
          <Link href="/" className="btn-primary">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }
}