export interface Artist {
  id: string;
  name: string;
  slug: string;
  genre: string;
  image: string;
  coverImage: string;
  bio: string;
  shortBio: string;
  socialLinks: SocialLinks;
  featuredVideo?: string;
  releases: Release[];
  videos: Video[];
}

export interface SocialLinks {
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  facebook?: string;
}

export interface Release {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  cover: string;
  releaseDate: string;
  type: "single" | "album" | "ep";
  streamingLinks: SocialLinks;
}

export interface Video {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  youtubeId: string;
  thumbnail: string;
  type: "music-video" | "clip" | "short" | "live";
  publishDate: string;
  views?: string;
}

export interface Genre {
  id: string;
  name: string;
  color: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  artistSlug?: string;
  subject: string;
  message: string;
  type: "booking" | "press" | "general" | "demo";
}
