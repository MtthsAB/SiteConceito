import { SITE } from "../config/site";

// Gerado no build a partir de SITE.dominio
const paginas = ["/", "/politica-de-privacidade/"];

export function GET() {
  const urls = paginas.map((p) => `  <url><loc>${new URL(p, SITE.dominio).href}</loc></url>`).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml" },
  });
}
