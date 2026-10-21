import { SITE } from "../config/site";

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", SITE.dominio).href}\n`);
}
