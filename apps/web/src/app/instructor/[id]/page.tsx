import { notFound } from 'next/navigation'

interface InstructorProfile {
  id: string
  user: {
    name: string
    specialties: string
    experience: number
    location: string
    introduction: string
  }
  title: string
  bio: string
  totalStudents: number
  totalCourses: number
  averageRating: number
}

async function getInstructor(id: string): Promise<InstructorProfile | null> {
  try {
    console.log('Fetching instructor with ID:', id)
    const response = await fetch(`http://localhost:8000/api/v1/instructors/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Instructor data received:', data.user.name)
      return data
    }
    
    return null
  } catch (error) {
    console.error('Failed to fetch instructor:', error)
    return null
  }
}

export default async function InstructorProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const instructor = await getInstructor(params.id)

  if (!instructor) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">강사 정보를 불러올 수 없습니다</h1>
          <p className="text-gray-600">ID: {params.id}</p>
          <p className="text-gray-600">API 요청이 실패했습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{instructor.user.name}</h1>
        <p className="text-xl text-gray-600 mb-2">{instructor.title}</p>
        <p className="text-gray-700 mb-4">{instructor.bio}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-primary-600">{instructor.totalStudents}</div>
            <div className="text-sm text-gray-600">총 수강생</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-fitness-600">{instructor.totalCourses}</div>
            <div className="text-sm text-gray-600">강의 수</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{instructor.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">평균 평점</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{instructor.user.experience}</div>
            <div className="text-sm text-gray-600">경력 (년)</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">강사 소개</h2>
          <p className="text-gray-700 mb-4">{instructor.user.introduction}</p>
          
          <h3 className="text-lg font-semibold mb-2">전문 분야</h3>
          <div className="flex flex-wrap gap-2">
            {instructor.user.specialties.split(', ').map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}