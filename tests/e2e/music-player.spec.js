import { expect, test } from '@playwright/test';

async function prepareGallery(page, language = 'en') {
  await page.route('https://docs.google.com/spreadsheets/**', (route) => route.abort());
  await page.addInitScript(() => {
    const mediaState = new WeakMap();
    const stateFor = (media) => {
      if (!mediaState.has(media)) mediaState.set(media, { paused: true });
      return mediaState.get(media);
    };

    Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
      configurable: true,
      get() {
        return stateFor(this).paused;
      },
    });

    HTMLMediaElement.prototype.play = function play() {
      stateFor(this).paused = false;
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function pause() {
      const state = stateFor(this);
      if (state.paused) return;
      state.paused = true;
      this.dispatchEvent(new Event('pause'));
    };
  });

  await page.goto(`/gallery?collection=exhibition&lang=${language}#hidden-harmony`);
  await expect(page.locator('#reactMigrationRoot')).toHaveAttribute('data-react-migration', 'ready');
}

test('artwork song buttons play directly and coordinate through one audio element', async ({ page }) => {
  await prepareGallery(page);

  const firstPlay = page.locator('#hidden-harmony .artwork-soundtrack button');
  const secondPlay = page.locator('#inner-light .artwork-soundtrack button');
  await expect(firstPlay).toHaveAccessibleName('Play Lihyot');
  await expect(secondPlay).toHaveAccessibleName('Play Yofi Hu Koach Atzum');

  const initialUrl = page.url();
  await firstPlay.click();
  await expect(firstPlay).toHaveAttribute('aria-pressed', 'true');
  await expect(firstPlay).toHaveAccessibleName('Pause Lihyot');
  expect(page.url()).toBe(initialUrl);

  await secondPlay.click();
  await expect(secondPlay).toHaveAttribute('aria-pressed', 'true');
  await expect(firstPlay).toHaveAttribute('aria-pressed', 'false');

  await secondPlay.click();
  await expect(secondPlay).toHaveAttribute('aria-pressed', 'false');
});

test('Hebrew artwork controls use the localized song title', async ({ page }) => {
  await prepareGallery(page, 'he');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#hidden-harmony .artwork-soundtrack button'))
    .toHaveAccessibleName('Play לחיות');
});

test('the retired music URL redirects to the gallery selection', async ({ page }) => {
  await page.route('https://docs.google.com/spreadsheets/**', (route) => route.abort());
  await page.goto('/music');
  await expect(page.locator('#reactMigrationRoot')).toHaveAttribute('data-react-migration', 'ready');
  await expect(page).toHaveURL(/\/gallery$/);
  await expect(page.locator('#projectHub')).toBeVisible();
  await expect(page.locator('#mainMenu a[href="/music"]')).toHaveCount(0);
});
