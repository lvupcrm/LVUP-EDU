'use client'

interface CertificateViewProps {
  certificate: {
    id: string
    certificate_number: string
    issued_at: string
    user: {
      name: string
    }
    course: {
      title: string
      instructor: {
        user: {
          name: string
        }
      }
    }
    enrollment: {
      started_at: string
      completed_at: string
      progress: number
    }
  }
}

export default function CertificateView({ certificate }: CertificateViewProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateDuration = () => {
    const start = new Date(certificate.enrollment.started_at)
    const end = new Date(certificate.enrollment.completed_at || certificate.issued_at)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="certificate-container">
      {/* 수료증 디자인 */}
      <div className="p-12 text-center bg-gradient-to-b from-white to-gray-50">
        {/* 로고/타이틀 */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-primary-600 mb-2">LVUP EDU</h1>
          <p className="text-xl text-gray-600">온라인 교육 플랫폼</p>
        </div>

        {/* 수료증 제목 */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">수료증</h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto"></div>
        </div>

        {/* 수료 내용 */}
        <div className="max-w-2xl mx-auto space-y-6 mb-12">
          <p className="text-lg text-gray-700">
            이 수료증은
          </p>
          
          <p className="text-3xl font-bold text-gray-900">
            {certificate.user.name}
          </p>
          
          <p className="text-lg text-gray-700">
            님이 아래 과정을 성공적으로 수료하였음을 증명합니다.
          </p>

          <div className="py-6">
            <p className="text-2xl font-bold text-primary-600 mb-2">
              {certificate.course.title}
            </p>
            <p className="text-gray-600">
              강사: {certificate.course.instructor.user.name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-left max-w-md mx-auto">
            <div>
              <p className="text-sm text-gray-600 mb-1">수강 시작일</p>
              <p className="font-medium text-gray-900">
                {formatDate(certificate.enrollment.started_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">수료일</p>
              <p className="font-medium text-gray-900">
                {formatDate(certificate.enrollment.completed_at || certificate.issued_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">수강 기간</p>
              <p className="font-medium text-gray-900">
                {calculateDuration()}일
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">진도율</p>
              <p className="font-medium text-gray-900">
                {certificate.enrollment.progress}%
              </p>
            </div>
          </div>
        </div>

        {/* 발급 정보 */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="text-left">
              <p className="text-sm text-gray-600">발급일</p>
              <p className="font-medium text-gray-900">
                {formatDate(certificate.issued_at)}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 border-2 border-gray-300 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-400 text-sm">도장</span>
              </div>
              <p className="text-sm text-gray-600">LVUP EDU</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">수료증 번호</p>
              <p className="font-medium text-gray-900">
                {certificate.certificate_number}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 장식 테두리 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-4 border-4 border-primary-100 rounded-lg"></div>
        <div className="absolute inset-6 border-2 border-primary-50 rounded-lg"></div>
      </div>

      <style jsx>{`
        .certificate-container {
          position: relative;
          background: white;
          min-height: 800px;
        }
        
        @media print {
          .certificate-container {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}