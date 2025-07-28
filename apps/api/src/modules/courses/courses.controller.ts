import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: '강의 목록 조회' })
  @ApiResponse({ status: 200, description: '강의 목록 조회 성공' })
  @ApiQuery({ name: 'category', required: false, description: '카테고리 필터' })
  @ApiQuery({ name: 'level', required: false, description: '난이도 필터' })
  @ApiQuery({ name: 'isPaid', required: false, description: '유료/무료 필터' })
  @ApiQuery({ name: 'search', required: false, description: '검색어' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지 크기' })
  async getCourses(
    @Query('category') category?: string,
    @Query('level') level?: string,
    @Query('isPaid') isPaid?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.coursesService.findAll({
      category,
      level,
      isPaid: isPaid ? isPaid === 'true' : undefined,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('popular')
  @ApiOperation({ summary: '인기 강의 조회' })
  @ApiResponse({ status: 200, description: '인기 강의 조회 성공' })
  @ApiQuery({ name: 'limit', required: false, description: '조회할 강의 수' })
  async getPopularCourses(@Query('limit') limit?: string) {
    return this.coursesService.getPopularCourses(
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('recommended/:userType')
  @ApiOperation({ summary: '사용자 유형별 추천 강의' })
  @ApiResponse({ status: 200, description: '추천 강의 조회 성공' })
  @ApiQuery({ name: 'limit', required: false, description: '조회할 강의 수' })
  async getRecommendedCourses(
    @Param('userType') userType: string,
    @Query('limit') limit?: string,
  ) {
    return this.coursesService.getRecommendedCourses(
      userType,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '강의 상세 조회' })
  @ApiResponse({ status: 200, description: '강의 상세 조회 성공' })
  async getCourse(@Param('id') id: string) {
    const course = await this.coursesService.findById(id);
    if (!course) {
      throw new Error('강의를 찾을 수 없습니다.');
    }
    return course;
  }
}