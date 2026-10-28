/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'
import { handleDirectionsRequest } from './src/lib/kakao/directions.js'

/** 개발 서버에서 Vercel 함수(/api/directions)와 같은 동작을 제공 */
function directionsDevApi(restApiKey: string | undefined): Plugin {
  return {
    name: 'bbus-directions-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/directions', async (req, res) => {
        const search = new URL(req.url ?? '', 'http://localhost').searchParams
        const { status, body } = await handleDirectionsRequest(search, restApiKey)
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(body))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // VITE_ 접두어가 없는 서버 전용 변수(KAKAO_REST_API_KEY)도 읽는다 — 클라이언트 번들에는 들어가지 않는다
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      svgr(),
      directionsDevApi(env.KAKAO_REST_API_KEY),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: false, // main.tsx 에서 직접 등록
        includeAssets: ['favicon.svg', 'icons/apple-touch-icon-180x180.png'],
        manifest: {
          name: '붕붕어스',
          short_name: '붕붕어스',
          description: '연인과 함께하는 드라이브 기록 앱',
          lang: 'ko',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#FFFBFB',
          background_color: '#FFFBFB',
          icons: [
            { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // SPA: 오프라인/새로고침 시 index.html — 단, 서버 함수(/api)는 제외
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          // 설치 시에는 앱 셸(코드·스타일·아이콘)만 미리 받고, 사진은 처음 볼 때 캐시
          globPatterns: ['**/*.{js,css,html,svg}', 'icons/*.png'],
          runtimeCaching: [
            {
              urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 모든 SCSS 모듈에서 토큰/믹스인을 import 없이 사용
          additionalData: `@use "@/styles/abstracts" as *;\n`,
        },
      },
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: { modules: { classNameStrategy: 'non-scoped' } },
    },
  }
})
