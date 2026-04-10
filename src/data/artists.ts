import { Artist } from "@/types";

export const artists: Artist[] = [
  {
    id: "1",
    name: "VELOZ",
    slug: "veloz",
    genre: "reggaeton",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1920&h=1080&fit=crop",
    bio: "VELOZ es uno de los artistas más prometedores de la escena urbana latina. Con su estilo único que fusiona reggaetón con elementos electrónicos, ha conquistado millones de reproducciones en plataformas digitales. Su energía en el escenario es incomparable, llevando cada show a otro nivel.",
    shortBio: "El futuro del reggaetón con beats electrónicos que rompen fronteras.",
    socialLinks: {
      spotify: "https://spotify.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      tiktok: "https://tiktok.com",
      appleMusic: "https://music.apple.com",
    },
    featuredVideo: "dQw4w9WgXcQ",
    releases: [
      {
        id: "r1",
        title: "Velocidad Máxima",
        artistId: "1",
        artistName: "VELOZ",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop",
        releaseDate: "2026-03-01",
        type: "album",
        streamingLinks: { spotify: "https://spotify.com" },
      },
      {
        id: "r2",
        title: "Noche Eterna",
        artistId: "1",
        artistName: "VELOZ",
        cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop",
        releaseDate: "2026-02-14",
        type: "single",
        streamingLinks: { spotify: "https://spotify.com" },
      },
    ],
    videos: [
      {
        id: "v1",
        title: "Velocidad Máxima (Official Video)",
        artistId: "1",
        artistName: "VELOZ",
        youtubeId: "dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=480&h=270&fit=crop",
        type: "music-video",
        publishDate: "2026-03-01",
        views: "2.5M",
      },
    ],
  },
  {
    id: "2",
    name: "LUNA ROJA",
    slug: "luna-roja",
    genre: "trap",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=600&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1920&h=1080&fit=crop",
    bio: "LUNA ROJA ha redefinido el trap latino con su lírica cruda y beats oscuros. Desde los barrios hasta los escenarios más grandes, su música cuenta historias reales con una honestidad que conecta profundamente con su audiencia. Cada track es un viaje emocional.",
    shortBio: "Trap con alma, lírica cruda y beats que golpean el corazón.",
    socialLinks: {
      spotify: "https://spotify.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      tiktok: "https://tiktok.com",
    },
    featuredVideo: "dQw4w9WgXcQ",
    releases: [
      {
        id: "r3",
        title: "Eclipse",
        artistId: "2",
        artistName: "LUNA ROJA",
        cover: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=400&fit=crop",
        releaseDate: "2026-02-28",
        type: "ep",
        streamingLinks: { spotify: "https://spotify.com" },
      },
    ],
    videos: [
      {
        id: "v2",
        title: "Eclipse (Official Video)",
        artistId: "2",
        artistName: "LUNA ROJA",
        youtubeId: "dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=480&h=270&fit=crop",
        type: "music-video",
        publishDate: "2026-02-28",
        views: "1.8M",
      },
    ],
  },
  {
    id: "3",
    name: "NOVA",
    slug: "nova",
    genre: "pop",
    image: "https://images.unsplash.com/photo-1529518969858-8baa65152fc8?w=600&h=600&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&h=1080&fit=crop",
    bio: "NOVA es la voz del pop latino moderno. Su capacidad para combinar melodías pegajosas con letras profundas la han convertido en una de las artistas más escuchadas de la generación. Con una presencia escénica magnética, cada concierto es una experiencia inolvidable.",
    shortBio: "La voz del pop latino que no puedes sacar de tu cabeza.",
    socialLinks: {
      spotify: "https://spotify.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      appleMusic: "https://music.apple.com",
    },
    featuredVideo: "dQw4w9WgXcQ",
    releases: [
      {
        id: "r4",
        title: "Supernova",
        artistId: "3",
        artistName: "NOVA",
        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
        releaseDate: "2026-03-15",
        type: "album",
        streamingLinks: { spotify: "https://spotify.com" },
      },
    ],
    videos: [
      {
        id: "v3",
        title: "Supernova (Official Video)",
        artistId: "3",
        artistName: "NOVA",
        youtubeId: "dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1529518969858-8baa65152fc8?w=480&h=270&fit=crop",
        type: "music-video",
        publishDate: "2026-03-15",
        views: "5.2M",
      },
    ],
  },
  {
    id: "4",
    name: "EL FANTASMA URBANO",
    slug: "el-fantasma-urbano",
    genre: "hip-hop",
    image: "https://images.unsplash.com/photo-1547355253-ff0740f6e8c1?w=600&h=600&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1920&h=1080&fit=crop",
    bio: "EL FANTASMA URBANO es un MC de la vieja escuela con flows de nueva generación. Su técnica lírica y su capacidad para improvisar lo han posicionado como uno de los mejores raperos de habla hispana. Cada verso es una obra maestra de storytelling urbano.",
    shortBio: "MC legendario con flows que desafían la gravedad.",
    socialLinks: {
      spotify: "https://spotify.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
    },
    featuredVideo: "dQw4w9WgXcQ",
    releases: [
      {
        id: "r5",
        title: "Sombras del Barrio",
        artistId: "4",
        artistName: "EL FANTASMA URBANO",
        cover: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=400&fit=crop",
        releaseDate: "2026-01-20",
        type: "album",
        streamingLinks: { spotify: "https://spotify.com" },
      },
    ],
    videos: [
      {
        id: "v4",
        title: "Sombras (Official Video)",
        artistId: "4",
        artistName: "EL FANTASMA URBANO",
        youtubeId: "dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1547355253-ff0740f6e8c1?w=480&h=270&fit=crop",
        type: "music-video",
        publishDate: "2026-01-20",
        views: "3.1M",
      },
    ],
  },
  {
    id: "5",
    name: "ZAFIRO",
    slug: "zafiro",
    genre: "urbano",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&h=600&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1920&h=1080&fit=crop",
    bio: "ZAFIRO fusiona lo mejor del urbano con R&B y soul latino. Su voz aterciopelada y sus producciones sofisticadas la han convertido en una artista imprescindible del panorama musical. Cada canción es una joya que brilla con luz propia.",
    shortBio: "Urbano con alma R&B, cada nota es una joya preciosa.",
    socialLinks: {
      spotify: "https://spotify.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      tiktok: "https://tiktok.com",
      appleMusic: "https://music.apple.com",
    },
    featuredVideo: "dQw4w9WgXcQ",
    releases: [
      {
        id: "r6",
        title: "Brillo Eterno",
        artistId: "5",
        artistName: "ZAFIRO",
        cover: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop",
        releaseDate: "2026-03-10",
        type: "single",
        streamingLinks: { spotify: "https://spotify.com" },
      },
    ],
    videos: [
      {
        id: "v5",
        title: "Brillo Eterno (Official Video)",
        artistId: "5",
        artistName: "ZAFIRO",
        youtubeId: "dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=480&h=270&fit=crop",
        type: "music-video",
        publishDate: "2026-03-10",
        views: "4.7M",
      },
    ],
  },
  {
    id: "6",
    name: "TORMENTA",
    slug: "tormenta",
    genre: "corridos",
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=600&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&h=1080&fit=crop",
    bio: "TORMENTA ha revolucionado los corridos tumbados con un sonido fresco que conecta con las nuevas generaciones. Su estilo auténtico y letras que cuentan historias del pueblo lo han convertido en un fenómeno cultural.",
    shortBio: "Corridos tumbados del futuro, historias que golpean el alma.",
    socialLinks: {
      spotify: "https://spotify.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      tiktok: "https://tiktok.com",
    },
    featuredVideo: "dQw4w9WgXcQ",
    releases: [
      {
        id: "r7",
        title: "Truenos y Relámpagos",
        artistId: "6",
        artistName: "TORMENTA",
        cover: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=400&fit=crop",
        releaseDate: "2026-02-01",
        type: "album",
        streamingLinks: { spotify: "https://spotify.com" },
      },
    ],
    videos: [
      {
        id: "v6",
        title: "Truenos (Official Video)",
        artistId: "6",
        artistName: "TORMENTA",
        youtubeId: "dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=480&h=270&fit=crop",
        type: "music-video",
        publishDate: "2026-02-01",
        views: "8.3M",
      },
    ],
  },
];

export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}

export function getArtistsByGenre(genreId: string): Artist[] {
  if (genreId === "all") return artists;
  return artists.filter((a) => a.genre === genreId);
}

export function getAllReleases() {
  return artists
    .flatMap((a) => a.releases)
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
}

export function getAllVideos() {
  return artists
    .flatMap((a) => a.videos)
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
}
