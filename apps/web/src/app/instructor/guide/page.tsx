import { checkInstructorAuth } from '@/middleware/instructor';
import { redirect } from 'next/navigation';
import {
  BookOpenIcon,
  CameraIcon,
  MicrophoneIcon,
  ComputerDesktopIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default async function InstructorGuidePage() {
  const auth = await checkInstructorAuth();

  if (!auth.authorized) {
    redirect(auth.redirect!);
  }

  const guides = [
    {
      id: 'getting-started',
      title: '시작하기',
      icon: BookOpenIcon,
      color: 'bg-primary-100 text-primary-600',
      items: [
        '강사 프로필 완성하기',
        '첫 강의 기획하기',
        '강의 구조 설계하기',
        '가격 책정 전략',
      ],
    },
    {
      id: 'content-creation',
      title: '콘텐츠 제작',
      icon: CameraIcon,
      color: 'bg-green-100 text-green-600',
      items: [
        '효과적인 강의 구성',
        '동영상 촬영 팁',
        '편집 가이드라인',
        '자막 및 보조 자료',
      ],
    },
    {
      id: 'technical',
      title: '기술 가이드',
      icon: ComputerDesktopIcon,
      color: 'bg-blue-100 text-blue-600',
      items: [
        '녹화 장비 추천',
        '음향 설정 가이드',
        '화면 녹화 방법',
        '파일 업로드 및 관리',
      ],
    },
    {
      id: 'engagement',
      title: '수강생 참여',
      icon: UserGroupIcon,
      color: 'bg-fitness-100 text-fitness-600',
      items: [
        '효과적인 소통 방법',
        'Q&A 관리 팁',
        '피드백 활용하기',
        '커뮤니티 운영',
      ],
    },
  ];

  const bestPractices = [
    {
      title: '명확한 학습 목표 설정',
      description: '각 레슨마다 구체적이고 달성 가능한 학습 목표를 제시하세요.',
      icon: CheckCircleIcon,
      color: 'text-green-600',
    },
    {
      title: '짧고 집중된 레슨',
      description: '5-15분 단위의 짧은 레슨으로 나누어 집중도를 높이세요.',
      icon: CheckCircleIcon,
      color: 'text-green-600',
    },
    {
      title: '실습 중심 학습',
      description: '이론보다는 실제 적용 가능한 실습 위주로 구성하세요.',
      icon: CheckCircleIcon,
      color: 'text-green-600',
    },
    {
      title: '정기적인 업데이트',
      description: '트렌드 변화에 맞춰 콘텐츠를 지속적으로 업데이트하세요.',
      icon: CheckCircleIcon,
      color: 'text-green-600',
    },
  ];

  const commonMistakes = [
    {
      title: '너무 긴 동영상',
      description: '30분 이상의 긴 영상은 집중도를 떨어뜨립니다.',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
    },
    {
      title: '불명확한 음질',
      description: '음질이 나쁘면 아무리 좋은 내용도 전달되지 않습니다.',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
    },
    {
      title: '일방적인 설명',
      description: '수강생과의 상호작용 없이 일방적으로만 설명하지 마세요.',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
    },
    {
      title: '부실한 강의 소개',
      description: '강의 소개가 불충분하면 수강생 유치가 어렵습니다.',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
    },
  ];

  const faqs = [
    {
      question: '강의 가격은 어떻게 책정하나요?',
      answer:
        '유사한 주제의 다른 강의들을 참고하되, 본인의 전문성과 강의 품질을 고려하여 적정 가격을 설정하세요. 초기에는 프로모션 가격으로 시작하는 것도 좋습니다.',
    },
    {
      question: '동영상 편집은 어떤 프로그램을 사용하나요?',
      answer:
        '초보자는 iMovie, OpenShot 같은 무료 프로그램으로 시작하세요. 전문적인 편집이 필요하다면 Adobe Premiere Pro, Final Cut Pro를 추천합니다.',
    },
    {
      question: '수강생이 없으면 어떻게 하나요?',
      answer:
        '강의 품질을 지속적으로 개선하고, SNS 마케팅을 활용하세요. 초기 수강생에게 할인을 제공하고 리뷰를 요청하는 것도 효과적입니다.',
    },
    {
      question: '강의 업데이트는 얼마나 자주 해야 하나요?',
      answer:
        '피트니스 트렌드는 빠르게 변하므로 최소 3-6개월마다 콘텐츠를 검토하고 필요시 업데이트하세요. 수강생 피드백도 적극 반영하세요.',
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        {/* 헤더 */}
        <div className='mb-12 text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>강사 가이드</h1>
          <p className='text-lg text-gray-600'>
            성공적인 온라인 피트니스 강의를 만들기 위한 완벽한 가이드
          </p>
        </div>

        {/* 주요 가이드 섹션 */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-12'>
          {guides.map(guide => (
            <div key={guide.id} className='bg-white rounded-xl shadow-soft p-6'>
              <div className='flex items-center mb-4'>
                <div className={`p-3 rounded-lg ${guide.color}`}>
                  <guide.icon className='h-6 w-6' />
                </div>
                <h2 className='text-xl font-bold text-gray-900 ml-4'>
                  {guide.title}
                </h2>
              </div>
              <ul className='space-y-2'>
                {guide.items.map((item, index) => (
                  <li key={index} className='flex items-start'>
                    <CheckCircleIcon className='h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0' />
                    <span className='text-gray-700'>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 베스트 프랙티스 */}
        <div className='bg-white rounded-xl shadow-soft p-8 mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center'>
            <LightBulbIcon className='h-7 w-7 text-yellow-500 mr-3' />
            베스트 프랙티스
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {bestPractices.map((practice, index) => (
              <div key={index} className='flex items-start'>
                <practice.icon
                  className={`h-6 w-6 ${practice.color} mr-3 mt-1 flex-shrink-0`}
                />
                <div>
                  <h3 className='font-semibold text-gray-900 mb-1'>
                    {practice.title}
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    {practice.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 피해야 할 실수 */}
        <div className='bg-red-50 rounded-xl p-8 mb-8'>
          <h2 className='text-2xl font-bold text-red-900 mb-6'>
            피해야 할 일반적인 실수
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {commonMistakes.map((mistake, index) => (
              <div key={index} className='flex items-start'>
                <mistake.icon
                  className={`h-6 w-6 ${mistake.color} mr-3 mt-1 flex-shrink-0`}
                />
                <div>
                  <h3 className='font-semibold text-red-900 mb-1'>
                    {mistake.title}
                  </h3>
                  <p className='text-red-700 text-sm'>{mistake.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 단계별 가이드 */}
        <div className='bg-gradient-to-r from-primary-50 to-fitness-50 rounded-xl p-8 mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            강의 제작 단계별 가이드
          </h2>
          <div className='space-y-4'>
            <div className='bg-white rounded-lg p-4 flex items-center'>
              <div className='w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4'>
                1
              </div>
              <div>
                <h3 className='font-semibold text-gray-900'>기획 단계</h3>
                <p className='text-sm text-gray-600'>
                  타겟 수강생 정의, 커리큘럼 구성, 차별화 전략 수립
                </p>
              </div>
            </div>
            <div className='bg-white rounded-lg p-4 flex items-center'>
              <div className='w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4'>
                2
              </div>
              <div>
                <h3 className='font-semibold text-gray-900'>콘텐츠 제작</h3>
                <p className='text-sm text-gray-600'>
                  스크립트 작성, 동영상 촬영, 편집 및 후반 작업
                </p>
              </div>
            </div>
            <div className='bg-white rounded-lg p-4 flex items-center'>
              <div className='w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4'>
                3
              </div>
              <div>
                <h3 className='font-semibold text-gray-900'>강의 등록</h3>
                <p className='text-sm text-gray-600'>
                  강의 정보 입력, 가격 설정, 프로모션 자료 준비
                </p>
              </div>
            </div>
            <div className='bg-white rounded-lg p-4 flex items-center'>
              <div className='w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4'>
                4
              </div>
              <div>
                <h3 className='font-semibold text-gray-900'>운영 및 개선</h3>
                <p className='text-sm text-gray-600'>
                  수강생 피드백 수집, Q&A 대응, 콘텐츠 업데이트
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className='bg-white rounded-xl shadow-soft p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center'>
            <QuestionMarkCircleIcon className='h-7 w-7 text-primary-600 mr-3' />
            자주 묻는 질문
          </h2>
          <div className='space-y-6'>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className='border-b border-gray-200 pb-6 last:border-0'
              >
                <h3 className='font-semibold text-gray-900 mb-2'>
                  {faq.question}
                </h3>
                <p className='text-gray-600'>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 추가 리소스 */}
        <div className='mt-8 text-center'>
          <p className='text-gray-600 mb-4'>더 많은 정보가 필요하신가요?</p>
          <div className='flex justify-center space-x-4'>
            <button className='btn-outline flex items-center'>
              <DocumentTextIcon className='h-5 w-5 mr-2' />
              강의 제작 템플릿 다운로드
            </button>
            <button className='btn-primary flex items-center'>
              <PlayCircleIcon className='h-5 w-5 mr-2' />
              튜토리얼 영상 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
