import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');
  
  try {
    // Create browser instance for setup
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Setup test data
    console.log('📊 Setting up test data...');
    
    // Navigate to the application to ensure it's running
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:3000');
    
    // Perform any necessary authentication or data setup
    // Example: Login as admin user for admin tests
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', process.env.ADMIN_EMAIL);
      await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin/**');
      
      // Save authenticated state
      await context.storageState({ path: 'tests/e2e/storage/admin-auth.json' });
    }
    
    // Setup test users and data
    console.log('👤 Creating test users...');
    
    // You can create test data via API calls or database queries here
    // Example:
    // await setupTestUsers();
    // await setupTestCourses();
    
    await browser.close();
    
    console.log('✅ E2E test setup completed successfully');
    
  } catch (error) {
    console.error('❌ E2E test setup failed:', error);
    throw error;
  }
}

export default globalSetup;