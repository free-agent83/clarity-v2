import { defineConfig } from "vite";
import { resolve } from "path";
import { glob } from "glob";
import preserveDirectives from "rollup-preserve-directives";

export default defineConfig({
  plugins: [preserveDirectives()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: glob.sync("src/**/*.{ts,tsx}", {
        cwd: __dirname,
        ignore: [
          "src/**/*.stories.tsx",
          "src/**/*.test.tsx",
          "src/**/*.test.ts",
          "src/**/__stories__/**",
          "src/**/*.d.ts",
        ],
      }),
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "radix-ui",
        "@radix-ui/react-slot",
        "@base-ui/react",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
        "cmdk",
        "sonner",
        "vaul",
        "recharts",
        "embla-carousel-react",
        "input-otp",
        "next-themes",
        "lucide-react",
        "@tabler/icons-react",
        "tw-animate-css",
        "@fontsource-variable/inter",
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
