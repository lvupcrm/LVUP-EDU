import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=로그인');
    await expect(page).toHaveURL('/auth/login');
    await expect(page.locator('h1')).toContainText('로그인');
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=이메일을 입력해주세요')).toBeVisible();
    await expect(page.locator('text=비밀번호를 입력해주세요')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard or home
    await expect(page).toHaveURL(/\/(dashboard|$)/);
    
    // Should show user menu or profile
    await expect(page.locator('text=안녕하세요')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=이메일 또는 비밀번호가 올바르지 않습니다')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.click('text=회원가입');
    
    await expect(page).toHaveURL('/auth/signup');
    await expect(page.locator('h1')).toContainText('회원가입');
  });

  test('should register new user', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await page.fill('input[name="name"]', '테스트 사용자');
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Should redirect to welcome or verification page
    await expect(page).toHaveURL(/\/(welcome|verify-email)/);
    await expect(page.locator('text=환영합니다')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Then logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=로그아웃');
    
    // Should redirect to home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=로그인')).toBeVisible();
  });
});