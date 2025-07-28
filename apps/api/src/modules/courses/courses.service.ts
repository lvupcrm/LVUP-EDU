import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    category?: string;
    level?: string;
    isPaid?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      category,
      level,
      isPaid,
      search,
      page = 1,
      limit = 12,
    } = params || {};

    const where: any = {
      status: 'PUBLISHED',
    };

    if (category) {
      where.category = {
        name: category,
      };
    }

    if (level) {
      // 실제 스키마의 level 값들: BEGINNER, INTERMEDIATE, ADVANCED
      const levelMap: { [key: string]: string } = {
        '초급': 'BEGINNER',
        '중급': 'INTERMEDIATE', 
        '고급': 'ADVANCED',
      };
      where.level = levelMap[level] || level;
    }

    if (isPaid !== undefined) {
      if (isPaid) {
        where.price = { gt: 0 };
      } else {
        where.OR = [
          { price: 0 },
          { isFree: true },
        ];
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { instructor: { user: { name: { contains: search } } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          instructor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.course.count({ where }),
    ]);

    // 응답 데이터를 프론트엔드 형식에 맞게 변환
    const transformedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      category: course.category.name,
      level: course.level === 'BEGINNER' ? '초급' : 
             course.level === 'INTERMEDIATE' ? '중급' : '고급',
      duration: course.duration || 0,
      price: course.price,
      isPaid: course.price > 0 && !course.isFree,
      rating: course.averageRating,
      instructor: {
        id: course.instructor.user.id,
        name: course.instructor.user.name,
        avatar: course.instructor.user.avatar,
      },
      _count: {
        enrollments: course.enrollmentCount,
        reviews: course.reviewCount,
      },
    }));

    return {
      courses: transformedCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                specialties: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            duration: true,
            order: true,
            isPreview: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      return null;
    }

    // 응답 데이터를 프론트엔드 형식에 맞게 변환
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      category: course.category,
      level: course.level === 'BEGINNER' ? '초급' : 
             course.level === 'INTERMEDIATE' ? '중급' : '고급',
      duration: course.duration || 0,
      price: course.price,
      originalPrice: course.originalPrice,
      isFree: course.isFree,
      averageRating: course.averageRating,
      instructor: {
        user: course.instructor.user,
        bio: course.instructor.bio,
        expertise: course.instructor.expertise,
        achievements: course.instructor.achievements,
      },
      lessons: course.lessons,
      _count: {
        enrollments: course.enrollmentCount,
        reviews: course.reviewCount,
      },
    };
  }

  async getPopularCourses(limit = 6) {
    return this.prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        enrollmentCount: 'desc',
      },
      take: limit,
    });
  }

  async getRecommendedCourses(userType: string, limit = 6) {
    const categoryMap: { [key: string]: string[] } = {
      TRAINER: ['기초 지식', '전문 기술', '자격증'],
      OPERATOR: ['경영 관리', '마케팅', '운영'],
      MANAGER: ['리더십', '고객 관리', '운영 효율화'],
      FREELANCER: ['개인 브랜딩', '마케팅', '비즈니스'],
      ENTREPRENEUR: ['창업', '경영 관리', '브랜딩'],
    };

    const categories = categoryMap[userType] || categoryMap.TRAINER;

    return this.prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        category: {
          name: {
            in: categories,
          },
        },
      },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        averageRating: 'desc',
      },
      take: limit,
    });
  }
}