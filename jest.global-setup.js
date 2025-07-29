const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  console.log('🚀 Starting global test setup...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/lvup_edu_test';
  
  try {
    // Setup test database if running integration tests
    if (process.env.RUN_INTEGRATION_TESTS === 'true') {
      console.log('📊 Setting up test database...');
      
      // Run Prisma migrations for test database
      execSync('npx prisma migrate deploy', {
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
        stdio: 'inherit',
      });
      
      console.log('✅ Test database setup complete');
    }
    
    // Setup test environment
    console.log('🔧 Configuring test environment...');
    
    // Mock external services
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY = 'test-toss-key';
    
    console.log('✅ Global test setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    process.exit(1);
  }
};