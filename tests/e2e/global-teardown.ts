import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test teardown...');
  
  try {
    // Clean up authentication storage
    const storagePath = path.join(__dirname, 'storage');
    if (fs.existsSync(storagePath)) {
      fs.rmSync(storagePath, { recursive: true, force: true });
      console.log('🗑️ Cleaned up authentication storage');
    }
    
    // Clean up uploaded test files
    const uploadsPath = path.join(__dirname, '../../apps/web/public/test-uploads');
    if (fs.existsSync(uploadsPath)) {
      fs.rmSync(uploadsPath, { recursive: true, force: true });
      console.log('🗑️ Cleaned up test uploads');
    }
    
    // Reset test database if needed
    if (process.env.RESET_DB_AFTER_E2E === 'true') {
      console.log('🗄️ Resetting test database...');
      try {
        execSync('pnpm run db:reset --force', {
          env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
          stdio: 'inherit',
        });
        console.log('✅ Test database reset complete');
      } catch (dbError) {
        console.warn('⚠️ Database reset failed (non-critical):', dbError);
      }
    }
    
    // Generate test report summary
    console.log('📊 Generating test report summary...');
    
    console.log('✅ E2E test teardown completed successfully');
    
  } catch (error) {
    console.error('❌ E2E test teardown failed:', error);
    // Don't throw error to avoid masking test failures
  }
}

export default globalTeardown;