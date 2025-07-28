import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

interface CreateUserData {
  email: string;
  password?: string;
  name: string;
  nickname?: string;
  phone?: string;
  userType?: string;
  role?: string;
  avatar?: string;
  providerId?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData) {
    return this.prisma.user.create({
      data: {
        ...data,
        nickname: data.nickname || this.generateNickname(data.name),
      },
      include: {
        profile: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        instructorProfile: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        instructorProfile: true,
      },
    });
  }

  async findByNickname(nickname: string) {
    return this.prisma.user.findUnique({
      where: { nickname },
    });
  }

  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async updateProfile(id: string, data: Partial<CreateUserData>) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        profile: true,
        instructorProfile: true,
      },
    });
  }

  async isNicknameAvailable(nickname: string, excludeUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { nickname },
    });

    if (!user) return true;
    if (excludeUserId && user.id === excludeUserId) return true;
    
    return false;
  }

  private generateNickname(name: string): string {
    const timestamp = Date.now().toString().slice(-4);
    const cleanName = name.replace(/[^a-zA-Z0-9가-힣]/g, '');
    return `${cleanName}${timestamp}`;
  }
}