/** @type {import('style-dictionary').Config} */
export default {
  source: ["src/**/*.tokens.json"],
  log: { verbosity: "verbose" },
  platforms: {
    // Web — CSS custom properties for Tailwind consumption
    web: {
      transformGroup: "css",
      buildPath: "dist/web/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            outputReferences: true,
          },
        },
      ],
    },

    // JS/TS — for direct import in web or React Native
    js: {
      transformGroup: "js",
      buildPath: "dist/js/",
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
        },
        {
          destination: "tokens.d.ts",
          format: "typescript/es6-declarations",
        },
      ],
    },

    // React Native — unitless values
    reactNative: {
      transforms: ["attribute/cti", "name/camel", "color/hex"],
      buildPath: "dist/react-native/",
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
        },
        {
          destination: "tokens.d.ts",
          format: "typescript/es6-declarations",
        },
      ],
    },

    // JSON — for backend / email templates
    json: {
      transformGroup: "js",
      buildPath: "dist/json/",
      files: [
        {
          destination: "tokens.json",
          format: "json/nested",
        },
      ],
    },
  },
};
