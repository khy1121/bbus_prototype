/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
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
    plugins: [react(), svgr(), directionsDevApi(env.KAKAO_REST_API_KEY)],
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
