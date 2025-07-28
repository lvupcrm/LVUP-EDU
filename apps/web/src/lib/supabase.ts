import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 타입 정의
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          nickname?: string
          phone?: string
          avatar?: string
          role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
          user_type: 'TRAINER' | 'OPERATOR'
          status: 'ACTIVE' | 'INACTIVE'
          introduction?: string
          experience?: number
          location?: string
          specialties?: string[]
          certifications?: string[]
          provider_id?: string
          created_at: string
          updated_at: string
          last_login_at?: string
          email_verified_at?: string
        }
        Insert: {
          id: string
          email: string
          name: string
          nickname?: string
          phone?: string
          avatar?: string
          role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
          user_type?: 'TRAINER' | 'OPERATOR'
          status?: 'ACTIVE' | 'INACTIVE'
          introduction?: string
          experience?: number
          location?: string
          specialties?: string[]
          certifications?: string[]
          provider_id?: string
          last_login_at?: string
          email_verified_at?: string
        }
        Update: {
          email?: string
          name?: string
          nickname?: string
          phone?: string
          avatar?: string
          role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
          user_type?: 'TRAINER' | 'OPERATOR'
          status?: 'ACTIVE' | 'INACTIVE'
          introduction?: string
          experience?: number
          location?: string
          specialties?: string[]
          certifications?: string[]
          provider_id?: string
          last_login_at?: string
          email_verified_at?: string
        }
      }
      instructor_profiles: {
        Row: {
          id: string
          user_id: string
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          title?: string
          bio?: string
          expertise?: string[]
          achievements?: string[]
          educations?: string[]
          certification_docs?: any
          resume_doc?: string
          portfolio_doc?: string
          total_students: number
          total_courses: number
          average_rating: number
          total_revenue: number
          approved_at?: string
          approved_by?: string
          rejection_reason?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          title?: string
          bio?: string
          expertise?: string[]
          achievements?: string[]
          educations?: string[]
          certification_docs?: any
          resume_doc?: string
          portfolio_doc?: string
          total_students?: number
          total_courses?: number
          average_rating?: number
          total_revenue?: number
          approved_at?: string
          approved_by?: string
          rejection_reason?: string
        }
        Update: {
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          title?: string
          bio?: string
          expertise?: string[]
          achievements?: string[]
          educations?: string[]
          certification_docs?: any
          resume_doc?: string
          portfolio_doc?: string
          total_students?: number
          total_courses?: number
          average_rating?: number
          total_revenue?: number
          approved_at?: string
          approved_by?: string
          rejection_reason?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          short_description?: string
          status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
          level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
          type: 'VIDEO' | 'LIVE' | 'WORKSHOP'
          duration?: number
          language: string
          price: number
          original_price?: number
          discount_rate?: number
          is_free: boolean
          thumbnail?: string
          preview_video?: string
          images?: any
          meta_title?: string
          meta_description?: string
          keywords?: string[]
          enrollment_count: number
          view_count: number
          average_rating: number
          review_count: number
          is_public: boolean
          allow_preview: boolean
          certificate_enabled: boolean
          instructor_id: string
          category_id: string
          published_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          slug: string
          description: string
          short_description?: string
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
          level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
          type?: 'VIDEO' | 'LIVE' | 'WORKSHOP'
          duration?: number
          language?: string
          price?: number
          original_price?: number
          discount_rate?: number
          is_free?: boolean
          thumbnail?: string
          preview_video?: string
          images?: any
          meta_title?: string
          meta_description?: string
          keywords?: string[]
          enrollment_count?: number
          view_count?: number
          average_rating?: number
          review_count?: number
          is_public?: boolean
          allow_preview?: boolean
          certificate_enabled?: boolean
          instructor_id: string
          category_id: string
          published_at?: string
        }
        Update: {
          title?: string
          slug?: string
          description?: string
          short_description?: string
          status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
          level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
          type?: 'VIDEO' | 'LIVE' | 'WORKSHOP'
          duration?: number
          language?: string
          price?: number
          original_price?: number
          discount_rate?: number
          is_free?: boolean
          thumbnail?: string
          preview_video?: string
          images?: any
          meta_title?: string
          meta_description?: string
          keywords?: string[]
          enrollment_count?: number
          view_count?: number
          average_rating?: number
          review_count?: number
          is_public?: boolean
          allow_preview?: boolean
          certificate_enabled?: boolean
          instructor_id?: string
          category_id?: string
          published_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description?: string
          type: 'TRAINER' | 'OPERATOR'
          icon?: string
          color?: string
          order_num: number
          is_active: boolean
          parent_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string
          type: 'TRAINER' | 'OPERATOR'
          icon?: string
          color?: string
          order_num?: number
          is_active?: boolean
          parent_id?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string
          type?: 'TRAINER' | 'OPERATOR'
          icon?: string
          color?: string
          order_num?: number
          is_active?: boolean
          parent_id?: string
        }
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          description?: string
          order_num: number
          duration?: number
          video_url?: string
          content?: string
          resources?: any
          is_preview: boolean
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          course_id: string
          title: string
          description?: string
          order_num: number
          duration?: number
          video_url?: string
          content?: string
          resources?: any
          is_preview?: boolean
          is_published?: boolean
        }
        Update: {
          title?: string
          description?: string
          order_num?: number
          duration?: number
          video_url?: string
          content?: string
          resources?: any
          is_preview?: boolean
          is_published?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]