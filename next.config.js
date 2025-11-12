/* eslint-disable @typescript-eslint/no-var-requires */
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

// 可选：按需启用 bundle 分析器
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// ============ 核心配置开始 ============
const nextConfig = {
  reactStrictMode: true,

  // 启用静态导出
  output: 'export',

  // i18n 配置（根据 blog.config.js 的 LANG 参数）
  i18n: {
    locales: ['en-US', 'zh-CN'],
    defaultLocale: 'en-US',
  },

  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // Webpack 优化
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 解决 node 模块依赖
      config.resolve.fallback = {
        fs: false,
        module: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
      }
    }
    return config
  },
}
// ============ 核心配置结束 ============

// ✅ 修复 /oops 页面导出错误（含多语言）
nextConfig.exportPathMap = async function (defaultPathMap) {
  const pages = { ...defaultPathMap }

  const removeOopsPaths = [
    '/oops',
    '/zh-CN/oops',
    '/en-US/oops',
    '/zh/oops',
    '/en/oops',
  ]

  for (const key of removeOopsPaths) {
    if (pages[key]) {
      delete pages[key]
      console.log(`🧹 Removed broken page from export: ${key}`)
    }
  }

  // 同时移除 sitemap.xml 和 auth 页面（防止 Vercel 导出错误）
  delete pages['/sitemap.xml']
  delete pages['/auth']

  return pages
}

// ✅ 根据是否启用分析器输出最终配置
module.exports =
  process.env.ANALYZE === 'true'
    ? withBundleAnalyzer(nextConfig)
    : nextConfig
