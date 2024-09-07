// auth.setup.ts
import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('http://localhost:3000/en/calendar')
  await page
    .getByLabel('Email address')
    .fill('test-users+mikegreenfield@getvesta.io')
  await page.getByLabel('Password').fill('CVZ9cjw*qgf8ufe_awu')
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByText('Create new event')).toBeVisible()
  await page.context().storageState({ path: authFile })
})
