# Site — Conceito Administradora de Condomínios e Imóveis

Site institucional de uma página (com Política de Privacidade e página de erro 404).
É um site **estático**: depois de gerado, são só arquivos HTML, CSS e imagens que funcionam
em qualquer hospedagem, sem banco de dados e sem nada instalado no servidor.

---

## 1. Editar dados da empresa e textos

| O que mudar | Arquivo |
|---|---|
| Telefone, WhatsApp, e-mail, endereço, CNPJ, domínio, redes sociais, formulário | `src/config/site.ts` |
| Textos das seções (títulos, serviços, passos, diferenciais, rodapé) | `src/config/conteudo.ts` |

Abra o arquivo em qualquer editor de texto (recomendado: [VS Code](https://code.visualstudio.com/)),
troque o que estiver **entre aspas** e salve. Cuidados:

- Não apague as aspas `"` nem a vírgula `,` no fim das linhas.
- Para **esconder** algo do site (ex.: CNPJ, Instagram, endereço), deixe o valor vazio: `""`.
- WhatsApp: só números, com 55 + DDD. Ex.: `"5554999998888"`.

Depois de editar, gere o site de novo (passo 3) e publique (passo 4).

## 2. Trocar as fotos

As fotos atuais são provisórias (listradas, com a legenda "FOTO PROVISÓRIA").
Substitua os arquivos **mantendo exatamente o mesmo nome**:

| Foto | Arquivo | Tamanho sugerido |
|---|---|---|
| Fachada (topo do site) | `src/assets/placeholder/fachada.jpg` | 1200 × 1160 px ou maior |
| Equipe (seção Sobre) | `src/assets/placeholder/equipe.jpg` | 1200 × 900 px ou maior |

Não precisa reduzir as fotos: o build gera versões leves (AVIF/WebP) automaticamente.
Para mudar a descrição das fotos (usada por leitores de tela e Google), edite `altImagem` em `src/config/conteudo.ts`.

Logo e símbolo ficam em `src/assets/marca/` (`logo.png` e `simbolo.png`). Os favicons e a imagem de
compartilhamento (`og-image.png`) são gerados a partir deles a cada build.

## 3. Rodar no computador e gerar o site

Precisa do [Node.js](https://nodejs.org/) versão 20 ou mais recente (instale a versão "LTS").
No terminal, dentro desta pasta:

```bash
npm install        # só na primeira vez
npm run dev        # abre uma prévia em http://localhost:4321 que atualiza enquanto você edita
npm run build      # gera o site final na pasta dist/
npx serve dist     # (opcional) testa a pasta dist/ como se estivesse na hospedagem
```

## 4. Publicar na hospedagem

Suba o **conteúdo** da pasta `dist/` (não a pasta em si) para a pasta pública do servidor,
normalmente chamada `public_html` (às vezes `www` ou `htdocs`).

**Pelo FileZilla (FTP):**
1. Conecte com host, usuário e senha FTP fornecidos pela hospedagem.
2. Ative a exibição de arquivos ocultos: menu *Servidor → Forçar exibição de arquivos ocultos*.
   Isso é necessário para enviar o `.htaccess`.
3. No lado esquerdo, entre **dentro** da pasta `dist`. No lado direito, entre em `public_html`.
4. Selecione tudo do lado esquerdo (incluindo `.htaccess` e a pasta `_astro`) e arraste para a direita.
   Confirme substituir os arquivos existentes.

**Pelo gerenciador de arquivos do painel (cPanel ou similar):**
1. Compacte o **conteúdo** de `dist/` num `.zip` (selecione os arquivos dentro da pasta → compactar).
   No Windows, ative "Itens ocultos" no Explorador para o `.htaccess` entrar no zip.
2. No painel, abra o Gerenciador de Arquivos → `public_html` → Carregar o zip → Extrair.
3. Em *Configurações*, marque "Mostrar arquivos ocultos" e confira se o `.htaccess` está lá.

Depois de publicar, abra o site, a página `/politica-de-privacidade` e um endereço inexistente
(ex.: `/teste`) para conferir a página 404.

## 5. O que pedir à empresa de hospedagem

- Acesso **FTP** (host, usuário, senha, porta) ou acesso ao **painel** (cPanel, Plesk, etc.).
- Qual o **servidor web**: Apache, LiteSpeed (ambos usam o `.htaccess`) ou Nginx (veja abaixo).
- Se o **SSL (HTTPS)** está ativo para o domínio. O `.htaccess` força HTTPS; sem SSL o site não abre.
  Se for o caso, peça a ativação (Let's Encrypt costuma ser gratuito) ou comente as linhas indicadas no `.htaccess`.
- Se o domínio deve abrir **com ou sem www** — e ajuste a opção A/B no `.htaccess` e o `dominio` em `site.ts`.

### Servidor Nginx

Nginx ignora o `.htaccess`. Peça à hospedagem para incluir na configuração do site:

```nginx
server {
    listen 80;
    server_name SEUDOMINIO.com.br www.SEUDOMINIO.com.br;
    return 301 https://www.SEUDOMINIO.com.br$request_uri;   # força HTTPS + www
}

server {
    listen 443 ssl http2;
    server_name www.SEUDOMINIO.com.br;
    root /caminho/para/public_html;
    # (certificados SSL configurados pela hospedagem)

    autoindex off;
    error_page 404 /404.html;

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    location /_astro/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript application/json application/xml image/svg+xml application/manifest+json;

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
}
```

## 6. Receber o formulário por e-mail (Formspree)

Sem configuração, o formulário de contato abre o WhatsApp da empresa com a mensagem já escrita.
Para receber por **e-mail**:

1. Crie uma conta gratuita em <https://formspree.io> (o plano grátis tem limite mensal de envios).
2. Clique em **New Form**, dê um nome (ex.: "Site Conceito") e informe o e-mail que vai receber as mensagens.
3. Copie a URL do formulário, no formato `https://formspree.io/f/xxxxxxx`.
4. Cole em `src/config/site.ts`:
   ```ts
   formularioEndpoint: "https://formspree.io/f/xxxxxxx",
   ```
5. Rode `npm run build` e publique de novo.
6. Envie uma mensagem de teste pelo site. Na primeira vez, o Formspree pede para confirmar o e-mail.

Qualquer serviço compatível (Getform, Basin, etc.) que aceite `POST` com os dados do formulário também funciona.
O campo `_gotcha` é uma armadilha anti-spam reconhecida pelo Formspree.
Se trocar de serviço, atualize o item 4 da Política de Privacidade.

---

### Estrutura

```
src/
  config/site.ts         ← dados da empresa
  config/conteudo.ts     ← textos das seções
  assets/marca/          ← logo e símbolo
  assets/placeholder/    ← fotos (substituir)
  components/            ← uma seção do site por arquivo
  layouts/Base.astro     ← <head>, SEO, dados estruturados
  pages/                 ← páginas, sitemap.xml, robots.txt, manifest
  styles/global.css      ← cores, fontes e estilos base
public/                  ← copiado como está (.htaccess, favicons)
scripts/gerar-imagens.mjs← gera favicons, og-image e fotos provisórias
```
