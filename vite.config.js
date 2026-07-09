import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
const DEFAULT_TED_SBRAIN_PROXY_TARGET = 'http://172.21.126.221:49152';
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const proxyTarget = env.VITE_TED_SBRAIN_PROXY_TARGET || DEFAULT_TED_SBRAIN_PROXY_TARGET;
    return {
        plugins: [react()],
        server: {
            proxy: {
                '/ted-sbrain': {
                    target: proxyTarget,
                    changeOrigin: true,
                },
            },
        },
        preview: {
            proxy: {
                '/ted-sbrain': {
                    target: proxyTarget,
                    changeOrigin: true,
                },
            },
        },
    };
});
