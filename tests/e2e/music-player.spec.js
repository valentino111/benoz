import { expect, test } from '@playwright/test';

async function prepareMusicPage(page, language = 'en') {
  await page.route('https://docs.google.com/spreadsheets/**', (route) => route.abort());
  await page.addInitScript(() => {
    const mediaState = new WeakMap();
    const stateFor = (media) => {
      if (!mediaState.has(media)) mediaState.set(media, { currentTime: 0, paused: true });
      return mediaState.get(media);
    };

    Object.defineProperties(HTMLMediaElement.prototype, {
      currentTime: {
        configurable: true,
        get() {
          return stateFor(this).currentTime;
        },
        set(value) {
          stateFor(this).currentTime = Number(value);
          this.dispatchEvent(new Event('timeupdate'));
        },
      },
      duration: {
        configurable: true,
        get() {
          return 120;
        },
      },
      paused: {
        configurable: true,
        get() {
          return stateFor(this).paused;
        },
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

  await page.goto(`/music?lang=${language}`);
  await expect(page.locator('#reactMigrationRoot')).toHaveAttribute('data-react-migration', 'ready');
  await expect(page.locator('.track')).toHaveCount(2);
}

test('music playback, seeking, and single-track coordination are owned by React', async ({ page }) => {
  await prepareMusicPage(page);

  const firstPlay = page.locator('#track-lihyot .play');
  const secondPlay = page.locator('#track-yofi .play');
  await expect(firstPlay).toHaveAccessibleName('Play Lihyot');
  await expect(secondPlay).toHaveAccessibleName('Play Yofi Hu Koach Atzum');
  await firstPlay.click();
  await expect(firstPlay).toHaveAttribute('aria-pressed', 'true');
  await expect(firstPlay).toHaveAttribute('aria-label', 'Pause Lihyot');

  const firstSlider = page.getByRole('slider', { name: 'Seek in Lihyot' });
  await firstSlider.fill('50');
  await expect(firstSlider).toHaveAttribute('aria-valuetext', '1:00 of 2:00');
  await expect(page.locator('#track-lihyot .time')).toHaveText('1:00');

  await secondPlay.click();
  await expect(secondPlay).toHaveAttribute('aria-pressed', 'true');
  await expect(firstPlay).toHaveAttribute('aria-pressed', 'false');
});

test('Hebrew content keeps conventional left-to-right player controls', async ({ page }) => {
  await prepareMusicPage(page, 'he');

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const player = page.locator('#track-lihyot .player');
  const play = player.getByRole('button');
  const slider = player.getByRole('slider');

  await expect(player).toHaveAttribute('dir', 'ltr');
  await expect(slider).toHaveAttribute('dir', 'ltr');
  await expect(player).toHaveCSS('direction', 'ltr');

  const [playBox, sliderBox] = await Promise.all([play.boundingBox(), slider.boundingBox()]);
  expect(playBox).not.toBeNull();
  expect(sliderBox).not.toBeNull();
  expect(playBox.x).toBeLessThan(sliderBox.x);
});
