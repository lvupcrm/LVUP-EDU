/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'lvupedu.s3.amazonaws.com',
      'lvupedu.s3.ap-northeast-2.amazonaws.com',
    ],
  },
  env: {
    CUSTOM_KEY: 'lvup-edu-platform',
  },
  // 인프런 스타일 SEO 최적화
  async rewrites() {
    return [
      {
        source: '/course/:slug',
        destination: '/courses/:slug',
      },
      {
        source: '/instructor/:slug', 
        destination: '/instructors/:slug',
      },
    ];
  },
  // 성능 최적화
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig