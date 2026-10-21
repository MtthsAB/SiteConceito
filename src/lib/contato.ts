import { SITE } from "../config/site";

/** Link wa.me com o número do config. Retorna "" se não houver WhatsApp. */
export function linkWhatsApp(mensagem = SITE.whatsappMensagemPadrao) {
  if (!SITE.whatsapp) return "";
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

/** 5554999998888 -> (54) 99999-8888 */
export function formatarWhatsApp(numero = SITE.whatsapp) {
  const d = numero.replace(/\D/g, "").replace(/^55/, "");
  const m = d.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : numero;
}

/** "Rua X, 1 — Bairro — Cidade, UF — CEP" sem partes vazias. */
export const enderecoCompleto = [SITE.endereco, SITE.bairro, `${SITE.cidade}, ${SITE.estado}`, SITE.cep]
  .filter(Boolean)
  .join(" — ");

const buscaMapa = encodeURIComponent([SITE.endereco, SITE.cidade, SITE.estado, SITE.cep].filter(Boolean).join(", "));

/** Abre o Google Maps (app no celular) no endereço do config. */
export const linkMapa = SITE.endereco ? `https://www.google.com/maps/search/?api=1&query=${buscaMapa}` : "";

/** Mapa incorporável, sem chave de API. */
export const embedMapa = SITE.endereco ? `https://maps.google.com/maps?q=${buscaMapa}&z=16&output=embed` : "";

/** Atributos de um botão de WhatsApp. Sem número no config, cai para a seção de contato. */
export function ctaWhatsApp(mensagem?: string) {
  const href = linkWhatsApp(mensagem);
  return href ? { href, target: "_blank", rel: "noopener" } : { href: "/#contato" };
}
