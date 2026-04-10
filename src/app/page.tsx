import { HeroSection } from "@/components/home/hero-section";
import { ArtistsSection } from "@/components/home/artists-section";
import { VideosSection } from "@/components/home/videos-section";
import { ReleasesSection } from "@/components/home/releases-section";
import { AboutPreviewSection } from "@/components/home/about-preview-section";
import { ContactSection } from "@/components/home/contact-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ArtistsSection />
      <VideosSection />
      <ReleasesSection />
      <AboutPreviewSection />
      <ContactSection />
    </>
  );
}
