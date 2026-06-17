import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("WE G(A)T NEWS – Die Schülerzeitung am Altenforst");
});

test('Informativ link', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Click the get started link.
  await page.getByRole('navigation').getByRole('link', { name: 'Informativ📖' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Informativ 📖' })).toBeVisible();
});
