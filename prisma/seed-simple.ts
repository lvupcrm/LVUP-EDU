import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. 시스템 설정
  const systemConfigs = [
    {
      key: 'SITE_NAME',
      value: 'LVUP EDU',
      description: '사이트 이름',
      isPublic: true,
    },
    {
      key: 'SITE_DESCRIPTION', 
      value: '피트니스 전문 교육 플랫폼',
      description: '사이트 설명',
      isPublic: true,
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: config,
      create: config,
    });
  }

  // 2. 카테고리 생성
  const trainerCategories = [
    {
      name: '기초 과정',
      slug: 'trainer-basic',
      description: '해부학, 운동생리학, 안전 관리',
      type: 'TRAINER',
      icon: '🏃‍♂️',
      color: '#3B82F6',
      order: 1,
    },
    {
      name: '실무 과정',
      slug: 'trainer-practical',
      description: '프로그램 설계, 동작 분석, 식단 지도',
      type: 'TRAINER',
      icon: '💪',
      color: '#10B981',
      order: 2,
    },
  ];

  const operatorCategories = [
    {
      name: '기초 운영',
      slug: 'operator-basic',
      description: '센터 개설, 법무, 보험',
      type: 'OPERATOR',
      icon: '🏢',
      color: '#8B5CF6',
      order: 1,
    },
    {
      name: '매출 관리',
      slug: 'operator-revenue',
      description: '회원 관리, 마케팅, 영업',
      type: 'OPERATOR',
      icon: '💰',
      color: '#06B6D4',
      order: 2,
    },
  ];

  const allCategories = [...trainerCategories, ...operatorCategories];

  for (const category of allCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  // 3. 관리자 계정 생성
  const hashedPassword = await bcrypt.hash('admin123!@#', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lvupedu.com' },
    update: {},
    create: {
      email: 'admin@lvupedu.com',
      password: hashedPassword,
      name: '관리자',
      nickname: 'admin',
      role: 'ADMIN',
      userType: 'OPERATOR',
      emailVerifiedAt: new Date(),
    },
  });

  // 4. 샘플 강사 계정
  const instructorPassword = await bcrypt.hash('instructor123', 12);
  
  const instructorUser = await prisma.user.upsert({
    where: { email: 'instructor@lvupedu.com' },
    update: {},
    create: {
      email: 'instructor@lvupedu.com',
      password: instructorPassword,
      name: '김트레이너',
      nickname: 'trainer_kim',
      role: 'INSTRUCTOR',
      userType: 'TRAINER',
      introduction: '15년 경력의 피트니스 전문가입니다.',
      experience: 15,
      location: '서울',
      specialties: JSON.stringify(['웨이트 트레이닝', '재활 운동', '다이어트']),
      certifications: JSON.stringify(['CPT', 'CES', 'PES']),
      emailVerifiedAt: new Date(),
    },
  });

  // 5. 강사 프로필 생성
  await prisma.instructorProfile.upsert({
    where: { userId: instructorUser.id },
    update: {},
    create: {
      userId: instructorUser.id,
      status: 'APPROVED',
      title: '피트니스 전문가',
      bio: '대한민국 최고의 피트니스 전문가로서 수많은 고객들의 변화를 이끌어왔습니다.',
      expertise: JSON.stringify(['웨이트 트레이닝', '재활 운동', '영양학', '퍼스널 트레이닝']),
      achievements: JSON.stringify([
        '국가대표 피트니스 코치 경력',
        '피트니스 센터 5개 운영',
        '온라인 강의 수강생 10,000명+',
      ]),
      educations: JSON.stringify(['서울대학교 체육교육과', '미국 NASM 자격증']),
      approvedAt: new Date(),
    },
  });

  // 6. 샘플 강의 생성
  const basicCategory = await prisma.category.findFirst({
    where: { slug: 'trainer-basic' },
  });

  const instructorProfile = await prisma.instructorProfile.findFirst({
    where: { userId: instructorUser.id },
  });

  if (basicCategory && instructorProfile) {
    const basicCourse = await prisma.course.create({
      data: {
        title: '피트니스 트레이너 기초 해부학',
        slug: 'fitness-trainer-basic-anatomy',
        description: '트레이너가 반드시 알아야 할 인체 해부학과 근육의 구조를 배우는 기초 과정입니다.',
        shortDescription: '인체 해부학과 근육 구조의 기초를 학습하세요',
        status: 'PUBLISHED',
        level: 'BEGINNER',
        duration: 300, // 5시간
        price: 99000,
        originalPrice: 129000,
        discountRate: 23,
        thumbnail: '/courses/anatomy-basic.jpg',
        keywords: JSON.stringify(['해부학', '근육', '기초', '트레이너']),
        instructorId: instructorProfile.id,
        categoryId: basicCategory.id,
        publishedAt: new Date(),
      },
    });

    // 강의별 레슨 생성
    const basicLessons = [
      {
        title: '인체 해부학 개요',
        description: '인체의 기본 구조와 시스템을 이해합니다',
        order: 1,
        duration: 45,
        courseId: basicCourse.id,
        isPreview: true,
      },
      {
        title: '근골격계 시스템',
        description: '뼈와 근육의 구조와 기능을 학습합니다',
        order: 2,
        duration: 60,
        courseId: basicCourse.id,
      },
    ];

    for (const lesson of basicLessons) {
      await prisma.lesson.create({ data: lesson });
    }
  }

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });