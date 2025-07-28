import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LVUP EDU - 피트니스 전문 교육 플랫폼',
  description: '피트니스 트레이너와 센터 운영자를 위한 실전 중심 교육 플랫폼',
  keywords: ['피트니스', '트레이너 교육', '센터 운영', '자격증', 'CPT', 'CES'],
  authors: [{ name: 'LVUP EDU Team' }],
  creator: 'LVUP EDU',
  publisher: 'LVUP EDU',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://lvupedu.com',
    title: 'LVUP EDU - 피트니스 전문 교육 플랫폼',
    description: '현장 전문가가 가르치는 실전 중심 피트니스 교육',
    siteName: 'LVUP EDU',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LVUP EDU 피트니스 교육 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LVUP EDU - 피트니스 전문 교육 플랫폼',
    description: '현장 전문가가 가르치는 실전 중심 피트니스 교육',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}