# Node.js 18 Alpine 이미지 사용
FROM node:18-alpine AS base

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 매니저 설정
RUN npm install -g pnpm

# Dependencies 단계
FROM base AS deps
COPY package*.json ./
COPY pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Builder 단계
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma 클라이언트 생성
RUN npx prisma generate

# 애플리케이션 빌드
RUN pnpm build

# Production 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# 비루트 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# 빌드된 애플리케이션 복사
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

# 포트 노출
EXPOSE 8000

# 애플리케이션 시작
CMD ["node", "dist/main"]