import { expect, test } from '@playwright/test';

async function installAudioMock(page) {
  await page.addInitScript(() => {
    window.__ambientEvents = [];

    class AudioParamMock {
      constructor(value = 0) {
        this.value = value;
      }

      cancelScheduledValues(time) {
        window.__ambientEvents.push(['cancel', time]);
      }

      linearRampToValueAtTime(value, time) {
        this.value = value;
        window.__ambientEvents.push(['ramp', value, time]);
      }
    }

    class AudioNodeMock {
      connect(node) {
        return node;
      }
    }

    class AudioContextMock {
      constructor() {
        this.currentTime = 1;
        this.destination = new AudioNodeMock();
        this.sampleRate = 4;
        this.state = 'running';
      }

      close() {
        window.__ambientEvents.push(['close']);
        return Promise.resolve();
      }

      createBiquadFilter() {
        const node = new AudioNodeMock();
        node.frequency = new AudioParamMock();
        return node;
      }

      createBuffer(channels, length) {
        return {
          getChannelData: () => new Float32Array(length),
        };
      }

      createBufferSource() {
        const node = new AudioNodeMock();
        node.start = () => window.__ambientEvents.push(['start']);
        node.stop = () => window.__ambientEvents.push(['stop']);
        return node;
      }

      createGain() {
        const node = new AudioNodeMock();
        node.gain = new AudioParamMock();
        return node;
      }

      resume() {
        this.state = 'running';
        return Promise.resolve();
      }
    }

    window.AudioContext = AudioContextMock;
  });
}

async function preparePage(page, path) {
  await page.route('https://docs.google.com/spreadsheets/**', (route) => route.abort());
  await installAudioMock(page);
  await page.goto(path);
  await expect(page.locator('#reactMigrationRoot')).toHaveAttribute('data-react-migration', 'ready');
}

test('language switching updates React content, direction, and the canonical URL', async ({ page }) => {
  await preparePage(page, '/gallery?collection=exhibition&lang=en#human-creator');

  const languageButton = page.locator('#langBtn');
  await expect(languageButton).toHaveText('עברית');
  await languageButton.click();
  await expect(page).toHaveURL(/collection=exhibition&lang=he#human-creator$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('body')).not.toHaveClass(/\ben\b/);
  await expect(page.locator('#human-creator .image-shield')).toHaveAccessibleName('האדם היוצר');
  await expect(languageButton).toHaveText('English');

  await languageButton.click();
  await expect(page).toHaveURL(/\/gallery\?collection=exhibition#human-creator$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('body')).toHaveClass(/\ben\b/);
});

test('ambient sound is controlled by React and starts after entering the gallery', async ({ page }) => {
  await preparePage(page, '/gallery?collection=exhibition#human-creator');

  const soundButton = page.locator('#soundBtn');
  await expect(soundButton).toHaveAttribute('aria-pressed', 'false');
  await soundButton.click();
  await expect(soundButton).toHaveAttribute('aria-pressed', 'true');
  await expect(soundButton).toHaveClass(/is-on/);
  await expect(soundButton).toHaveText('◉');
  await soundButton.click();
  await expect(soundButton).toHaveAttribute('aria-pressed', 'false');
  await expect(soundButton).toHaveText('◌');
  expect(await page.evaluate(() => window.__ambientEvents.filter(([type]) => type === 'ramp'))).toEqual([
    ['ramp', 0.028, 1.35],
    ['ramp', 0, 1.35],
  ]);

  await page.goto('/');
  await expect(page.locator('#reactMigrationRoot')).toHaveAttribute('data-react-migration', 'ready');
  await page.locator('#enterBtn').click();
  await expect(page.locator('#soundBtn')).toHaveAttribute('aria-pressed', 'true');
});

test('desktop menu reveals every standalone page declaratively', async ({ page }) => {
  await preparePage(page, '/gallery?collection=exhibition#human-creator');

  for (const [path, section] of [
    ['/music', '#music'],
    ['/story', '#story'],
    ['/exhibitions', '#exhibitions'],
    ['/contact', '#contact'],
  ]) {
    await page.locator(`#mainMenu a[href="${path}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator(section)).toBeVisible();
    await expect(page.locator(section)).toHaveClass(/\bshow\b/);
  }
});

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens, closes with Escape, and closes after route navigation', async ({ page }) => {
    await preparePage(page, '/gallery?collection=exhibition#human-creator');

    const topbar = page.locator('.topbar');
    const menuButton = page.locator('#mobileMenuBtn');
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(menuButton).toHaveAccessibleName('Close menu');
    await expect(topbar).toHaveClass(/menu-open/);

    await page.keyboard.press('Escape');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(topbar).not.toHaveClass(/menu-open/);

    await menuButton.click();
    await page.locator('#mainMenu a[href="/contact"]').click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.locator('#contact')).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(topbar).not.toHaveClass(/menu-open/);
  });
});
