import { test, expect } from '@playwright/test';
import { getAllPosts } from "../lib/posts";

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("WE G(A)T NEWS – Die Schülerzeitung am Altenforst");
});

test("Navbar links", async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Click the get started link.
  await page.getByRole('navigation').getByRole('link', { name: 'Informativ📖' }).click();
  await expect(page.getByRole('heading', { name: 'Informativ 📖' })).toBeVisible();

  await page.getByRole('navigation').getByRole('link', { name: 'Meinung💣' }).click();
  await expect(page.getByRole('heading', { name: 'Meinung 💣' })).toBeVisible();

  await page.getByRole('navigation').getByRole('link', { name: 'Umfragen🎤' }).click();
  await expect(page.getByRole('heading', { name: 'Umfragen 🎤' })).toBeVisible();

  await page.getByRole('navigation').getByRole('link', { name: 'Buchrezensionen📕' }).click();
  await expect(page.getByRole('heading', { name: 'Buchrezensionen 📕' })).toBeVisible();

  await page.getByRole('navigation').getByRole('link', { name: 'Mach mit👋' }).click();
  await expect(page.getByRole('heading', { name: 'Ideen, Artikel, Probleme, Fragen?' })).toBeVisible();
});

// test("Tags", async ({ page }) => {
//   await page.goto('http://localhost:3000/');

//   let newestPost = getAllPosts()[0];
//   console.log(newestPost);

//   await page.getByRole("link", { name: newestPost.tag }).click();
//   await expect(page.getByText(newestPost.tags)).toBeVisible();
// });
