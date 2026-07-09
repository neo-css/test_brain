import { describe, expect, it } from 'vitest';
import type { ConfigEnv, UserConfig } from 'vite';
import config from './vite.config';

const configEnv: ConfigEnv = {
  command: 'serve',
  mode: 'test',
  isSsrBuild: false,
  isPreview: false,
};

async function resolveConfig(): Promise<UserConfig> {
  return (typeof config === 'function' ? await config(configEnv) : await config) as UserConfig;
}

describe('vite config', () => {
  it('enables the ted-sbrain proxy from VITE_TED_SBRAIN_PROXY_TARGET', async () => {
    const previousProxyTarget = process.env.VITE_TED_SBRAIN_PROXY_TARGET;
    process.env.VITE_TED_SBRAIN_PROXY_TARGET = 'http://localhost:49152';

    try {
      const resolvedConfig = await resolveConfig();

      expect(resolvedConfig.server?.proxy?.['/ted-sbrain']).toMatchObject({
        target: 'http://localhost:49152',
        changeOrigin: true,
      });
      expect(resolvedConfig.preview?.proxy?.['/ted-sbrain']).toMatchObject({
        target: 'http://localhost:49152',
        changeOrigin: true,
      });
    } finally {
      if (previousProxyTarget === undefined) {
        delete process.env.VITE_TED_SBRAIN_PROXY_TARGET;
      } else {
        process.env.VITE_TED_SBRAIN_PROXY_TARGET = previousProxyTarget;
      }
    }
  });

  it('uses the default ted-sbrain proxy target without VITE_TED_SBRAIN_PROXY_TARGET', async () => {
    const previousProxyTarget = process.env.VITE_TED_SBRAIN_PROXY_TARGET;
    delete process.env.VITE_TED_SBRAIN_PROXY_TARGET;

    try {
      const resolvedConfig = await resolveConfig();

      expect(resolvedConfig.server?.proxy?.['/ted-sbrain']).toMatchObject({
        target: 'http://172.21.126.221:49152',
        changeOrigin: true,
      });
      expect(resolvedConfig.preview?.proxy?.['/ted-sbrain']).toMatchObject({
        target: 'http://172.21.126.221:49152',
        changeOrigin: true,
      });
    } finally {
      if (previousProxyTarget === undefined) {
        delete process.env.VITE_TED_SBRAIN_PROXY_TARGET;
      } else {
        process.env.VITE_TED_SBRAIN_PROXY_TARGET = previousProxyTarget;
      }
    }
  });
});
