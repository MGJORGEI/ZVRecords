import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Detecta la plataforma por URL y devuelve { platform, icon, color, embedUrl? }
function detectPlatform(url: string) {
  const u = url.toLowerCase();

  // Spotify — soporta URLs con /intl-XX/ y ?si= params
  // Ejemplos válidos:
  //   https://open.spotify.com/artist/ABC123
  //   https://open.spotify.com/intl-es/artist/ABC123?si=XXX
  //   https://open.spotify.com/intl-es/album/ABC123
  //   https://open.spotify.com/track/ABC123?si=XXX
  if (u.includes("spotify.com") && u.includes("/artist/")) {
    const id = url.match(/\/artist\/([a-zA-Z0-9]+)/)?.[1];
    return { platform: "spotify", label: "Spotify", color: "#1DB954", icon: ICONS.spotify, embedUrl: id ? `https://open.spotify.com/embed/artist/${id}?utm_source=generator&theme=0` : null, followUrl: id ? `https://open.spotify.com/artist/${id}` : url };
  }
  if (u.includes("spotify.com") && u.includes("/album/")) {
    const id = url.match(/\/album\/([a-zA-Z0-9]+)/)?.[1];
    return { platform: "spotify", label: "Spotify", color: "#1DB954", icon: ICONS.spotify, embedUrl: id ? `https://open.spotify.com/embed/album/${id}?utm_source=generator&theme=0` : null };
  }
  if (u.includes("spotify.com") && u.includes("/track/")) {
    const id = url.match(/\/track\/([a-zA-Z0-9]+)/)?.[1];
    return { platform: "spotify", label: "Spotify", color: "#1DB954", icon: ICONS.spotify, embedUrl: id ? `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0` : null };
  }
  if (u.includes("spotify.com") && u.includes("/playlist/")) {
    const id = url.match(/\/playlist\/([a-zA-Z0-9]+)/)?.[1];
    return { platform: "spotify", label: "Spotify", color: "#1DB954", icon: ICONS.spotify, embedUrl: id ? `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0` : null };
  }
  if (u.includes("spotify.com")) return { platform: "spotify", label: "Spotify", color: "#1DB954", icon: ICONS.spotify };

  // Apple Music — embed player con play + add to library
  // URL format: https://music.apple.com/mx/album/album-name/1234567890
  // Embed: https://embed.music.apple.com/mx/album/album-name/1234567890
  if (u.includes("music.apple.com")) {
    const embedUrl = url.replace("music.apple.com", "embed.music.apple.com");
    return { platform: "apple", label: "Apple Music", color: "#FA243C", icon: ICONS.apple, embedUrl };
  }

  // YouTube Music — uses same embed as YouTube
  if (u.includes("music.youtube.com")) {
    const id = url.match(/(?:v=|list=)([a-zA-Z0-9_-]+)/)?.[1];
    const isPlaylist = u.includes("list=");
    if (isPlaylist) {
      return { platform: "youtubemusic", label: "YouTube Music", color: "#FF0000", icon: ICONS.youtubemusic, embedUrl: id ? `https://www.youtube.com/embed/videoseries?list=${id}` : null };
    }
    return { platform: "youtubemusic", label: "YouTube Music", color: "#FF0000", icon: ICONS.youtubemusic, embedUrl: id ? `https://www.youtube.com/embed/${id}` : null };
  }

  // YouTube regular
  if (u.includes("youtube.com") || u.includes("youtu.be")) {
    const id = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
    return { platform: "youtube", label: "YouTube", color: "#FF0000", icon: ICONS.youtube, embedUrl: id ? `https://www.youtube.com/embed/${id}` : null };
  }

  // TikTok — embed de videos individuales
  // URL format: https://www.tiktok.com/@user/video/1234567890
  if (u.includes("tiktok.com") && u.includes("/video/")) {
    const videoId = url.match(/video\/(\d+)/)?.[1];
    return { platform: "tiktok", label: "TikTok", color: "#00F2EA", icon: ICONS.tiktok, embedUrl: videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : null };
  }
  if (u.includes("tiktok.com")) return { platform: "tiktok", label: "TikTok", color: "#00F2EA", icon: ICONS.tiktok };

  // Instagram — embed de posts/reels
  if (u.includes("instagram.com/p/") || u.includes("instagram.com/reel/")) {
    const embedUrl = url.split("?")[0] + "embed";
    return { platform: "instagram", label: "Instagram", color: "#E4405F", icon: ICONS.instagram, embedUrl };
  }
  if (u.includes("instagram.com")) return { platform: "instagram", label: "Instagram", color: "#E4405F", icon: ICONS.instagram };

  if (u.includes("twitter.com") || u.includes("x.com")) return { platform: "twitter", label: "X / Twitter", color: "#fff", icon: ICONS.twitter };

  // SoundCloud — embed player con follow
  // Embed: https://w.soundcloud.com/player/?url=ENCODED_URL&color=%23ff5500&auto_play=false&show_artwork=true
  if (u.includes("soundcloud.com")) {
    const encodedUrl = encodeURIComponent(url);
    return { platform: "soundcloud", label: "SoundCloud", color: "#FF5500", icon: ICONS.soundcloud, embedUrl: `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true` };
  }

  // Deezer — embed widget
  // URL: https://www.deezer.com/mx/artist/123456
  // Embed: https://widget.deezer.com/widget/dark/artist/123456
  if (u.includes("deezer.com")) {
    const match = url.match(/deezer\.com\/(?:\w+\/)?(artist|album|track|playlist)\/(\d+)/);
    if (match) {
      return { platform: "deezer", label: "Deezer", color: "#A238FF", icon: ICONS.deezer, embedUrl: `https://widget.deezer.com/widget/dark/${match[1]}/${match[2]}` };
    }
    return { platform: "deezer", label: "Deezer", color: "#A238FF", icon: ICONS.deezer };
  }

  if (u.includes("amazon")) return { platform: "amazon", label: "Amazon Music", color: "#00A8E1", icon: ICONS.amazon };

  return { platform: "link", label: "Link", color: "#888", icon: ICONS.link };
}

const ICONS: Record<string, string> = {
  spotify: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
  apple: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M23.997 6.124a9.23 9.23 0 00-.24-2.19 5.92 5.92 0 00-1.32-2.15A5.73 5.73 0 0020.28.464a9.31 9.31 0 00-2.19-.24C16.82.164 16.51.154 12.02.154s-4.8.01-6.07.07a9.23 9.23 0 00-2.19.24 5.92 5.92 0 00-2.15 1.32A5.73 5.73 0 00.29 3.934a9.31 9.31 0 00-.24 2.19c-.06 1.27-.07 1.58-.07 6.07s.01 4.8.07 6.07a9.23 9.23 0 00.24 2.19 5.92 5.92 0 001.32 2.15 5.73 5.73 0 002.15 1.32 9.31 9.31 0 002.19.24c1.27.06 1.58.07 6.07.07s4.8-.01 6.07-.07a9.23 9.23 0 002.19-.24 6.14 6.14 0 003.47-3.47 9.31 9.31 0 00.24-2.19c.06-1.27.07-1.58.07-6.07s-.01-4.8-.07-6.07zM12 18.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm2.5-10.14a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  youtubemusic: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  twitter: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  soundcloud: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.057-.05-.1-.1-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.172 1.308c.013.06.045.094.104.094.057 0 .089-.035.104-.094l.192-1.308-.192-1.332c-.015-.057-.047-.094-.104-.094m1.815-.847c-.065 0-.107.041-.115.105l-.209 2.168.209 2.119c.008.06.05.104.115.104.06 0 .104-.044.114-.104l.242-2.119-.242-2.168c-.01-.064-.054-.105-.114-.105"/></svg>`,
  deezer: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.03h5.19V8.38H6.27zm6.27 0v3.03h5.19V8.38h-5.19zm6.27 0v3.03H24V8.38h-5.19zM6.27 12.6v3.03h5.19V12.6H6.27zm6.27 0v3.03h5.19V12.6h-5.19zm6.27 0v3.03H24V12.6h-5.19zM0 16.82v3.03h5.19v-3.03H0zm6.27 0v3.03h5.19v-3.03H6.27zm6.27 0v3.03h5.19v-3.03h-5.19zm6.27 0v3.03H24v-3.03h-5.19z"/></svg>`,
  amazon: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.493.126.13.23.032.41-.266.57-.3.156-.626.313-.987.46-1.87.766-3.82 1.25-5.848 1.458-2.028.21-4.03.15-6.01-.175-1.98-.326-3.855-.925-5.627-1.794-.56-.276-1.1-.582-1.62-.916-.083-.056-.154-.104-.207-.14l-.037-.024c-.022-.016-.032-.02-.04-.022zm11.948-4.036c-1.233 0-2.282.292-3.15.875-.82.55-1.276 1.294-1.37 2.233-.008.065.03.13.11.17l1.76.148c.09.008.15-.035.176-.133.067-.478.27-.833.608-1.068.34-.238.755-.357 1.25-.357.527 0 .943.133 1.25.4.303.27.456.636.456 1.1v.507c-1.094.098-2 .22-2.722.368-1.022.21-1.8.55-2.33 1.02-.53.47-.794 1.098-.794 1.882 0 .667.234 1.222.703 1.664.47.44 1.05.662 1.74.662 1.056 0 2.046-.477 2.974-1.43l.063-.063.33 1.18c.033.098.1.148.2.148h1.42c.06 0 .104-.018.133-.053.03-.035.04-.08.033-.133l-.013-.12-.333-1.48c-.1-.437-.15-.89-.15-1.354V14.3c0-1.274-.36-2.2-1.08-2.77-.718-.57-1.66-.854-2.822-.854h-.002z"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
};

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function renderLinkPage(slug: string): Promise<string | null> {
  const page = await prisma.linkPage.findUnique({
    where: { slug },
    include: { links: { orderBy: { order: "asc" } }, artist: true },
  });

  if (!page || !page.active) return null;

  const bg = page.bgColor || "#0D0D0D";
  const accent = page.accentColor || "#00E5FF";
  const text = page.textColor || "#F0F0F0";
  const title = esc(page.title);
  const bio = esc(page.bio || "");
  const theme = page.theme || "dark";

  // Build links HTML
  let linksHtml = "";
  let embedsHtml = "";

  for (const link of page.links.filter((l) => l.active)) {
    const p = detectPlatform(link.url);
    const linkTitle = esc(link.title || p.label);

    // Per-link custom color overrides platform auto-detect
    const btnColor = (link as any).color || p.color;
    const btnText = (link as any).textColor || "";

    // Custom style override
    const linkStyle = (link as any).style || "";
    let radius = "12px";
    if (linkStyle === "pill") radius = "50px";
    else if (linkStyle === "sharp") radius = "0";

    // Button style based on theme
    let btnStyle = `border-radius: ${radius};`;

    if (linkStyle === "outline-only") {
      btnStyle += `border: 2px solid ${btnColor}; color: ${btnText || btnColor}; background: transparent;`;
    } else if (theme === "neon") {
      btnStyle += `border: 1px solid ${btnColor}; color: ${btnText || btnColor}; background: transparent; box-shadow: 0 0 15px ${btnColor}30, inset 0 0 15px ${btnColor}08;`;
    } else if (theme === "glass") {
      btnStyle += `background: ${btnColor}18; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid ${btnColor}30; color: ${btnText || text};`;
    } else if (theme === "gradient-dark") {
      btnStyle += `background: ${btnColor}; color: ${btnText || "#000"}; font-weight: 700; box-shadow: 0 4px 20px ${btnColor}40; border: none;`;
    } else if (theme === "minimal") {
      btnStyle += `background: transparent; color: ${btnText || text}; border: 1px solid ${text}20; font-weight: 400;`;
    } else if (theme === "brutalist") {
      btnStyle = `background: ${btnColor}; color: ${btnText || "#000"}; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 0.75rem; border: 2px solid ${text}; box-shadow: 4px 4px 0 ${text}; border-radius: 0;`;
    } else if (theme === "retro") {
      btnStyle += `background: ${btnColor}; color: ${btnText || "#000"}; font-weight: 700; border: 2px solid ${btnColor}; box-shadow: 0 6px 0 ${btnColor}80;`;
    } else {
      btnStyle += `border: none; color: ${btnText || bg}; background: ${btnColor}; font-weight: 700;`;
    }

    const embeddable = ["spotify", "youtube", "youtubemusic", "apple", "soundcloud", "deezer", "tiktok", "instagram"];
    const hasEmbed = embeddable.includes(p.platform) && (p as any).embedUrl;
    const embedId = `embed-${link.id}`;

    if (hasEmbed) {
      // Link with inline expandable embed
      linksHtml += `
      <div class="lp-link-wrap">
        <button class="lp-link lp-link-expandable" style="${btnStyle}" onclick="toggleEmbed('${embedId}', this)" data-url="${esc(link.url)}">
          <span class="lp-link-icon">${p.icon}</span>
          <span class="lp-link-text">${linkTitle}</span>
          <span class="lp-link-expand">▼</span>
        </button>
        <div class="lp-inline-embed" id="${embedId}">
          ${(() => {
            const embedUrl = (p as any).embedUrl;
            const openLabel = `Open in ${p.label}`;

            // Spotify — tall embed with follow + add to library
            if (p.platform === "spotify") return `
              <iframe src="${embedUrl}" width="100%" height="352" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:12px;"></iframe>`;

            // Apple Music — embed player
            if (p.platform === "apple") return `
              <iframe src="${embedUrl}" height="450" frameborder="0" allow="autoplay; encrypted-media; fullscreen" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation" loading="lazy" style="width:100%;border-radius:12px;overflow:hidden;background:transparent;"></iframe>`;

            // SoundCloud — visual player with follow
            if (p.platform === "soundcloud") return `
              <iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="${embedUrl}" loading="lazy" style="border-radius:12px;"></iframe>`;

            // Deezer — widget
            if (p.platform === "deezer") return `
              <iframe src="${embedUrl}" width="100%" height="300" frameborder="0" allow="encrypted-media; clipboard-write" loading="lazy" style="border-radius:12px;"></iframe>`;

            // TikTok — video embed
            if (p.platform === "tiktok") return `
              <iframe src="${embedUrl}" width="100%" height="400" frameborder="0" allow="autoplay" loading="lazy" style="border-radius:12px;"></iframe>`;

            // Instagram — post/reel embed
            if (p.platform === "instagram") return `
              <iframe src="${embedUrl}" width="100%" height="480" frameborder="0" scrolling="no" loading="lazy" style="border-radius:12px;border:none;overflow:hidden;"></iframe>`;

            // YouTube / YouTube Music — 16:9 video
            return `
              <div class="lp-yt-wrap">
                <iframe src="${embedUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen loading="lazy"></iframe>
              </div>`;
          })()}
          <a href="${esc(link.url)}" target="_blank" rel="noopener" class="lp-open-app" style="color:${p.color}">
            ${p.icon} Open in ${esc(p.label)} →
          </a>
        </div>
      </div>`;
    } else {
      // Regular link — opens in new tab
      linksHtml += `
      <a href="${esc(link.url)}" target="_blank" rel="noopener" class="lp-link" style="${btnStyle}">
        <span class="lp-link-icon">${p.icon}</span>
        <span class="lp-link-text">${linkTitle}</span>
        <span class="lp-link-arrow">→</span>
      </a>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — ZV Records</title>
  <meta name="description" content="${bio} — ZV Records" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${bio}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Bebas+Neue&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${bg};
      color: ${text};
      font-family: 'Syne', sans-serif;
      min-height: 100vh;
      display: flex; flex-direction: column; align-items: center;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      position: relative;
      overflow-x: hidden;
    }

    /* Background effects */
    .lp-bg {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
    }
    .lp-bg-glow1 {
      position: absolute; top: -30%; left: -20%;
      width: 70%; height: 60%; border-radius: 50%;
      background: ${accent}; opacity: 0.15;
      filter: blur(150px);
    }
    .lp-bg-glow2 {
      position: absolute; bottom: -20%; right: -20%;
      width: 60%; height: 50%; border-radius: 50%;
      background: ${accent}; opacity: 0.1;
      filter: blur(130px);
    }
    .lp-bg-lines {
      position: absolute; inset: 0;
      background-image:
        repeating-linear-gradient(0deg, ${text}08 0px, ${text}08 1px, transparent 1px, transparent 60px),
        repeating-linear-gradient(90deg, ${text}05 0px, ${text}05 1px, transparent 1px, transparent 60px);
    }

    /* Header area */
    .lp-header {
      width: 100%; padding: 3.5rem 1.5rem 2rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      position: relative; z-index: 1;
      border-bottom: 1px solid ${text}08;
      margin-bottom: 1.5rem;
    }

    .lp-container {
      width: 100%; max-width: 420px;
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      padding: 0 1.25rem 2rem;
      position: relative; z-index: 1;
    }
    .lp-avatar {
      width: 110px; height: 110px; border-radius: 50%;
      border: 3px solid ${accent};
      display: flex; align-items: center; justify-content: center;
      font-family: 'Bebas Neue', sans-serif; font-size: 40px;
      background: ${accent}10; color: ${accent};
      overflow: hidden;
      box-shadow: 0 0 40px ${accent}20, 0 8px 32px rgba(0,0,0,0.4);
    }
    .lp-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .lp-name {
      font-family: 'Bebas Neue', sans-serif; font-size: 2.4rem;
      letter-spacing: 3px;
      text-shadow: 0 0 30px ${accent}20;
    }
    .lp-bio { font-size: 0.85rem; opacity: 0.5; text-align: center; max-width: 300px; line-height: 1.5; }
    .lp-stats {
      display: flex; gap: 1.5rem; margin-top: 0.25rem;
    }
    .lp-stat {
      text-align: center; font-size: 0.6rem; letter-spacing: 1px;
      text-transform: uppercase; opacity: 0.35;
    }
    .lp-stat strong { display: block; font-size: 0.9rem; opacity: 1; color: ${accent}; }
    .lp-links { width: 100%; display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem; }
    .lp-link {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.9rem 1.2rem; border-radius: 12px;
      text-decoration: none; font-weight: 600; font-size: 0.9rem;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    .lp-link:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
    .lp-link:active { transform: scale(0.98); }
    .lp-link-icon { display: flex; align-items: center; flex-shrink: 0; }
    .lp-link-text { flex: 1; }
    .lp-link-arrow { opacity: 0.4; font-size: 0.8rem; }

    /* Expandable embed links */
    .lp-link-wrap { width: 100%; }
    .lp-link-expandable { width: 100%; cursor: pointer; border: none; font-family: inherit; }
    .lp-link-expand {
      font-size: 0.65rem; opacity: 0.5; transition: transform 0.3s;
    }
    .lp-link-expandable.open .lp-link-expand { transform: rotate(180deg); }
    .lp-inline-embed {
      max-height: 0; overflow: hidden; opacity: 0;
      transition: max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s, margin 0.3s;
      margin-top: 0;
      border-radius: 0 0 12px 12px;
    }
    .lp-inline-embed.open {
      max-height: 500px; opacity: 1; margin-top: 4px;
      padding: 8px;
      background: ${bg === "#0D0D0D" ? "#111" : bg + "dd"};
      border: 1px solid ${accent}20;
      border-top: none;
      border-radius: 0 0 12px 12px;
    }
    .lp-open-app {
      display: flex; align-items: center; gap: 6px; justify-content: center;
      margin-top: 10px; padding: 8px; border-radius: 8px;
      font-size: 0.75rem; font-weight: 600; text-decoration: none;
      background: ${bg}; border: 1px solid ${accent}20;
      transition: background 0.2s;
    }
    .lp-open-app:hover { background: ${accent}15; }
    .lp-open-app svg { width: 14px; height: 14px; }

    .lp-embed { width: 100%; margin-top: 0.25rem; }
    .lp-yt-wrap { position: relative; padding-bottom: 56.25%; border-radius: 12px; overflow: hidden; }
    .lp-yt-wrap iframe { position: absolute; inset: 0; width: 100%; height: 100%; }

    .lp-divider { width: 40px; height: 2px; background: ${accent}; border-radius: 2px; margin: 0.5rem 0; }

    .lp-footer {
      margin-top: auto; padding-top: 2rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    }
    .lp-powered {
      font-size: 0.6rem; letter-spacing: 2px; text-transform: uppercase;
      opacity: 0.2;
    }
    .lp-zv { font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; opacity: 0.15; letter-spacing: 3px; }
    .lp-zv a { color: ${text}; text-decoration: none; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .lp-container > * { animation: fadeUp 0.5s ease-out both; }
    .lp-container > *:nth-child(1) { animation-delay: 0s; }
    .lp-container > *:nth-child(2) { animation-delay: 0.08s; }
    .lp-container > *:nth-child(3) { animation-delay: 0.16s; }
    .lp-container > *:nth-child(4) { animation-delay: 0.24s; }
    .lp-container > *:nth-child(5) { animation-delay: 0.32s; }
    .lp-container > *:nth-child(6) { animation-delay: 0.4s; }

    .lp-links > *:nth-child(1) { animation: fadeUp 0.4s ease-out 0.3s both; }
    .lp-links > *:nth-child(2) { animation: fadeUp 0.4s ease-out 0.38s both; }
    .lp-links > *:nth-child(3) { animation: fadeUp 0.4s ease-out 0.46s both; }
    .lp-links > *:nth-child(4) { animation: fadeUp 0.4s ease-out 0.54s both; }
    .lp-links > *:nth-child(5) { animation: fadeUp 0.4s ease-out 0.62s both; }
    .lp-links > *:nth-child(6) { animation: fadeUp 0.4s ease-out 0.7s both; }
    .lp-links > *:nth-child(7) { animation: fadeUp 0.4s ease-out 0.78s both; }
    .lp-links > *:nth-child(8) { animation: fadeUp 0.4s ease-out 0.86s both; }
  </style>
</head>
<body>
  <!-- Background effects -->
  <div class="lp-bg">
    <div class="lp-bg-glow1"></div>
    <div class="lp-bg-glow2"></div>
    <div class="lp-bg-lines"></div>
  </div>

  <!-- Header -->
  <div class="lp-header">
    <div class="lp-avatar">${page.avatar ? `<img src="${esc(page.avatar)}" alt="${title}" />` : title.slice(0, 2)}</div>
    <h1 class="lp-name">${title}</h1>
    ${bio ? `<p class="lp-bio">${bio}</p>` : ""}
  </div>

  <!-- Links -->
  <div class="lp-container">
    <div class="lp-links">${linksHtml}</div>
    <div class="lp-footer">
      <span class="lp-powered">Powered by</span>
      <span class="lp-zv"><a href="/">ZV RECORDS</a></span>
    </div>
  </div>
  <script>
    function toggleEmbed(id, btn) {
      const embed = document.getElementById(id);
      const isOpen = embed.classList.contains('open');
      // Close all others first
      document.querySelectorAll('.lp-inline-embed.open').forEach(e => {
        e.classList.remove('open');
        e.previousElementSibling?.classList.remove('open');
      });
      if (!isOpen) {
        embed.classList.add('open');
        btn.classList.add('open');
        // Scroll to show embed
        setTimeout(() => embed.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
      }
    }
  </script>
</body>
</html>`;
}
