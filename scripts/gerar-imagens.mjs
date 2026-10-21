// Gera favicons, imagem de compartilhamento (Open Graph) e fotos provisórias.
// Roda sozinho antes de `npm run dev` e `npm run build`.
// - Favicons e og-image: refeitos a partir de src/assets/marca/ a cada build.
// - Fotos provisórias: criadas SÓ se o arquivo não existir (nunca sobrescreve suas fotos).
import fs from "node:fs";
import sharp from "sharp";

const SIMBOLO = "src/assets/marca/simbolo.png";
const LOGO = "src/assets/marca/logo.png";
const FUNDO = "#F6F5F2";

// Símbolo centralizado num quadrado (fundo transparente ou da cor informada)
const quadrado = async (size, background, margem = 0.1) => {
  const interno = Math.round(size * (1 - margem * 2));
  const transparente = { r: 0, g: 0, b: 0, alpha: 0 };
  const simbolo = await sharp(SIMBOLO).resize(interno, interno, { fit: "contain", background: transparente }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: background ?? transparente } })
    .composite([{ input: simbolo, gravity: "center" }])
    .png();
};

// Favicons
await (await quadrado(32, undefined, 0.02)).toFile("public/favicon-32.png");
await (await quadrado(180, "#FFFFFF")).toFile("public/apple-touch-icon.png");
await (await quadrado(192, "#FFFFFF")).toFile("public/icon-192.png");
await (await quadrado(512, "#FFFFFF")).toFile("public/icon-512.png");

// favicon.ico com PNGs embutidos (16, 32, 48) — formato aceito por todos os navegadores
const pngs = await Promise.all([16, 32, 48].map(async (s) => (await quadrado(s, undefined, 0.02)).toBuffer()));
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
pngs.forEach((png, i) => {
  const s = [16, 32, 48][i], e = 6 + i * 16;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt16LE(1, e + 4); // planes
  header.writeUInt16LE(32, e + 6); // bpp
  header.writeUInt32LE(png.length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += png.length;
});
fs.writeFileSync("public/favicon.ico", Buffer.concat([header, ...pngs]));

// Open Graph 1200x630: logo centralizada no fundo claro com faixa azul embaixo
const logo = await sharp(LOGO).resize({ width: 820 }).toBuffer();
const faixa = Buffer.from(`<svg width="1200" height="630"><rect y="606" width="900" height="24" fill="#2E4F98"/><rect x="900" y="606" width="300" height="24" fill="#0098D8"/></svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: FUNDO } })
  .composite([{ input: logo, gravity: "center" }, { input: faixa, top: 0, left: 0 }])
  .png()
  .toFile("public/og-image.png");

// Fotos provisórias (listras neutras + legenda), mesmo visual do design
const provisoria = async (arquivo, w, h, legenda) => {
  if (fs.existsSync(arquivo)) return;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><pattern id="p" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="11" height="22" fill="#E3E1DC"/><rect x="11" width="11" height="22" fill="#EEECE8"/></pattern></defs>
    <rect width="100%" height="100%" fill="url(#p)"/>
    <text x="50%" y="50%" text-anchor="middle" font-family="monospace" font-size="${Math.round(w / 40)}" fill="#8C887F">${legenda}</text></svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(arquivo);
};
await provisoria("src/assets/placeholder/fachada.jpg", 1200, 1160, "FOTO PROVISÓRIA — fachada de condomínio");
await provisoria("src/assets/placeholder/equipe.jpg", 1200, 900, "FOTO PROVISÓRIA — equipe no escritório");

console.log("Imagens geradas.");
