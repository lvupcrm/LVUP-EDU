import { supabase } from '@/lib/supabase';
import { checkInstructorAuth } from '@/middleware/instructor';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default async function InstructorRevenuePage() {
  const auth = await checkInstructorAuth();

  if (!auth.authorized) {
    redirect(auth.redirect!);
  }

  // 강사의 모든 강의 가져오기
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, price')
    .eq('instructor_id', auth.instructorId);

  const courseIds = courses?.map(c => c.id) || [];

  // 수익 데이터 가져오기 (orders 테이블에서)
  const { data: orders } = await supabase
    .from('orders')
    .select(
      `
      id,
      order_number,
      amount,
      status,
      created_at,
      course:courses(id, title, price),
      user:users(name, email)
    `
    )
    .in('course_id', courseIds)
    .eq('status', 'PAID')
    .order('created_at', { ascending: false });

  // 월별 수익 계산
  const monthlyRevenue =
    orders?.reduce(
      (acc, order) => {
        const month = new Date(order.created_at).toISOString().slice(0, 7);
        if (!acc[month]) acc[month] = 0;
        acc[month] += order.amount;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  // 강의별 수익 계산
  const courseRevenue =
    orders?.reduce(
      (acc, order) => {
        const courseId = order.course?.id;
        if (!courseId) return acc;
        if (!acc[courseId]) {
          acc[courseId] = {
            title: order.course.title,
            revenue: 0,
            count: 0,
          };
        }
        acc[courseId].revenue += order.amount;
        acc[courseId].count += 1;
        return acc;
      },
      {} as Record<string, { title: string; revenue: number; count: number }>
    ) || {};

  // 통계 계산
  const totalRevenue =
    orders?.reduce((sum, order) => sum + order.amount, 0) || 0;
  const platformFee = totalRevenue * 0.2; // 플랫폼 수수료 20%
  const netRevenue = totalRevenue - platformFee;
  const thisMonthRevenue =
    monthlyRevenue[new Date().toISOString().slice(0, 7)] || 0;

  // 최근 30일 수익
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentRevenue =
    orders
      ?.filter(order => new Date(order.created_at) >= thirtyDaysAgo)
      .reduce((sum, order) => sum + order.amount, 0) || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* 헤더 */}
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>수익 정산</h1>
            <p className='text-gray-600 mt-2'>
              강의 수익 현황을 확인하고 정산을 신청하세요
            </p>
          </div>
          <button className='btn-primary flex items-center'>
            <BanknotesIcon className='h-5 w-5 mr-2' />
            정산 신청
          </button>
        </div>

        {/* 수익 요약 카드 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <CurrencyDollarIcon className='h-6 w-6 text-green-600' />
              </div>
              <span className='text-sm text-gray-500'>전체</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              ₩{formatPrice(totalRevenue)}
            </div>
            <p className='text-sm text-gray-600 mt-1'>총 매출</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center'>
                <BanknotesIcon className='h-6 w-6 text-primary-600' />
              </div>
              <span className='text-sm text-gray-500'>정산가능</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              ₩{formatPrice(netRevenue)}
            </div>
            <p className='text-sm text-gray-600 mt-1'>순수익 (수수료 제외)</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-fitness-100 rounded-lg flex items-center justify-center'>
                <CalendarIcon className='h-6 w-6 text-fitness-600' />
              </div>
              <span className='text-sm text-gray-500'>이번 달</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              ₩{formatPrice(thisMonthRevenue)}
            </div>
            <p className='text-sm text-gray-600 mt-1'>월 매출</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
                <ClockIcon className='h-6 w-6 text-yellow-600' />
              </div>
              <span className='text-sm text-gray-500'>최근 30일</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              ₩{formatPrice(recentRevenue)}
            </div>
            <p className='text-sm text-gray-600 mt-1'>최근 수익</p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* 월별 수익 차트 */}
          <div className='lg:col-span-2 bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-gray-900'>
                월별 수익 추이
              </h2>
              <button className='text-gray-600 hover:text-gray-900'>
                <ArrowDownTrayIcon className='h-5 w-5' />
              </button>
            </div>

            <div className='space-y-4'>
              {Object.entries(monthlyRevenue)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .slice(0, 6)
                .map(([month, revenue]) => {
                  const maxRevenue = Math.max(...Object.values(monthlyRevenue));
                  const percentage =
                    maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

                  return (
                    <div key={month} className='flex items-center'>
                      <div className='w-24 text-sm text-gray-600'>
                        {new Date(month + '-01').toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </div>
                      <div className='flex-1 mx-4'>
                        <div className='w-full bg-gray-200 rounded-full h-6'>
                          <div
                            className='bg-primary-600 h-6 rounded-full flex items-center justify-end pr-2'
                            style={{ width: `${percentage}%` }}
                          >
                            <span className='text-xs text-white font-medium'>
                              ₩{formatPrice(revenue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 강의별 수익 */}
          <div className='bg-white rounded-xl shadow-soft p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-6'>
              강의별 수익
            </h2>

            <div className='space-y-4'>
              {Object.entries(courseRevenue)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .map(([courseId, data]) => (
                  <div
                    key={courseId}
                    className='border-b border-gray-200 pb-3 last:border-0'
                  >
                    <div className='flex justify-between items-start mb-1'>
                      <h3 className='text-sm font-medium text-gray-900 flex-1 pr-2'>
                        {data.title}
                      </h3>
                      <span className='text-sm font-bold text-gray-900'>
                        ₩{formatPrice(data.revenue)}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs text-gray-500'>
                      <span>{data.count}건 판매</span>
                      <span>
                        평균 ₩
                        {formatPrice(Math.round(data.revenue / data.count))}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* 최근 거래 내역 */}
        <div className='mt-8 bg-white rounded-xl shadow-soft overflow-hidden'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-xl font-bold text-gray-900'>최근 거래 내역</h2>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    주문번호
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    강의명
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    구매자
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    금액
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    수수료
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    정산금액
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    결제일
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {orders?.slice(0, 10).map(order => {
                  const fee = order.amount * 0.2;
                  const net = order.amount - fee;

                  return (
                    <tr key={order.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {order.order_number}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {order.course?.title}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        <div>
                          <div>{order.user?.name || '이름 없음'}</div>
                          <div className='text-xs text-gray-400'>
                            {order.user?.email}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        ₩{formatPrice(order.amount)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-red-600'>
                        -₩{formatPrice(fee)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600'>
                        ₩{formatPrice(net)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {new Date(order.created_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(!orders || orders.length === 0) && (
            <div className='text-center py-12'>
              <CurrencyDollarIcon className='h-12 w-12 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500'>아직 거래 내역이 없습니다</p>
            </div>
          )}
        </div>

        {/* 정산 정보 */}
        <div className='mt-8 bg-primary-50 rounded-xl p-6'>
          <h3 className='text-lg font-bold text-primary-900 mb-2'>정산 안내</h3>
          <ul className='text-sm text-primary-700 space-y-1'>
            <li>• 정산은 매월 1일과 16일에 진행됩니다</li>
            <li>• 최소 정산 금액은 10,000원입니다</li>
            <li>• 플랫폼 수수료는 매출의 20%입니다</li>
            <li>• 정산 신청 후 영업일 기준 3-5일 내 입금됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
