import type { Page } from '@playwright/test/types/test'

export async function startTriggerTemplate(
  page: Page,
  title: string,
  type: 'Check-in' | 'Checkout'
) {
  await page.goto('/automations')
  await page.getByRole('link', { name: 'New template' }).click()

  await page.getByPlaceholder('e.g. Welcome message').fill(title)
  await page.type('css=[contenteditable]', 'Text')

  await page.getByRole('button', { name: '+ Add Trigger' }).click()

  await page.getByPlaceholder('Select a trigger').click()
  await page.click(`div[role="option"]:has-text("${type}")`)
}
