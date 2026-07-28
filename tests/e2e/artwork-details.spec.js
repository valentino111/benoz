import { expect, test } from '@playwright/test';

async function prepareCollection(page, language = 'en') {
  await page.route('https://docs.google.com/spreadsheets/**', (route) => route.abort());
  await page.goto(`/gallery?collection=exhibition&lang=${language}#human-creator`);
  await expect(page.locator('#reactMigrationRoot')).toHaveAttribute('data-react-migration', 'ready');
  await expect(page.locator('#human-creator')).toBeVisible();
}

test('artwork details open and close through React with the existing collector content', async ({ page }) => {
  await prepareCollection(page);

  await page.locator('#human-creator .details-btn').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'The Human Creator' })).toBeVisible();
  await expect(dialog.locator('.dialog-status [data-lang="en"]')).toHaveText('Original Artwork • Available');
  await expect(dialog.locator('.dialog-description [data-lang="en"]')).toContainText(
    'Every creation begins with a question.',
  );
  await expect(dialog.locator('.dialog-price')).toHaveText('₪3,400');
  await expect(dialog.locator('.whatsapp')).toHaveAttribute(
    'href',
    /text=Hello%2C%20I%20am%20interested%20in%20%22The%20Human%20Creator%22%20\(%E2%82%AA3%2C400\)\./,
  );

  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toBeHidden();

  await page.locator('#human-creator .details-btn').click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('artwork details preserve Hebrew copy and unavailable-work behavior', async ({ page }) => {
  await prepareCollection(page, 'he');

  await page.locator('#human-creator .details-btn').click();
  let dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'האדם היוצר' })).toBeVisible();
  await expect(dialog.locator('.dialog-status [data-lang="he"]')).toHaveText('יצירה מקורית • זמינה');
  await dialog.getByRole('button', { name: 'Close' }).click();

  await page.locator('#fragility-of-love .details-btn').click();
  dialog = page.getByRole('dialog');
  await expect(dialog.locator('.dialog-status [data-lang="he"]')).toHaveText(
    'יצירה מתוך הסדרה • אינה מוצעת למכירה בתערוכה זו',
  );
  await expect(dialog.locator('.dialog-price')).toHaveCount(0);
  await expect(dialog.locator('.whatsapp')).toHaveAttribute(
    'href',
    /text=Hello%2C%20I%20would%20like%20more%20information%20about%20%22The%20Fragility%20of%20Love%22\./,
  );
});
