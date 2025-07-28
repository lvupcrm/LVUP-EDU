import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class InstructorsService {
  constructor(private prisma: PrismaService) {}

  async findById(instructorId: string) {
    // 강사 정보와 관련 데이터를 가져옴
    const instructor = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            specialties: true,
            experience: true,
            location: true,
            introduction: true,
          },
        },
        courses: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            price: true,
            isFree: true,
            level: true,
            enrollmentCount: true,
            averageRating: true,
          },
        },
      },
    });

    if (!instructor) {
      throw new NotFoundException('강사를 찾을 수 없습니다');
    }

    // 강사의 총 수강생 수 계산 (강의별 enrollmentCount 합산)
    const totalStudents = instructor.courses.reduce((sum, course) => sum + course.enrollmentCount, 0);
    
    // 강사의 평균 평점 계산 (강의별 평점의 평균)
    const averageRating = instructor.courses.length > 0
      ? instructor.courses.reduce((sum, course) => sum + course.averageRating, 0) / instructor.courses.length
      : 0;

    // 응답 데이터 변환
    return {
      id: instructor.id,
      user: instructor.user,
      title: instructor.title,
      bio: instructor.bio,
      expertise: instructor.expertise,
      achievements: instructor.achievements,
      educations: instructor.educations,
      totalStudents,
      totalCourses: instructor.courses.length,
      averageRating: Math.round(averageRating * 10) / 10, // 소수점 첫째자리까지
      courses: instructor.courses.map(course => ({
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        price: course.price,
        isPaid: !course.isFree,
        level: course.level === 'BEGINNER' ? '초급' : 
               course.level === 'INTERMEDIATE' ? '중급' : '고급',
        enrollmentCount: course.enrollmentCount,
        averageRating: course.averageRating,
      })),
    };
  }

  async findByUserId(userId: string) {
    const instructor = await this.prisma.instructorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            specialties: true,
            experience: true,
            location: true,
            introduction: true,
          },
        },
      },
    });

    if (!instructor) {
      throw new NotFoundException('강사 프로필을 찾을 수 없습니다');
    }

    return instructor;
  }
}