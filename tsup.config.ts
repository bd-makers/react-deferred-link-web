import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    react: "src/react/index.ts",
    nextjs: "src/nextjs/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom", "next"],
  tsconfig: "tsconfig.build.json",
});
