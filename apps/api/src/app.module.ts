import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Common modules
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { InstructorsModule } from './modules/instructors/instructors.module';

// Configuration
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 설정 모듈
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1분
        limit: 100, // 100 requests per minute
      },
    ]),

    // 스케줄러 (자격증 만료 알림 등)
    ScheduleModule.forRoot(),

    // 공통 모듈
    PrismaModule,

    // 비즈니스 모듈
    AuthModule,
    UsersModule,
    CoursesModule,
    InstructorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}