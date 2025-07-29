import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lvup-edu-web-h1ln-psi.vercel.app'

  // 정적 페이지들
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/instructors`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  try {
    // 강의 페이지들
    const { data: courses } = await supabase
      .from('courses')
      .select('id, updated_at')
      .eq('is_published', true)

    const courseRoutes = courses?.map((course) => ({
      url: `${baseUrl}/courses/${course.id}`,
      lastModified: new Date(course.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || []

    // 강사 페이지들
    const { data: instructors } = await supabase
      .from('instructor_profiles')
      .select('id, updated_at')

    const instructorRoutes = instructors?.map((instructor) => ({
      url: `${baseUrl}/instructor/${instructor.id}`,
      lastModified: new Date(instructor.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })) || []

    // 카테고리 페이지들
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')

    const categoryRoutes = categories?.map((category) => ({
      url: `${baseUrl}/courses/category/${category.slug}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })) || []

    return [
      ...staticRoutes,
      ...courseRoutes,
      ...instructorRoutes,
      ...categoryRoutes,
    ]

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticRoutes
  }
}