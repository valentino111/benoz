import { expect, test } from '@playwright/test';

async function prepareCollection(page, language = 'en') {
  await page.route('https://docs.google.com/spreadsheets/**', (route) => route.abort());
  await page.addInitScript(() => {
    HTMLImageElement.prototype.decode = function decode() {
      return Promise.resolve();
    };
  });
  await page.goto(`/gallery?collection=exhibition&lang=${language}#human-creator`);
  await expect(page.locator('#reactMigrationRoot')).toHaveAttribute('data-react-migration', 'ready');
  await expect(page.locator('#human-creator')).toBeVisible();
}

test('React lightbox opens, progressively loads, navigates, zooms, and restores focus', async ({ page }) => {
  await prepareCollection(page);

  const opener = page.locator('#human-creator .image-shield');
  await opener.click();
  const lightbox = page.getByRole('dialog', { name: 'Artwork viewer' });
  await expect(lightbox).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/lightbox-open/);
  await expect(page.locator('#site')).toHaveAttribute('inert', '');
  await expect(lightbox.getByRole('button', { name: 'Close artwork viewer' })).toBeFocused();
  await expect(lightbox.locator('img')).toHaveAttribute('alt', 'The Human Creator');
  await expect(lightbox.locator('img')).toHaveAttribute(
    'src',
    '/images/web/human-creator.webp',
  );
  await expect(lightbox.locator('.lb-count')).toHaveText('1 / 6');

  await lightbox.getByRole('button', { name: 'Next artwork' }).click();
  await expect(lightbox.locator('img')).toHaveAttribute('alt', 'A Gaze of Compassion');
  await expect(lightbox.locator('.lb-count')).toHaveText('2 / 6');

  await page.keyboard.press('ArrowRight');
  await expect(lightbox.locator('img')).toHaveAttribute('alt', 'The Light Within');
  await expect(lightbox.locator('.lb-count')).toHaveText('3 / 6');
  await page.keyboard.press('ArrowLeft');
  await expect(lightbox.locator('.lb-count')).toHaveText('2 / 6');

  const zoomReset = lightbox.getByRole('button', { name: 'Reset zoom' });
  await lightbox.getByRole('button', { name: 'Zoom in' }).click();
  await expect(zoomReset).toHaveText('125%');
  await lightbox.locator('.lb-stage').dispatchEvent('wheel', { deltaY: -100 });
  await expect(zoomReset).toHaveText('140%');
  await zoomReset.click();
  await expect(zoomReset).toHaveText('100%');

  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
  await expect(page.locator('body')).not.toHaveClass(/lightbox-open/);
  await expect(page.locator('#site')).not.toHaveAttribute('inert', '');
  await expect(opener).toBeFocused();
});

test('React lightbox localizes image labels and supports mobile swipe navigation', async ({ page }) => {
  await prepareCollection(page, 'he');

  const opener = page.locator('#human-creator .image-shield');
  await expect(opener).toHaveAccessibleName('האדם היוצר');
  await opener.click();
  const lightbox = page.getByRole('dialog', { name: 'Artwork viewer' });
  await expect(lightbox.locator('img')).toHaveAttribute('alt', 'האדם היוצר');

  await lightbox.locator('.lb-stage').evaluate((element) => {
    const touchStart = new Event('touchstart', { bubbles: true });
    Object.defineProperty(touchStart, 'touches', {
      value: [{ clientX: 260, clientY: 200 }],
    });
    element.dispatchEvent(touchStart);

    const touchEnd = new Event('touchend', { bubbles: true });
    Object.defineProperty(touchEnd, 'touches', { value: [] });
    Object.defineProperty(touchEnd, 'changedTouches', {
      value: [{ clientX: 180, clientY: 202 }],
    });
    element.dispatchEvent(touchEnd);
  });

  await expect(lightbox.locator('img')).toHaveAttribute('alt', 'מבט של חמלה');
  await expect(lightbox.locator('.lb-count')).toHaveText('2 / 6');
});
