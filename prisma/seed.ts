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

  // 6. 간단한 강의 데이터 생성 (현재 스키마에 맞게)
  const courses = [
    {
      title: '피트니스 트레이너 기초 과정',
      description: '피트니스 트레이너로 시작하기 위한 기본 지식과 실무 스킬을 배우는 완전 초보자를 위한 강의입니다.',
      category: '기초 지식',
      level: '초급',
      duration: 1200, // 20시간
      price: 99000,
      isPaid: true,
      rating: 4.9,
      instructorId: instructorUser.id,
    },
    {
      title: 'CPT 자격증 완전 정복',
      description: 'CPT 자격증 취득을 위한 체계적인 학습 과정과 실전 문제 풀이로 합격을 보장합니다.',
      category: '자격증',
      level: '중급',
      duration: 1800, // 30시간
      price: 149000,
      isPaid: true,
      rating: 4.8,
      instructorId: instructorUser.id,
    },
    {
      title: '운동 해부학 기초',
      description: '트레이너가 반드시 알아야 할 인체 구조와 운동 시 근육의 작용을 쉽게 배워보세요.',
      category: '기초 지식',
      level: '초급',
      duration: 600, // 10시간
      price: 0,
      isPaid: false,
      rating: 4.6,
      instructorId: instructorUser.id,
    },
  ];

  for (const courseData of courses) {
    await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        price: courseData.price,
        isPaid: courseData.isPaid,
        rating: courseData.rating,
        instructorId: courseData.instructorId,
        isPublished: true,
      },
    });
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