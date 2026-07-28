import { expect, test } from '@playwright/test';

async function prepareCollection(page, language = 'en') {
  await page.route('https://docs.google.com/spreadsheets/**', (route) => route.abort());
  await page.addInitScript(() => {
    window.__artworkScrolls = [];
    Element.prototype.scrollIntoView = function scrollIntoView(options) {
      window.__artworkScrolls.push({ id: this.id, options });
    };
  });
  await page.goto(`/gallery?collection=exhibition&lang=${language}#human-creator`);
  await expect(page.locator('#reactMigrationRoot')).toHaveAttribute('data-react-migration', 'ready');
  await expect(page.locator('#human-creator')).toBeVisible();
  await page.evaluate(() => { window.__artworkScrolls = []; });
}

test('Previous and Next update the shareable artwork URL and preserve boundaries', async ({ page }) => {
  await prepareCollection(page);

  const first = page.locator('#human-creator');
  await expect(first.locator('.art-prev')).toBeDisabled();
  await expect(first.locator('.art-next')).toBeEnabled();

  await first.locator('.art-next').click();
  await expect(page).toHaveURL(/#gaze-of-compassion$/);
  await expect.poll(() => page.evaluate(() => window.__artworkScrolls.at(-1))).toEqual({
    id: 'gaze-of-compassion',
    options: { behavior: 'smooth', block: 'center' },
  });

  const second = page.locator('#gaze-of-compassion');
  await expect(second.locator('.art-prev')).toBeEnabled();
  await second.locator('.art-prev').click();
  await expect(page).toHaveURL(/#human-creator$/);

  const last = page.locator('#gate-to-infinity');
  await expect(last.locator('.art-next')).toBeDisabled();
});

test('hash changes and mobile swipes are handled by React in both languages', async ({ page }) => {
  await prepareCollection(page, 'he');

  await page.evaluate(() => { window.location.hash = 'inner-light'; });
  await expect.poll(() => page.evaluate(() => window.__artworkScrolls.at(-1))).toEqual({
    id: 'inner-light',
    options: { behavior: 'auto', block: 'start' },
  });

  const first = page.locator('#human-creator');
  await expect(first.locator('.art-next')).toContainText('הבאה');
  await first.evaluate((element) => {
    const touchStart = new Event('touchstart', { bubbles: true });
    Object.defineProperty(touchStart, 'touches', {
      value: [{ clientX: 250, clientY: 200 }],
    });
    element.dispatchEvent(touchStart);

    const touchEnd = new Event('touchend', { bubbles: true });
    Object.defineProperty(touchEnd, 'changedTouches', {
      value: [{ clientX: 150, clientY: 205 }],
    });
    element.dispatchEvent(touchEnd);
  });

  await expect(page).toHaveURL(/#gaze-of-compassion$/);
  await expect.poll(() => page.evaluate(() => window.__artworkScrolls.at(-1))).toEqual({
    id: 'gaze-of-compassion',
    options: { behavior: 'smooth', block: 'start' },
  });
});
