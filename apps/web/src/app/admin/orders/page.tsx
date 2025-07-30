import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default async function AdminOrdersPage() {
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

  // 주문 데이터 가져오기
  const { data: orders } = await supabase
    .from('orders')
    .select(
      `
      id,
      order_number,
      amount,
      status,
      payment_method,
      created_at,
      updated_at,
      user:users(
        id,
        name,
        email,
        phone
      ),
      course:courses(
        id,
        title,
        price,
        instructor:instructor_profiles(
          user:users(name)
        )
      )
    `
    )
    .order('created_at', { ascending: false });

  // 통계 계산
  const stats = {
    total: orders?.length || 0,
    paid: orders?.filter(o => o.status === 'PAID').length || 0,
    pending: orders?.filter(o => o.status === 'PENDING').length || 0,
    failed:
      orders?.filter(o => ['FAILED', 'CANCELLED'].includes(o.status)).length ||
      0,
    totalRevenue:
      orders
        ?.filter(o => o.status === 'PAID')
        .reduce((sum, o) => sum + o.amount, 0) || 0,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            <CheckCircleIcon className='h-3 w-3 mr-1' />
            결제완료
          </span>
        );
      case 'PENDING':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
            <ClockIcon className='h-3 w-3 mr-1' />
            결제대기
          </span>
        );
      case 'FAILED':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            <XCircleIcon className='h-3 w-3 mr-1' />
            결제실패
          </span>
        );
      case 'CANCELLED':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            <XCircleIcon className='h-3 w-3 mr-1' />
            취소됨
          </span>
        );
      case 'REFUNDED':
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
            <ExclamationTriangleIcon className='h-3 w-3 mr-1' />
            환불됨
          </span>
        );
      default:
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            {status}
          </span>
        );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* 헤더 */}
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>주문 관리</h1>
            <p className='text-gray-600 mt-2'>
              전체 주문 내역을 확인하고 관리하세요
            </p>
          </div>
          <button className='btn-outline flex items-center'>
            <ArrowDownTrayIcon className='h-5 w-5 mr-2' />
            엑셀 다운로드
          </button>
        </div>

        {/* 통계 카드 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center'>
                <CurrencyDollarIcon className='h-6 w-6 text-gray-600' />
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {stats.total}
            </div>
            <p className='text-sm text-gray-600 mt-1'>전체 주문</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <CheckCircleIcon className='h-6 w-6 text-green-600' />
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>{stats.paid}</div>
            <p className='text-sm text-gray-600 mt-1'>결제 완료</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
                <ClockIcon className='h-6 w-6 text-yellow-600' />
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {stats.pending}
            </div>
            <p className='text-sm text-gray-600 mt-1'>결제 대기</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center'>
                <XCircleIcon className='h-6 w-6 text-red-600' />
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {stats.failed}
            </div>
            <p className='text-sm text-gray-600 mt-1'>실패/취소</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center'>
                <CurrencyDollarIcon className='h-6 w-6 text-primary-600' />
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              ₩{formatPrice(stats.totalRevenue)}
            </div>
            <p className='text-sm text-gray-600 mt-1'>총 매출</p>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className='bg-white rounded-xl shadow-soft p-6 mb-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 relative'>
              <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='주문번호, 이메일, 강의명으로 검색...'
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              />
            </div>
            <select className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'>
              <option value=''>모든 상태</option>
              <option value='PAID'>결제완료</option>
              <option value='PENDING'>결제대기</option>
              <option value='FAILED'>결제실패</option>
              <option value='CANCELLED'>취소됨</option>
              <option value='REFUNDED'>환불됨</option>
            </select>
            <input
              type='date'
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            />
            <button className='btn-outline flex items-center'>
              <FunnelIcon className='h-5 w-5 mr-2' />
              필터
            </button>
          </div>
        </div>

        {/* 주문 목록 테이블 */}
        <div className='bg-white rounded-xl shadow-soft overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    주문번호
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    구매자
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    강의명
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    강사
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    금액
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    결제방법
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    상태
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    주문일시
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {orders?.map(order => (
                  <tr key={order.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        {order.order_number}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {order.user?.name || '이름 없음'}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {order.user?.email}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {order.course?.title}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {(order.course as any)?.instructor?.user?.name || '-'}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        ₩{formatPrice(order.amount)}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {order.payment_method || '카드'}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {getStatusBadge(order.status)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {new Date(order.created_at).toLocaleDateString('ko-KR')}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {new Date(order.created_at).toLocaleTimeString(
                          'ko-KR',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex space-x-2'>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className='text-primary-600 hover:text-primary-900'
                        >
                          상세
                        </Link>
                        {order.status === 'PAID' && (
                          <button className='text-red-600 hover:text-red-900'>
                            환불
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!orders || orders.length === 0) && (
            <div className='text-center py-12'>
              <CurrencyDollarIcon className='h-12 w-12 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500'>아직 주문이 없습니다</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {orders && orders.length > 0 && (
          <div className='mt-6 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              전체 <span className='font-medium'>{orders.length}</span>건 중{' '}
              <span className='font-medium'>
                1-{Math.min(orders.length, 20)}
              </span>
              건 표시
            </div>
            <div className='flex space-x-2'>
              <button
                className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled
              >
                이전
              </button>
              <button className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50'>
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
