import nodemailer from 'nodemailer'

// 이메일 설정 타입
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// 이메일 템플릿 타입
interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

// 환경 변수에서 이메일 설정 가져오기
const getEmailConfig = (): EmailConfig => {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  }
}

// 트랜스포터 생성
const createTransporter = () => {
  const config = getEmailConfig()
  return nodemailer.createTransporter(config)
}

// 이메일 전송 함수
export async function sendEmail(
  to: string | string[],
  template: EmailTemplate,
  from?: string
) {
  try {
    const transporter = createTransporter()
    const fromAddress = from || process.env.SMTP_FROM || 'LVUP EDU <noreply@lvupedu.com>'

    const mailOptions = {
      from: fromAddress,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: template.subject,
      html: template.html,
      text: template.text
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }

  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 이메일 템플릿들
export const emailTemplates = {
  // 회원가입 환영 메일
  welcome: (name: string, loginUrl: string): EmailTemplate => ({
    subject: '🎉 LVUP EDU에 오신 것을 환영합니다!',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">환영합니다! 🎉</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">피트니스 전문가로 성장하는 여정을 시작하세요</p>
        </div>
        
        <div style="padding: 40px 20px; background-color: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">안녕하세요, ${name}님!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            LVUP EDU 회원가입을 완료해주셔서 감사합니다. 
            이제 전문가들의 노하우가 담긴 다양한 강의를 수강하실 수 있습니다.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">🎁 신규 회원 특별 혜택</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>첫 강의 30% 할인 (7일간 유효)</li>
              <li>모든 강의 첫 번째 레슨 무료 체험</li>
              <li>전문가 1:1 학습 상담</li>
              <li>피트니스 전문가 커뮤니티 액세스</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              지금 시작하기
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            문의사항이 있으시면 언제든 <a href="mailto:support@lvupedu.com" style="color: #667eea;">support@lvupedu.com</a>으로 연락해주세요.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">© 2024 LVUP EDU. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">이 메일은 회원가입 완료 안내를 위해 발송되었습니다.</p>
        </div>
      </div>
    `,
    text: `
      안녕하세요, ${name}님!
      
      LVUP EDU 회원가입을 완료해주셔서 감사합니다.
      이제 전문가들의 노하우가 담긴 다양한 강의를 수강하실 수 있습니다.
      
      신규 회원 특별 혜택:
      - 첫 강의 30% 할인 (7일간 유효)
      - 모든 강의 첫 번째 레슨 무료 체험
      - 전문가 1:1 학습 상담
      - 피트니스 전문가 커뮤니티 액세스
      
      지금 시작하기: ${loginUrl}
      
      문의: support@lvupedu.com
    `
  }),

  // 결제 완료 메일
  paymentSuccess: (
    name: string, 
    courseTitle: string, 
    amount: number, 
    orderNumber: string,
    courseUrl: string
  ): EmailTemplate => ({
    subject: `✅ 결제가 완료되었습니다 - ${courseTitle}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background-color: #10b981; padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">결제 완료! ✅</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">강의 수강을 시작하세요</p>
        </div>
        
        <div style="padding: 40px 20px; background-color: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">안녕하세요, ${name}님!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            <strong>"${courseTitle}"</strong> 강의 결제가 성공적으로 완료되었습니다.
            이제 언제든지 강의를 수강하실 수 있습니다.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 결제 정보</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">주문번호:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">강의명:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${courseTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">결제금액:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">₩${amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">결제일시:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${new Date().toLocaleString('ko-KR')}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${courseUrl}" style="background-color: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              강의 수강하기
            </a>
          </div>
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              💡 <strong>참고사항:</strong> 강의는 평생 수강 가능하며, 수료 시 공식 인증서가 발급됩니다.
            </p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">© 2024 LVUP EDU. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">영수증은 마이페이지에서 다운로드 받으실 수 있습니다.</p>
        </div>
      </div>
    `,
    text: `
      안녕하세요, ${name}님!
      
      "${courseTitle}" 강의 결제가 성공적으로 완료되었습니다.
      
      결제 정보:
      - 주문번호: ${orderNumber}
      - 강의명: ${courseTitle}
      - 결제금액: ₩${amount.toLocaleString()}
      - 결제일시: ${new Date().toLocaleString('ko-KR')}
      
      강의 수강하기: ${courseUrl}
      
      참고: 강의는 평생 수강 가능하며, 수료 시 공식 인증서가 발급됩니다.
    `
  }),

  // 비밀번호 재설정 메일
  passwordReset: (name: string, resetUrl: string): EmailTemplate => ({
    subject: '🔐 LVUP EDU 비밀번호 재설정',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background-color: #f59e0b; padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">비밀번호 재설정</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">안전하게 비밀번호를 변경하세요</p>
        </div>
        
        <div style="padding: 40px 20px; background-color: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">안녕하세요, ${name}님!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            비밀번호 재설정을 요청하셨습니다. 
            아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
          </p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              ⚠️ <strong>보안을 위해 이 링크는 24시간 후 만료됩니다.</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              비밀번호 재설정
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            만약 비밀번호 재설정을 요청하지 않으셨다면, 이 메일을 무시하셔도 됩니다.
            계정의 보안이 우려되신다면 <a href="mailto:support@lvupedu.com" style="color: #f59e0b;">support@lvupedu.com</a>으로 연락해주세요.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">© 2024 LVUP EDU. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      안녕하세요, ${name}님!
      
      비밀번호 재설정을 요청하셨습니다.
      아래 링크를 클릭하여 새로운 비밀번호를 설정해주세요.
      
      비밀번호 재설정: ${resetUrl}
      
      ⚠️ 보안을 위해 이 링크는 24시간 후 만료됩니다.
      
      만약 비밀번호 재설정을 요청하지 않으셨다면, 이 메일을 무시하셔도 됩니다.
      문의: support@lvupedu.com
    `
  }),

  // 강의 완료 축하 메일
  courseCompletion: (
    name: string, 
    courseTitle: string, 
    certificateUrl: string
  ): EmailTemplate => ({
    subject: `🏆 축하드립니다! "${courseTitle}" 강의를 완료하셨습니다`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">축하드립니다! 🏆</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">강의 완료 및 수료증 발급</p>
        </div>
        
        <div style="padding: 40px 20px; background-color: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">${name}님, 정말 대단합니다!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <strong>"${courseTitle}"</strong> 강의를 성공적으로 완료하셨습니다.
            꾸준한 학습으로 전문성을 한층 더 키우셨네요!
          </p>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #92400e; margin-top: 0;">🎖️ 수료증 발급 완료</h3>
            <p style="color: #92400e; margin-bottom: 15px;">공식 수료증을 다운로드하여 커리어에 활용하세요!</p>
            <a href="${certificateUrl}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              수료증 다운로드
            </a>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">🚀 다음 단계를 위한 추천</h3>
            <ul style="color: #1e40af; line-height: 1.6;">
              <li>관련 심화 강의로 전문성 확장</li>
              <li>실습 프로젝트로 실무 경험 쌓기</li>
              <li>커뮤니티에서 동료들과 경험 공유</li>
              <li>강사진과의 1:1 멘토링 신청</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            학습 과정에서 궁금한 점이 있으시면 언제든 
            <a href="mailto:support@lvupedu.com" style="color: #667eea;">support@lvupedu.com</a>으로 연락해주세요.
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">© 2024 LVUP EDU. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">계속해서 성장하는 ${name}님을 응원합니다!</p>
        </div>
      </div>
    `,
    text: `
      ${name}님, 정말 대단합니다!
      
      "${courseTitle}" 강의를 성공적으로 완료하셨습니다.
      꾸준한 학습으로 전문성을 한층 더 키우셨네요!
      
      🎖️ 수료증이 발급되었습니다!
      수료증 다운로드: ${certificateUrl}
      
      다음 단계를 위한 추천:
      - 관련 심화 강의로 전문성 확장
      - 실습 프로젝트로 실무 경험 쌓기
      - 커뮤니티에서 동료들과 경험 공유
      - 강사진과의 1:1 멘토링 신청
      
      문의: support@lvupedu.com
      계속해서 성장하는 ${name}님을 응원합니다!
    `
  })
}

// 이메일 전송 헬퍼 함수들
export const emailHelpers = {
  // 회원가입 환영 메일 전송
  sendWelcomeEmail: async (email: string, name: string) => {
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login`
    const template = emailTemplates.welcome(name, loginUrl)
    return await sendEmail(email, template)
  },

  // 결제 완료 메일 전송
  sendPaymentSuccessEmail: async (
    email: string, 
    name: string, 
    courseTitle: string,
    amount: number,
    orderNumber: string,
    courseId: string
  ) => {
    const courseUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/courses/${courseId}`
    const template = emailTemplates.paymentSuccess(name, courseTitle, amount, orderNumber, courseUrl)
    return await sendEmail(email, template)
  },

  // 비밀번호 재설정 메일 전송
  sendPasswordResetEmail: async (email: string, name: string, resetToken: string) => {
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${resetToken}`
    const template = emailTemplates.passwordReset(name, resetUrl)
    return await sendEmail(email, template)
  },

  // 강의 완료 축하 메일 전송
  sendCourseCompletionEmail: async (
    email: string, 
    name: string, 
    courseTitle: string,
    certificateId: string
  ) => {
    const certificateUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/certificates/${certificateId}`
    const template = emailTemplates.courseCompletion(name, courseTitle, certificateUrl)
    return await sendEmail(email, template)
  }
}