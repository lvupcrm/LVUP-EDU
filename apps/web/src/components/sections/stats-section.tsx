const stats = [
  {
    label: '총 수강생',
    value: '5,000+',
    description: '전국 피트니스 종사자들이 선택',
    icon: '👥'
  },
  {
    label: '강의 만족도',
    value: '95%',
    description: '수강생 평균 만족도',
    icon: '⭐'
  },
  {
    label: '자격증 합격률',
    value: '88%',
    description: 'CPT/CES/PES 평균 합격률',
    icon: '🏆'
  },
  {
    label: '취업/창업 성공',
    value: '92%',
    description: '수료 후 6개월 내 성과',
    icon: '🚀'
  }
]

export function StatsSection() {
  return (
    <section className="section bg-white border-b border-gray-100">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-2xl">{stat.icon}</div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="font-medium text-gray-900">
                {stat.label}
              </div>
              <div className="text-sm text-gray-600">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}