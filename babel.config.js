const preset = require.resolve('babel-preset-expo');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [preset],
    plugins: ['react-native-reanimated/plugin'],
  };
};