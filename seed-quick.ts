import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시드 데이터 생성 시작...')

  // 1. 카테고리 생성 (upsert 사용)
  const basicCategory = await prisma.category.upsert({
    where: { slug: 'basic-knowledge' },
    update: {},
    create: {
      name: '기초 지식',
      slug: 'basic-knowledge',
      description: '트레이너 기초 지식',
      type: 'TRAINER',
      icon: '📚',
      color: '#3B82F6',
      order: 1,
    },
  })

  const certCategory = await prisma.category.upsert({
    where: { slug: 'certifications' },
    update: {},
    create: {
      name: '자격증',
      slug: 'certifications',
      description: '각종 자격증 과정',
      type: 'TRAINER',
      icon: '🏆',
      color: '#10B981',
      order: 2,
    },
  })

  // 2. 강사 사용자 생성 (upsert 사용)
  const instructorPassword = await bcrypt.hash('instructor123', 12)
  const instructor = await prisma.user.upsert({
    where: { email: 'kim.trainer@lvupedu.com' },
    update: {},
    create: {
      email: 'kim.trainer@lvupedu.com',
      password: instructorPassword,
      name: '김트레이너',
      role: 'INSTRUCTOR',
      userType: 'TRAINER',
      emailVerifiedAt: new Date(),
      introduction: '15년 경력의 퍼스널 트레이닝 전문가로, CPT-NASM 자격증을 보유하고 있습니다.',
      specialties: 'PT, 웨이트 트레이닝, 재활',
      experience: 15,
      location: '서울',
    },
  })

  // 3. 강사 프로필 생성 (upsert 사용)
  const instructorProfile = await prisma.instructorProfile.upsert({
    where: { userId: instructor.id },
    update: {},
    create: {
      userId: instructor.id,
      status: 'APPROVED',
      title: '피트니스 전문가',
      bio: '15년 경력의 퍼스널 트레이닝 전문가입니다. 체계적인 운동 프로그램과 올바른 식단 관리를 통해 수많은 회원들의 건강한 변화를 도왔습니다.',
      expertise: JSON.stringify(['웨이트 트레이닝', '재활 운동', '다이어트', '근력 향상', '체형 교정']),
      achievements: JSON.stringify(['CPT-NASM 자격증 보유', '15년 트레이닝 경력', '1000명+ 회원 지도', '체육대학 우수졸업', '재활운동 전문과정 수료']),
      educations: JSON.stringify(['체육대학 운동학과 졸업', 'NASM 인증 퍼스널트레이너', '재활운동사 자격증', '스포츠영양사 자격증']),
      approvedAt: new Date(),
    },
  })

  // 4. 강의 데이터 생성
  const courses = [
    {
      title: '피트니스 트레이너 기초 과정',
      slug: 'fitness-trainer-basic',
      description: '피트니스 트레이너로 시작하기 위한 기본 지식과 실무 스킬을 배우는 완전 초보자를 위한 강의입니다.',
      status: 'PUBLISHED',
      level: 'BEGINNER',
      duration: 1200,
      price: 99000,
      instructorId: instructorProfile.id,
      categoryId: basicCategory.id,
      publishedAt: new Date(),
    },
    {
      title: 'CPT 자격증 완전 정복',
      slug: 'cpt-certification-complete',
      description: 'CPT 자격증 취득을 위한 체계적인 학습 과정과 실전 문제 풀이로 합격을 보장합니다.',
      status: 'PUBLISHED',
      level: 'INTERMEDIATE',
      duration: 1800,
      price: 149000,
      instructorId: instructorProfile.id,
      categoryId: certCategory.id,
      publishedAt: new Date(),
    },
    {
      title: '운동 해부학 기초',
      slug: 'anatomy-basics',
      description: '트레이너가 반드시 알아야 할 인체 구조와 운동 시 근육의 작용을 쉽게 배워보세요.',
      status: 'PUBLISHED',
      level: 'BEGINNER',
      duration: 600,
      price: 0,
      isFree: true,
      instructorId: instructorProfile.id,
      categoryId: basicCategory.id,
      publishedAt: new Date(),
    },
  ]

  const createdCourses = []
  for (const courseData of courses) {
    const course = await prisma.course.create({ data: courseData })
    createdCourses.push(course)
  }

  // 5. 레슨 데이터 생성
  const lessons = [
    // 첫 번째 강의의 레슨들
    {
      title: '트레이너 기초 개념',
      description: '피트니스 트레이너가 알아야 할 기본 개념들을 학습합니다',
      order: 1,
      duration: 45,
      isPreview: true,
      courseId: createdCourses[0].id,
    },
    {
      title: '해부학 기초',
      description: '인체의 기본 구조와 근육계를 이해합니다',
      order: 2,
      duration: 60,
      courseId: createdCourses[0].id,
    },
    {
      title: '운동생리학 개론',
      description: '운동 시 신체 반응과 적응을 학습합니다',
      order: 3,
      duration: 50,
      courseId: createdCourses[0].id,
    },
    {
      title: '안전 관리와 응급처치',
      description: '운동 중 안전 관리와 응급상황 대처법을 배웁니다',
      order: 4,
      duration: 40,
      courseId: createdCourses[0].id,
    },
    // 두 번째 강의의 레슨들 (CPT 자격증)
    {
      title: 'CPT 시험 개요',
      description: 'CPT 자격증 시험의 구성과 준비 전략을 알아봅니다',
      order: 1,
      duration: 30,
      isPreview: true,
      courseId: createdCourses[1].id,
    },
    {
      title: '해부학 심화',
      description: 'CPT 시험에 필요한 해부학 지식을 심화 학습합니다',
      order: 2,
      duration: 90,
      courseId: createdCourses[1].id,
    },
    {
      title: '운동생리학 심화',
      description: '운동생리학의 고급 개념들을 다룹니다',
      order: 3,
      duration: 80,
      courseId: createdCourses[1].id,
    },
    {
      title: '프로그램 설계',
      description: '개인별 맞춤 운동 프로그램 설계 방법을 학습합니다',
      order: 4,
      duration: 75,
      courseId: createdCourses[1].id,
    },
    {
      title: '실전 모의고사',
      description: '실제 시험 형태의 모의고사를 통해 실력을 점검합니다',
      order: 5,
      duration: 120,
      courseId: createdCourses[1].id,
    },
    // 세 번째 강의의 레슨들 (해부학 기초)
    {
      title: '인체 개요',
      description: '인체의 전반적인 구조를 살펴봅니다',
      order: 1,
      duration: 25,
      isPreview: true,
      courseId: createdCourses[2].id,
    },
    {
      title: '근골격계',
      description: '뼈와 근육의 구조와 기능을 학습합니다',
      order: 2,
      duration: 35,
      courseId: createdCourses[2].id,
    },
    {
      title: '관절과 움직임',
      description: '관절의 종류와 인체의 기본 움직임을 이해합니다',
      order: 3,
      duration: 30,
      courseId: createdCourses[2].id,
    },
  ]

  for (const lessonData of lessons) {
    await prisma.lesson.create({ data: lessonData })
  }

  // 6. 일반 사용자 생성
  const studentPassword = await bcrypt.hash('student123', 12)
  await prisma.user.create({
    data: {
      email: 'student@test.com',
      password: studentPassword,
      name: '김학생',
      role: 'STUDENT',
      userType: 'TRAINER',
      emailVerifiedAt: new Date(),
    },
  })

  console.log('✅ 시드 데이터 생성 완료!')
  console.log(`- 카테고리: 2개`)
  console.log(`- 강사: 1명`)
  console.log(`- 강의: ${courses.length}개`)
  console.log(`- 레슨: ${lessons.length}개`)
  console.log(`- 일반 사용자: 1명`)
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 실패:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })