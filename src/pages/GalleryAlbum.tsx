import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Images } from "lucide-react";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import Lightbox from "@/components/Lightbox";
import { usePageMeta } from "@/lib/usePageMeta";
import { sanityClient, QUERIES, urlFor } from "@/lib/sanity";
import { useState as useStateAlias, useEffect } from "react";

interface Photo {
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface AlbumData {
  title: string;
  slug: string;
  coverImage: unknown;
  category: string[];
  audience?: string;
  eventDate?: string;
  photos: Photo[];
}

function useAlbum(slug: string | undefined) {
  const [data, setData] = useState<AlbumData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    sanityClient
      .fetch<AlbumData>(QUERIES.galleryAlbumBySlug, { slug })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  return { data, loading };
}

const GalleryAlbum = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: album, loading } = useAlbum(slug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  usePageMeta({
    title: album ? `${album.title} — Gallery` : "Gallery — MSA at Pitt",
    description: album ? `Photos from ${album.title}` : "",
  });

  const photos = album?.photos ?? [];
  const total = photos.length;

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const next = () => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % total));
  const prev = () => setLightboxIndex((i) => (i === null ? 0 : (i - 1 + total) % total));

  const formatDate = (d?: string) => {
    if (!d) return null;
    return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 overflow-hidden">
        {album?.coverImage && (
          <>
            <div className="absolute inset-0">
              <img
                src={urlFor(album.coverImage).width(1600).height(600).fit("crop").auto("format").url()}
                alt={album.title}
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#060B18]/80 via-[#060B18]/60 to-[#060B18]/95" />
            </div>
            <BridgeBar />
          </>
        )}
        {!album?.coverImage && <BridgeBar />}

        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors font-body text-sm mb-6"
          >
            <ArrowLeft size={14} />
            All Albums
          </Link>

          {loading ? (
            <div className="h-12 w-64 bg-white/10 rounded-lg animate-pulse" />
          ) : (
            <>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-3">
                {album?.title ?? "Album Not Found"}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                {formatDate(album?.eventDate) && (
                  <span className="font-ui text-xs font-semibold tracking-widest uppercase text-white/40">
                    {formatDate(album?.eventDate)}
                  </span>
                )}
                {total > 0 && (
                  <span className="inline-flex items-center gap-1.5 font-ui text-xs font-semibold tracking-widest uppercase text-white/40">
                    <Images size={12} />
                    {total} photo{total !== 1 ? "s" : ""}
                  </span>
                )}
                {album?.audience && (
                  <span className="font-ui text-xs font-semibold tracking-widest uppercase text-white/40">
                    {album.audience}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Photo Grid */}
      <section className="section-padding relative">
        <div className="absolute inset-0 steps-surface" />
        <div className="max-w-6xl mx-auto relative z-10">

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {!loading && photos.length === 0 && (
            <div className="text-center py-24">
              <Images size={40} className="text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-body text-muted-foreground">
                No photos yet — check back soon.
              </p>
            </div>
          )}

          {!loading && photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
            >
              {photos.map((photo, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.2 }}
                  onClick={() => openLightbox(i)}
                  className="group relative aspect-square rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Open photo ${i + 1}${photo.caption ? `: ${photo.caption}` : ""}`}
                >
                  <img
                    src={photo.url + "?w=400&h=400&fit=crop&auto=format"}
                    alt={photo.caption || `Photo ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    width={400}
                    height={400}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="font-body text-xs text-white/90 line-clamp-1">{photo.caption}</p>
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={next}
          onPrev={prev}
        />
      )}
    </Layout>
  );
};

export default GalleryAlbum;
