import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Component tests only. Pure logic in lib/ runs on Node's built-in runner (see the "test" script). */
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    environment: "jsdom",
    include: ["components/**/*.test.tsx"],
    setupFiles: ["./test/setup-components.tsx"],
  },
});
