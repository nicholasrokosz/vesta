const authFile = 'playwright/.auth/user.json'
import { test, expect } from '@playwright/test'

test.describe('Listings', () => {
  test.use({ storageState: authFile })
  test('Filter listings', async ({ page }) => {
    await page.goto('/listings')
    await expect(page.getByText('Paisley Park')).toBeVisible()

    await page.getByPlaceholder('Search Listings').fill('g')
    expect(await page.getByText('Paisley Park').count()).toEqual(0)

    await page.getByPlaceholder('Search Listings').fill('pai')
    expect(await page.getByText('Paisley Park').count()).toEqual(1)
  })
})
