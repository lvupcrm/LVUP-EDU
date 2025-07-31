'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { getSupabaseClient } from '@/lib/supabase';

export default function CertificatesPage() {
  const [user, setUser] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCertificates() {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setError('인증 서비스에 연결할 수 없습니다.');
          setLoading(false);
          return;
        }

        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          window.location.href = '/auth/login';
          return;
        }

        setUser(currentUser);

        // certificates 테이블이 존재한다면 가져오기 시도
        try {
          const { data: certificatesData, error: certificatesError } = await supabase
            .from('certificates')
            .select(`
              id,
              certificate_number,
              issued_at,
              course_id
            `)
            .eq('user_id', currentUser.id);

          if (certificatesError) {
            console.log('Certificates table not found or accessible:', certificatesError.message);
            setCertificates([]);
          } else {
            setCertificates(certificatesData || []);
          }
        } catch (err) {
          console.log('Error accessing certificates:', err);
          setCertificates([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading certificates:', err);
        setError('수료증을 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }

    loadCertificates();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">수료증을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="btn-primary">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

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
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="bg-white rounded-xl shadow-soft overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-6">
                      {/* 수료증 아이콘 */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                          <AcademicCapIcon className="h-12 w-12 text-primary-600" />
                        </div>
                      </div>

                      {/* 수료증 정보 */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          수료증 #{certificate.certificate_number || certificate.id}
                        </h3>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>발급일: {certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString('ko-KR') : 'N/A'}</p>
                        </div>

                        <div className="flex gap-3 mt-4">
                          <Link
                            href={`/certificates/${certificate.id}`}
                            className="btn-primary"
                          >
                            수료증 보기
                          </Link>
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
  );
}