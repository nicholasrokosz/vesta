const authFile = 'playwright/.auth/user.json'
import { test, expect } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { startTriggerTemplate } from './templateActions'

test.describe('Automations', () => {
  test.use({ storageState: authFile })

  test('Create canned all listings', async ({ page }) => {
    const id = uuidv4()
    await page.goto('/automations')
    await page.getByRole('link', { name: 'New template' }).click()

    await page.getByPlaceholder('e.g. Welcome message').fill(id)
    await page.type('css=[contenteditable]', 'Text')

    await page.getByRole('button', { name: 'Create template' }).click()

    await expect(page.getByText('Template created!')).toBeVisible()
    await expect(page.getByText(id)).toBeVisible()

    const row = await page.locator(`tr:has-text("${id}")`).innerHTML()
    expect(row).toContain('No trigger')
    expect(row).toContain('All listings')

    await page.goto('/messages')

    await page.getByText('Rando Calrissian').click()
    await page.getByAltText('Send canned message').click()
    await expect(page.getByText(id)).toBeVisible()
  })

  test('Create checkin trigger all listings', async ({ page }) => {
    const id = uuidv4()
    await startTriggerTemplate(page, id, 'Check-in')

    await page.getByRole('button', { name: 'Create template' }).click()

    await expect(page.getByText(id)).toBeVisible()
    const row = await page.locator(`tr:has-text("${id}")`).innerHTML()
    expect(row).toContain('Check-in')
    expect(row).toContain('All listings')

    await page.goto('/messages')
    await page.getByText('Rando Calrissian').click()
    await page.getByText('Trip info').click()

    await expect(page.getByText(id)).toBeVisible()
  })

  test('Create checkout trigger all listings', async ({ page }) => {
    const id = uuidv4()
    await startTriggerTemplate(page, id, 'Checkout')

    await page.getByRole('button', { name: 'Create template' }).click()

    await expect(page.getByText(id)).toBeVisible()
    const row = await page.locator(`tr:has-text("${id}")`).innerHTML()
    expect(row).toContain('Checkout')
    expect(row).toContain('All listings')

    await page.goto('/messages')
    await page.getByText('Rando Calrissian').click()
    await page.getByText('Trip info').click()

    await expect(page.getByText(id)).toBeVisible()
  })

  test('Create checkin trigger specific listing', async ({ page }) => {
    const id = uuidv4()
    await startTriggerTemplate(page, id, 'Check-in')

    await page.getByText('Specific listings').click()
    await page.getByPlaceholder('Pick listings').click()
    await page.click(`div[role="option"]:has-text("Paisley Park")`)

    await page.getByRole('button', { name: 'Create template' }).click()

    await expect(page.getByText(id)).toBeVisible()
    const row = await page.locator(`tr:has-text("${id}")`).innerHTML()
    expect(row).toContain('Check-in')
    expect(row).toContain('Paisley Park')

    await page.goto('/messages')
    await page.getByText('Rando Calrissian').click()
    await page.getByText('Trip info').click()

    await expect(page.getByText(id)).toBeVisible()
  })

  test('Create checkin trigger specific, none selected', async ({ page }) => {
    const id = uuidv4()
    await startTriggerTemplate(page, id, 'Check-in')

    await page.getByText('Specific listings').click()

    await page.getByRole('button', { name: 'Create template' }).click()

    await expect(page.getByText(id)).toBeVisible()
    const row = await page.locator(`tr:has-text("${id}")`).innerHTML()
    expect(row).toContain('Check-in')
    expect(row).not.toContain('Paisley Park')

    await page.goto('/messages')
    await page.getByText('Rando Calrissian').click()
    await page.getByText('Trip info').click()

    expect(await page.getByText(id).count()).toEqual(0)
  })
})
