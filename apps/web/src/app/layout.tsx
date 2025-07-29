import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'LVUP EDU - 피트니스 전문가 교육 플랫폼',
    template: '%s | LVUP EDU',
  },
  description:
    '피트니스 전문가를 위한 최고의 온라인 교육 플랫폼. 현장 전문가들의 노하우를 배우고 자격증을 취득하세요. 트레이너 교육, 센터 운영, 창업 가이드까지.',
  keywords: [
    '피트니스 교육',
    '트레이너 교육',
    '피트니스 자격증',
    '센터 운영',
    '헬스장 창업',
    '온라인 강의',
    'CPT 자격증',
    '피트니스 전문가',
    '운동 지도',
    '피트니스 센터',
    'CES',
    'CEC',
    '트레이너 양성',
    '피트니스 비즈니스',
  ],
  authors: [{ name: 'LVUP EDU' }],
  creator: 'LVUP EDU',
  publisher: 'LVUP EDU',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://lvup-edu-web-h1ln-psi.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    title: 'LVUP EDU - 피트니스 전문가 교육 플랫폼',
    description:
      '피트니스 전문가를 위한 최고의 온라인 교육 플랫폼. 현장 전문가들의 노하우를 배우고 자격증을 취득하세요.',
    siteName: 'LVUP EDU',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LVUP EDU - 피트니스 전문가 교육 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LVUP EDU - 피트니스 전문가 교육 플랫폼',
    description:
      '피트니스 전문가를 위한 최고의 온라인 교육 플랫폼. 현장 전문가들의 노하우를 배우고 자격증을 취득하세요.',
    images: ['/og-image.jpg'],
    creator: '@lvupedu',
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
  verification: {
    // google: process.env.GOOGLE_VERIFICATION_ID,
    // other: {
    //   'naver-site-verification': process.env.NAVER_VERIFICATION_ID || '',
    // },
  },
  category: 'education',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko' suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin=''
        />

        {/* DNS prefetch for external resources */}
        <link rel='dns-prefetch' href='//api.tosspayments.com' />
        <link rel='dns-prefetch' href='//supabase.co' />

        {/* Favicon and app icons */}
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='icon' href='/icon.svg' type='image/svg+xml' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />

        {/* Theme colors for mobile browsers */}
        <meta name='theme-color' content='#667eea' />
        <meta name='msapplication-TileColor' content='#667eea' />

        {/* Structured Data for Organization */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'LVUP EDU',
              description: '피트니스 전문가를 위한 온라인 교육 플랫폼',
              url: 'https://lvup-edu-web-h1ln-psi.vercel.app',
              logo: 'https://lvup-edu-web-h1ln-psi.vercel.app/logo.png',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+82-2-1234-5678',
                contactType: 'customer service',
                availableLanguage: 'Korean',
              },
              sameAs: [
                'https://www.instagram.com/lvupedu',
                'https://www.youtube.com/@lvupedu',
                'https://blog.lvupedu.com',
              ],
            }),
          }}
        />

        {/* Structured Data for Educational Organization */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'LVUP EDU',
              description: '피트니스 전문가를 위한 온라인 교육 플랫폼',
              url: 'https://lvup-edu-web-h1ln-psi.vercel.app',
              logo: 'https://lvup-edu-web-h1ln-psi.vercel.app/logo.png',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'KR',
                addressRegion: 'Seoul',
              },
              offers: {
                '@type': 'Offer',
                category: 'Education',
                priceCurrency: 'KRW',
                availability: 'https://schema.org/InStock',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>

        {/* 에러 추적을 위한 글로벌 에러 핸들러 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 글로벌 에러 캐처
              window.addEventListener('error', function(e) {
                console.error('Global Error:', {
                  message: e.message,
                  filename: e.filename,
                  lineno: e.lineno,
                  colno: e.colno,
                  error: e.error ? e.error.stack : 'No stack trace'
                });
                
                // Vercel Analytics 또는 Sentry로 전송 (추후 추가)
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'exception', {
                    description: e.message,
                    fatal: false
                  });
                }
              });

              // Promise rejection 캐처
              window.addEventListener('unhandledrejection', function(e) {
                console.error('Unhandled Promise Rejection:', {
                  reason: e.reason,
                  promise: e.promise
                });
                
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'exception', {
                    description: 'Unhandled Promise: ' + (e.reason ? e.reason.toString() : 'Unknown'),
                    fatal: false
                  });
                }
              });

              // React 에러 경계에서 발생하는 에러
              window.addEventListener('reactError', function(e) {
                console.error('React Error Boundary:', e.detail);
              });
            `,
          }}
        />

        {/* Google Analytics - 임시 비활성화 */}
        {/* {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )} */}
      </body>
    </html>
  );
}
