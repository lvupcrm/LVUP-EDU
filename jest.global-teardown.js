const { execSync } = require('child_process');

module.exports = async () => {
  console.log('🧹 Starting global test teardown...');
  
  try {
    if (process.env.RUN_INTEGRATION_TESTS === 'true') {
      console.log('🗑️ Cleaning up test database...');
      
      // Clean up test database
      execSync('npx prisma migrate reset --force', {
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
        stdio: 'inherit',
      });
      
      console.log('✅ Test database cleanup complete');
    }
    
    console.log('✅ Global test teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    // Don't exit with error code in teardown to avoid masking test failures
  }
};