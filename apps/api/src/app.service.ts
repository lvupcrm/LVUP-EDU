import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      message: '🚀 LVUP EDU API가 정상적으로 작동중입니다!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected', // TODO: 실제 DB 연결 상태 체크
        redis: 'connected',    // TODO: 실제 Redis 연결 상태 체크  
        aws: 'connected',      // TODO: 실제 AWS 연결 상태 체크
      },
    };
  }

  getVersion() {
    return {
      version: '1.0.0',
      name: 'LVUP EDU API',
      description: '피트니스 종합 교육 플랫폼 API',
      author: 'LVUP EDU Team',
      docs: '/api/docs',
    };
  }
}