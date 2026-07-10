import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = resolve(__dirname, '../../..');

describe('ted-sbrain production build output', () => {
  it('does not leave import.meta.env in the browser bundle', () => {
    execFileSync('npm', ['run', 'build'], {
      cwd: repoRoot,
      env: {
        ...process.env,
        VITE_TED_SBRAIN_API_BASE_URL: '',
      },
      stdio: 'pipe',
    });

    const assetsDir = resolve(repoRoot, 'dist/assets');
    const bundleName = readdirSync(assetsDir).find((file) => /^index-.*\.js$/.test(file));

    expect(bundleName).toBeDefined();

    const bundleText = readFileSync(resolve(assetsDir, bundleName!), 'utf8');

    expect(bundleText).not.toContain('import.meta.env');
  });
});
