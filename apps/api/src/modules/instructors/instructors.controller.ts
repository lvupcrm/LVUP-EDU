import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InstructorsService } from './instructors.service';

@ApiTags('Instructors')
@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Get(':id')
  @ApiOperation({ summary: '강사 프로필 조회' })
  @ApiParam({ name: 'id', description: '강사 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '강사 프로필 정보를 반환합니다' 
  })
  @ApiResponse({ 
    status: 404, 
    description: '강사를 찾을 수 없습니다' 
  })
  async getInstructor(@Param('id') id: string) {
    return this.instructorsService.findById(id);
  }
}