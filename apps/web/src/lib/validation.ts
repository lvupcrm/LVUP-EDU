/**
 * Comprehensive Validation Library
 * - Zod schema validation
 * - Custom validation rules
 * - Type-safe validation
 * - Error handling
 */

import { z } from 'zod'

// Base schemas
export const emailSchema = z
  .string()
  .email('유효한 이메일 주소를 입력해주세요')
  .max(254, '이메일 주소가 너무 깁니다')

export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .max(128, '비밀번호는 128자를 초과할 수 없습니다')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다')

export const phoneSchema = z
  .string()
  .regex(/^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/, '유효한 전화번호를 입력해주세요')

export const urlSchema = z
  .string()
  .url('유효한 URL을 입력해주세요')
  .max(2048, 'URL이 너무 깁니다')

// User validation schemas
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 50자를 초과할 수 없습니다')
    .regex(/^[가-힣a-zA-Z\s]+$/, '이름은 한글, 영문만 입력 가능합니다'),
  phone: phoneSchema.optional(),
  agree_terms: z.boolean().refine(val => val === true, '이용약관에 동의해야 합니다'),
  agree_privacy: z.boolean().refine(val => val === true, '개인정보처리방침에 동의해야 합니다')
})

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요')
})

// Course validation schemas
export const courseCreateSchema = z.object({
  title: z
    .string()
    .min(5, '강의 제목은 최소 5자 이상이어야 합니다')
    .max(100, '강의 제목은 100자를 초과할 수 없습니다'),
  description: z
    .string()
    .min(20, '강의 설명은 최소 20자 이상이어야 합니다')
    .max(2000, '강의 설명은 2000자를 초과할 수 없습니다'),
  price: z
    .number()
    .min(0, '가격은 0원 이상이어야 합니다')
    .max(1000000, '가격은 100만원을 초과할 수 없습니다'),
  level: z.enum(['초급', '중급', '고급']),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  thumbnail: urlSchema.optional(),
  is_free: z.boolean().default(false),
  tags: z.array(z.string()).max(10, '태그는 최대 10개까지 입력 가능합니다').optional()
})

export const lessonCreateSchema = z.object({
  title: z
    .string()
    .min(3, '레슨 제목은 최소 3자 이상이어야 합니다')
    .max(100, '레슨 제목은 100자를 초과할 수 없습니다'),
  description: z.string().max(1000, '레슨 설명은 1000자를 초과할 수 없습니다').optional(),
  video_url: urlSchema.optional(),
  duration: z.number().min(1, '레슨 시간은 최소 1분 이상이어야 합니다').max(600, '레슨 시간은 최대 600분까지 입니다'),
  order_index: z.number().min(1, '순서는 1 이상이어야 합니다'),
  is_preview: z.boolean().default(false),
  content: z.string().max(10000, '레슨 내용은 10000자를 초과할 수 없습니다').optional()
})

// Review validation schemas
export const reviewCreateSchema = z.object({
  rating: z.number().min(1, '별점은 최소 1점입니다').max(5, '별점은 최대 5점입니다'),
  comment: z
    .string()
    .min(10, '리뷰는 최소 10자 이상 작성해주세요')
    .max(1000, '리뷰는 1000자를 초과할 수 없습니다')
})

// Q&A validation schemas
export const questionCreateSchema = z.object({
  title: z
    .string()
    .min(5, '질문 제목은 최소 5자 이상이어야 합니다')
    .max(100, '질문 제목은 100자를 초과할 수 없습니다'),
  content: z
    .string()
    .min(10, '질문 내용은 최소 10자 이상 작성해주세요')
    .max(2000, '질문 내용은 2000자를 초과할 수 없습니다'),
  lesson_id: z.string().uuid('유효하지 않은 레슨 ID입니다').optional()
})

export const answerCreateSchema = z.object({
  content: z
    .string()
    .min(5, '답변은 최소 5자 이상 작성해주세요')
    .max(2000, '답변은 2000자를 초과할 수 없습니다')
})

// Payment validation schemas
export const paymentCreateSchema = z.object({
  course_id: z.string().uuid('유효하지 않은 강의 ID입니다'),
  payment_method: z.enum(['카드', '가상계좌', '간편결제']),
  amount: z.number().min(0, '결제 금액은 0원 이상이어야 합니다')
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.object({
    name: z.string(),
    size: z.number().max(50 * 1024 * 1024, '파일 크기는 50MB를 초과할 수 없습니다'), // 50MB
    type: z.string().refine(
      (type) => ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'].includes(type),
      '지원하지 않는 파일 형식입니다'
    )
  })
})

// Utility functions
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message)
      }
    }
    return {
      success: false,
      errors: ['유효성 검사 중 오류가 발생했습니다']
    }
  }
}

export function createValidationError(message: string, field?: string) {
  return {
    success: false,
    errors: [`${field ? `${field}: ` : ''}${message}`]
  }
}

// Common validation patterns
export const commonValidation = {
  uuid: z.string().uuid('유효하지 않은 ID 형식입니다'),
  positiveNumber: z.number().positive('양수만 입력 가능합니다'),
  nonEmptyString: z.string().min(1, '값을 입력해주세요'),
  koreanText: z.string().regex(/^[가-힣\s]+$/, '한글만 입력 가능합니다'),
  englishText: z.string().regex(/^[a-zA-Z\s]+$/, '영문만 입력 가능합니다'),
  alphanumeric: z.string().regex(/^[a-zA-Z0-9]+$/, '영문과 숫자만 입력 가능합니다')
}

export type UserRegistration = z.infer<typeof userRegistrationSchema>
export type UserLogin = z.infer<typeof userLoginSchema>
export type CourseCreate = z.infer<typeof courseCreateSchema>
export type LessonCreate = z.infer<typeof lessonCreateSchema>
export type ReviewCreate = z.infer<typeof reviewCreateSchema>
export type QuestionCreate = z.infer<typeof questionCreateSchema>
export type AnswerCreate = z.infer<typeof answerCreateSchema>
export type PaymentCreate = z.infer<typeof paymentCreateSchema>