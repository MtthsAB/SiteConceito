import { defineConfig } from "astro/config";
import { SITE } from "./src/config/site.ts";

export default defineConfig({
  site: SITE.dominio,
  base: "/",
  output: "static",
  trailingSlash: "ignore",
  build: { format: "directory", inlineStylesheets: "always" },
});
