export default async function TestApiPage() {
  let data = null
  let error = null

  try {
    console.log('Fetching instructor data...')
    const response = await fetch('http://localhost:8000/api/v1/instructors/cmdn0ejmh0004zs0l76cdkti1', {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      data = await response.json()
      console.log('Data received:', data.user.name)
    } else {
      error = `API returned ${response.status}: ${response.statusText}`
    }
  } catch (e) {
    error = `Fetch error: ${e.message}`
    console.error('Fetch error:', e)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="font-bold">Success!</h2>
          <p>Instructor: {data.user.name}</p>
          <p>Title: {data.title}</p>
          <p>Total courses: {data.totalCourses}</p>
        </div>
      )}
    </div>
  )
}