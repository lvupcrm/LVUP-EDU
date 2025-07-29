import { test, expect } from '@playwright/test';

test.describe('Courses', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display course list on homepage', async ({ page }) => {
    await expect(page.locator('[data-testid="course-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-card"]').first()).toBeVisible();
  });

  test('should filter courses by category', async ({ page }) => {
    await page.goto('/courses');
    
    // Click on a category filter
    await page.click('[data-testid="filter-category-fitness"]');
    
    // Wait for filtered results
    await page.waitForLoadState('networkidle');
    
    // Verify filtered courses are displayed
    const courseCards = page.locator('[data-testid="course-card"]');
    await expect(courseCards.first()).toBeVisible();
    
    // Verify filter is active
    await expect(page.locator('[data-testid="filter-category-fitness"]')).toHaveClass(/active/);
  });

  test('should search courses', async ({ page }) => {
    await page.goto('/courses');
    
    await page.fill('[data-testid="search-input"]', '요가');
    await page.click('[data-testid="search-button"]');
    
    await page.waitForLoadState('networkidle');
    
    // Verify search results
    const courseCards = page.locator('[data-testid="course-card"]');
    await expect(courseCards.first()).toBeVisible();
    
    // Verify course titles contain search term
    const firstCourseTitle = courseCards.first().locator('h3');
    await expect(firstCourseTitle).toContainText('요가', { ignoreCase: true });
  });

  test('should navigate to course detail page', async ({ page }) => {
    await page.goto('/courses');
    
    const firstCourse = page.locator('[data-testid="course-card"]').first();
    const courseTitle = await firstCourse.locator('h3').textContent();
    
    await firstCourse.click();
    
    // Should navigate to course detail page
    await expect(page).toHaveURL(/\/courses\/[^\/]+$/);
    
    // Should display course information
    await expect(page.locator('h1')).toContainText(courseTitle || '');
    await expect(page.locator('[data-testid="course-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-curriculum"]')).toBeVisible();
  });

  test('should display course lessons', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    
    // Should show lessons list
    await expect(page.locator('[data-testid="lesson-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="lesson-item"]').first()).toBeVisible();
    
    // Lesson should have title and duration
    const firstLesson = page.locator('[data-testid="lesson-item"]').first();
    await expect(firstLesson.locator('[data-testid="lesson-title"]')).toBeVisible();
    await expect(firstLesson.locator('[data-testid="lesson-duration"]')).toBeVisible();
  });

  test('should show course pricing and purchase button', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    
    // Should show pricing information
    await expect(page.locator('[data-testid="course-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="purchase-button"]')).toBeVisible();
  });

  test('should require authentication for course purchase', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    
    await page.click('[data-testid="purchase-button"]');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('text=로그인이 필요합니다')).toBeVisible();
  });

  test('should display instructor information', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    
    // Should show instructor section
    await expect(page.locator('[data-testid="instructor-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="instructor-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="instructor-bio"]')).toBeVisible();
  });

  test('should show course reviews', async ({ page }) => {
    await page.goto('/courses');
    await page.locator('[data-testid="course-card"]').first().click();
    
    // Navigate to reviews tab
    await page.click('[data-testid="reviews-tab"]');
    
    // Should show reviews section
    await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-rating"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/courses');
    
    // Should display mobile-friendly layout
    await expect(page.locator('[data-testid="mobile-course-grid"]')).toBeVisible();
    
    // Course cards should be stacked vertically
    const courseCards = page.locator('[data-testid="course-card"]');
    const firstCard = courseCards.first();
    const secondCard = courseCards.nth(1);
    
    const firstCardBox = await firstCard.boundingBox();
    const secondCardBox = await secondCard.boundingBox();
    
    // Second card should be below first card (higher y position)
    expect(secondCardBox?.y).toBeGreaterThan(firstCardBox?.y || 0);
  });
});