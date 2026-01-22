module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@hooks": "./src/hooks",
            "@stores": "./src/stores",
            "@services": "./src/services",
            "@utils": "./src/utils",
            "@theme": "./src/theme"
          }
        }
      ]
    ]
  };
};
