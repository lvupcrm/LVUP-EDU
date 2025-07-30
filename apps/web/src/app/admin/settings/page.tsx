import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import {
  CogIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CreditCardIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

export default async function AdminSettingsPage() {
  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    redirect('/');
  }

  const settings = [
    {
      id: 'general',
      title: '일반 설정',
      icon: CogIcon,
      color: 'bg-gray-100 text-gray-600',
      settings: [
        {
          key: 'platform_name',
          label: '플랫폼 이름',
          value: 'LVUP EDU',
          type: 'text',
        },
        {
          key: 'platform_description',
          label: '플랫폼 설명',
          value: '피트니스 전문가 교육 플랫폼',
          type: 'textarea',
        },
        {
          key: 'support_email',
          label: '고객지원 이메일',
          value: 'support@lvupedu.com',
          type: 'email',
        },
        {
          key: 'maintenance_mode',
          label: '유지보수 모드',
          value: false,
          type: 'boolean',
        },
      ],
    },
    {
      id: 'payment',
      title: '결제 설정',
      icon: CurrencyDollarIcon,
      color: 'bg-green-100 text-green-600',
      settings: [
        {
          key: 'platform_fee',
          label: '플랫폼 수수료 (%)',
          value: '20',
          type: 'number',
        },
        {
          key: 'min_payout',
          label: '최소 정산 금액 (원)',
          value: '10000',
          type: 'number',
        },
        {
          key: 'payout_schedule',
          label: '정산 주기',
          value: 'monthly',
          type: 'select',
          options: ['weekly', 'monthly', 'quarterly'],
        },
        {
          key: 'payment_methods',
          label: '결제 수단',
          value: 'card,bank,kakao',
          type: 'text',
        },
      ],
    },
    {
      id: 'email',
      title: '이메일 설정',
      icon: EnvelopeIcon,
      color: 'bg-blue-100 text-blue-600',
      settings: [
        {
          key: 'smtp_host',
          label: 'SMTP 호스트',
          value: 'smtp.gmail.com',
          type: 'text',
        },
        { key: 'smtp_port', label: 'SMTP 포트', value: '587', type: 'number' },
        {
          key: 'smtp_username',
          label: 'SMTP 사용자명',
          value: 'noreply@lvupedu.com',
          type: 'email',
        },
        {
          key: 'welcome_email',
          label: '환영 이메일 활성화',
          value: true,
          type: 'boolean',
        },
      ],
    },
    {
      id: 'notifications',
      title: '알림 설정',
      icon: BellIcon,
      color: 'bg-yellow-100 text-yellow-600',
      settings: [
        {
          key: 'new_user_notification',
          label: '신규 회원 알림',
          value: true,
          type: 'boolean',
        },
        {
          key: 'new_course_notification',
          label: '신규 강의 알림',
          value: true,
          type: 'boolean',
        },
        {
          key: 'payment_notification',
          label: '결제 알림',
          value: true,
          type: 'boolean',
        },
        {
          key: 'slack_webhook',
          label: 'Slack 웹훅 URL',
          value: '',
          type: 'url',
        },
      ],
    },
    {
      id: 'security',
      title: '보안 설정',
      icon: ShieldCheckIcon,
      color: 'bg-red-100 text-red-600',
      settings: [
        {
          key: 'password_min_length',
          label: '최소 비밀번호 길이',
          value: '8',
          type: 'number',
        },
        {
          key: 'require_2fa',
          label: '2단계 인증 필수',
          value: false,
          type: 'boolean',
        },
        {
          key: 'session_timeout',
          label: '세션 타임아웃 (분)',
          value: '1440',
          type: 'number',
        },
        {
          key: 'max_login_attempts',
          label: '최대 로그인 시도 횟수',
          value: '5',
          type: 'number',
        },
      ],
    },
    {
      id: 'content',
      title: '콘텐츠 설정',
      icon: DocumentTextIcon,
      color: 'bg-purple-100 text-purple-600',
      settings: [
        {
          key: 'max_video_size',
          label: '최대 동영상 크기 (MB)',
          value: '500',
          type: 'number',
        },
        {
          key: 'allowed_video_formats',
          label: '허용 동영상 포맷',
          value: 'mp4,avi,mov',
          type: 'text',
        },
        {
          key: 'auto_approval',
          label: '강의 자동 승인',
          value: false,
          type: 'boolean',
        },
        {
          key: 'content_moderation',
          label: '콘텐츠 검토 활성화',
          value: true,
          type: 'boolean',
        },
      ],
    },
  ];

  const renderSettingInput = (setting: any) => {
    const baseClasses =
      'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

    switch (setting.type) {
      case 'boolean':
        return (
          <label className='flex items-center'>
            <input
              type='checkbox'
              defaultChecked={setting.value}
              className='rounded border-gray-300 text-primary-600 focus:ring-primary-500'
            />
            <span className='ml-2 text-sm text-gray-600'>활성화</span>
          </label>
        );
      case 'select':
        return (
          <select defaultValue={setting.value} className={baseClasses}>
            {setting.options?.map((option: string) => (
              <option key={option} value={option}>
                {option === 'weekly'
                  ? '주간'
                  : option === 'monthly'
                    ? '월간'
                    : option === 'quarterly'
                      ? '분기별'
                      : option}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            defaultValue={setting.value}
            rows={3}
            className={baseClasses}
          />
        );
      case 'number':
        return (
          <input
            type='number'
            defaultValue={setting.value}
            className={baseClasses}
          />
        );
      case 'email':
        return (
          <input
            type='email'
            defaultValue={setting.value}
            className={baseClasses}
          />
        );
      case 'url':
        return (
          <input
            type='url'
            defaultValue={setting.value}
            placeholder='https://hooks.slack.com/...'
            className={baseClasses}
          />
        );
      default:
        return (
          <input
            type='text'
            defaultValue={setting.value}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        {/* 헤더 */}
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>시스템 설정</h1>
            <p className='text-gray-600 mt-2'>
              플랫폼의 전반적인 설정을 관리하세요
            </p>
          </div>
          <div className='flex space-x-3'>
            <button className='btn-outline'>초기화</button>
            <button className='btn-primary'>변경사항 저장</button>
          </div>
        </div>

        {/* 설정 섹션들 */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {settings.map(section => (
            <div
              key={section.id}
              className='bg-white rounded-xl shadow-soft p-6'
            >
              <div className='flex items-center mb-6'>
                <div className={`p-3 rounded-lg ${section.color}`}>
                  <section.icon className='h-6 w-6' />
                </div>
                <h2 className='text-xl font-bold text-gray-900 ml-4'>
                  {section.title}
                </h2>
              </div>

              <div className='space-y-6'>
                {section.settings.map(setting => (
                  <div key={setting.key}>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      {setting.label}
                    </label>
                    {renderSettingInput(setting)}
                    {setting.key === 'platform_fee' && (
                      <p className='text-xs text-gray-500 mt-1'>
                        강사에게 지급되는 금액에서 차감되는 수수료율
                      </p>
                    )}
                    {setting.key === 'max_video_size' && (
                      <p className='text-xs text-gray-500 mt-1'>
                        업로드 가능한 동영상 파일의 최대 크기
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* API 키 관리 */}
        <div className='mt-8 bg-white rounded-xl shadow-soft p-6'>
          <div className='flex items-center mb-6'>
            <div className='p-3 rounded-lg bg-primary-100 text-primary-600'>
              <KeyIcon className='h-6 w-6' />
            </div>
            <h2 className='text-xl font-bold text-gray-900 ml-4'>
              API 키 관리
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                외부 서비스 연동
              </h3>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Toss Payments 클라이언트 키
                </label>
                <div className='flex'>
                  <input
                    type='password'
                    defaultValue='test_ck_***************'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    readOnly
                  />
                  <button className='px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200'>
                    수정
                  </button>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Cloudflare Stream API 키
                </label>
                <div className='flex'>
                  <input
                    type='password'
                    defaultValue='********************'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    readOnly
                  />
                  <button className='px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200'>
                    수정
                  </button>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Google Analytics ID
                </label>
                <div className='flex'>
                  <input
                    type='text'
                    defaultValue='GA-XXXXXXXXX-X'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                  />
                  <button className='px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200'>
                    저장
                  </button>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                내부 API 키
              </h3>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  관리자 API 키
                </label>
                <div className='flex'>
                  <input
                    type='password'
                    defaultValue='lvup_admin_*********************'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    readOnly
                  />
                  <button className='px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200'>
                    재생성
                  </button>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  웹훅 비밀키
                </label>
                <div className='flex'>
                  <input
                    type='password'
                    defaultValue='whsec_*********************'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    readOnly
                  />
                  <button className='px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200'>
                    재생성
                  </button>
                </div>
              </div>

              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                <div className='flex'>
                  <div className='ml-3'>
                    <h3 className='text-sm font-medium text-yellow-800'>
                      주의사항
                    </h3>
                    <div className='mt-2 text-sm text-yellow-700'>
                      <ul className='list-disc list-inside space-y-1'>
                        <li>API 키는 안전한 곳에 보관하세요</li>
                        <li>정기적으로 키를 교체하는 것을 권장합니다</li>
                        <li>키가 노출되었다면 즉시 재생성하세요</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 시스템 상태 */}
        <div className='mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>시스템 상태</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <div className='w-6 h-6 bg-green-500 rounded-full'></div>
              </div>
              <h3 className='font-semibold text-gray-900'>데이터베이스</h3>
              <p className='text-sm text-gray-600'>정상 작동</p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <div className='w-6 h-6 bg-green-500 rounded-full'></div>
              </div>
              <h3 className='font-semibold text-gray-900'>스토리지</h3>
              <p className='text-sm text-gray-600'>정상 작동</p>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <div className='w-6 h-6 bg-green-500 rounded-full'></div>
              </div>
              <h3 className='font-semibold text-gray-900'>결제 시스템</h3>
              <p className='text-sm text-gray-600'>정상 작동</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
