import { access, readdir, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const RASTER_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff']);

function extension(fileName) {
  const dot = fileName.lastIndexOf('.');
  return dot === -1 ? '' : fileName.slice(dot).toLowerCase();
}

function stem(fileName) {
  return fileName.slice(0, -extension(fileName).length);
}

function excludeOptimizedSourceImages() {
  return {
    name: 'exclude-optimized-source-images',
    apply: 'build',
    async closeBundle() {
      const sourceDirectory = resolve('public/assets');
      const optimizedDirectory = resolve('public/images/web');
      const outputDirectory = resolve('dist/assets');
      const sourceFiles = await readdir(sourceDirectory);

      await Promise.all(sourceFiles.filter((fileName) => RASTER_EXTENSIONS.has(extension(fileName))).map(async (fileName) => {
        const optimizedPath = resolve(optimizedDirectory, `${stem(fileName)}.webp`);
        try {
          await access(optimizedPath, constants.F_OK);
        } catch {
          return;
        }
        await rm(resolve(outputDirectory, fileName), { force: true });
      }));
    },
  };
}

export default defineConfig({
  plugins: [react(), excludeOptimizedSourceImages()],
});
