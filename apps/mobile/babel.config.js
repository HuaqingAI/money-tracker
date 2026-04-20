module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 预留 Tamagui babel plugin（Story 0.2 集成）
      // ['@tamagui/babel-plugin', { components: ['@money-tracker/ui'], config: './tamagui.config.ts' }],
    ],
  };
};
