const authFile = 'playwright/.auth/user.json'
import { test, expect } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { startTriggerTemplate } from './templateActions'

test.describe.serial('Automations', () => {
  test.use({ storageState: authFile })
  const id = uuidv4()

  test('Change check-in trigger to specific listings', async ({ page }) => {
    await startTriggerTemplate(page, id, 'Check-in')
    await page.getByRole('button', { name: 'Create template' }).click()

    await page.getByText(id).click()

    await page.getByText('Specific listings').click()
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('Template saved!')).toBeVisible()
    await page.goto('/messages')

    await page.getByText('Rando Calrissian').click()
    await page.getByText('Trip info').click()

    expect(await page.getByText(id).count()).toEqual(0)
  })

  test('Change check-in trigger back to all listings', async ({ page }) => {
    await page.goto('/automations')
    await page.getByText(id).click()

    await expect(page.getByText('Template Title')).toBeVisible()
    await page.getByText('All listings').click()
    await page.getByRole('button', { name: 'Save' }).click()

    await page.goto('/messages')

    await page.getByText('Rando Calrissian').click()
    await page.getByText('Trip info').click()

    await expect(page.getByText(id)).toBeVisible()
  })

  test('Remove check-in trigger', async ({ page }) => {
    await page.goto('/automations')
    await page.getByText(id).click()

    await page.getByRole('button', { name: 'Remove' }).click()
    await page.getByRole('button', { name: 'Save' }).click()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const row = await page.locator(`tr:has-text("${id}")`).innerHTML()
    //expect(row).toContain('No trigger') TODO: How to wait for this?

    await page.goto('/messages')

    await page.getByText('Rando Calrissian').click()
    await page.getByText('Trip info').click()

    await expect(page.getByText('Booking info')).toBeVisible()
    expect(await page.getByText(id).count()).toEqual(0)
  })

  test('Restore check-in trigger', async ({ page }) => {
    await page.goto('/automations')
    await page.getByText(id).click()

    await page.getByRole('button', { name: '+ Add Trigger' }).click()

    await page.getByPlaceholder('Select a trigger').click()
    await page.click(`div[role="option"]:has-text("Check-in")`)

    await page.getByRole('button', { name: 'Save' }).click()

    await page.goto('/messages')

    await page.getByText('Rando Calrissian').click()
    await page.getByText('Trip info').click()

    await expect(page.getByText('Booking info')).toBeVisible()
    expect(await page.getByText(id).count()).toEqual(1)
  })

  // TODO: These tests are broken until we figure out a way to locate a specific checkbox because it's in the rame row as the template name.
  // test('Disable automation', async ({ page }) => {
  //   await page.goto('/automations')
  //   await page.getByRole('checkbox').click()

  //   await page.goto('/messages')

  //   await page.getByText('Rando Calrissian').click()
  //   await page.getByText('Trip info').click()

  //   await expect(page.getByText('Scheduled messages')).toBeVisible()
  //   expect(await page.getByText(id).count()).toEqual(0)
  // })

  // test('Enable automation', async ({ page }) => {
  //   await page.goto('/automations')
  //   await page.getByRole('checkbox').click()

  //   await page.goto('/messages')

  //   await page.getByText('Rando Calrissian').click()
  //   await page.getByText('Trip info').click()

  //   await expect(page.getByText('Scheduled messages')).toBeVisible()
  //   expect(await page.getByText(id).count()).toEqual(1)
  // })
})
