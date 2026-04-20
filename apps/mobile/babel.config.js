const path = require('path');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          // Tamagui 需要扫描的 styled 组件来源 package
          components: ['@money-tracker/ui', 'tamagui'],
          // 使用绝对路径，避免 cwd 差异（CI / Turbo 非预期 cwd）导致的路径失败
          config: path.resolve(__dirname, '../../packages/ui/tamagui.config.ts'),
          logTimings: true,
          // 开发环境关闭静态抽取以保持 HMR；生产构建开启以获得样式优化
          disableExtraction: process.env.NODE_ENV === 'development',
        },
      ],
    ],
  };
};
