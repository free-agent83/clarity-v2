import nxPlugin from "@nx/eslint-plugin";

export default [
  {
    plugins: {
      "@nx": nxPlugin,
    },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              // Foundation tokens — no dependencies on UI
              sourceTag: "type:foundation",
              onlyDependOnLibsWithTags: ["type:foundation"],
            },
            {
              // UI components can depend on foundation tokens
              sourceTag: "type:ui",
              onlyDependOnLibsWithTags: ["type:foundation", "type:ui"],
            },
          ],
        },
      ],
    },
  },
];
