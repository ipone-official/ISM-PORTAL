const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  chainWebpack: config => {
    config.module
      .rule('svg')
      .use('file-loader')
      .loader('file-loader')
      .tap(options => {
        return {
          ...options,
          name: 'assets/[name].[hash:8].[ext]',
        };
      });

    config.resolve.alias.set('@', path.resolve(__dirname, 'src'));
  },

  transpileDependencies: true,

  
  // 👇 เพิ่มส่วนนี้เพื่อรองรับ PWA และ Add to Home Screen
  pwa: {
    name: 'ISM PORTAL',
    themeColor: '#0d47a1',
    backgroundColor: '#ffffff',
    manifestPath: 'manifest.json',
    display: 'standalone',
    start_url: '.',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    manifestOptions: {
      short_name: 'IPONE',
      icons: [
        {
          src: 'android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  }
});
