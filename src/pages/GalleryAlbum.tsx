import { communityAlbums } from "@/data/communityPhotos";
import { useDesign } from "@/design/options";
import { Picture, ContentScope, TextField, itemIdentity } from "@/editor/content";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Images } from "lucide-react";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import Lightbox from "@/components/Lightbox";
import { usePageMeta } from "@/lib/usePageMeta";
import { QUERIES, urlFor } from "@/lib/sanity";
import { useSanityData } from "@/hooks/useSanityData";

interface Photo {
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface AlbumData {
  title: string;
  slug: string;
  coverImage?: unknown;
  coverImageUrl?: string;
  category: string[];
  audience?: string;
  eventDate?: string;
  photos: Photo[];
}

export default function GalleryAlbumPage() {
  const { slug } = useParams<{ slug: string }>();
  const local = communityAlbums.find(a => a.slug === slug);
  return local ? <GalleryAlbum key={slug} album={local} loading={false}/> : <RemoteAlbum key={slug} slug={slug ?? ""}/>;
}

function RemoteAlbum({ slug }: { slug: string }) {
  const { data, loading } = useSanityData<AlbumData>(QUERIES.galleryAlbumBySlug, { slug });
  return <GalleryAlbum album={data} loading={loading}/>;
}

const GalleryAlbum = ({ album, loading }: { album: AlbumData | null; loading: boolean }) => {
  const {recap} = useDesign();
  const cover = album?.coverImageUrl || (album?.coverImage ? urlFor(album.coverImage).width(1600).height(600).fit("crop").auto("format").url() : undefined);
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
        {cover && album && (
          <>
            <div className="absolute inset-0">
              <Picture fieldId="GalleryAlbum_1"
                src={cover} sizes="100vw"
                alt={album.title}
                className="w-full h-full object-cover scale-105"
                width={1600}
                height={600}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#060B18]/80 via-[#060B18]/60 to-[#060B18]/95" />
            </div>
            <BridgeBar />
          </>
        )}
        {!cover && <BridgeBar />}

        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors font-body text-sm mb-6"
          >
            <ArrowLeft size={14} /><TextField id="GalleryAlbum_4">
            All Albums
          </TextField></Link>

          {loading ? (
            <div className="h-12 w-64 bg-white/10 rounded-lg animate-pulse" />
          ) : (
            <>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-3">
                <TextField id="GalleryAlbum_5">{album?.title ?? "Album Not Found"}</TextField>
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
                    {total}<TextField id="GalleryAlbum_6"> photo</TextField>{total !== 1 ? "s" : ""}
                  </span>
                )}
                {album?.audience && (
                  <span className="font-ui text-xs font-semibold tracking-widest uppercase text-white/40">
                    <TextField id="GalleryAlbum_7">{album.audience}</TextField>
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
                <ContentScope key={i} id={"GalleryAlbum_8-" + itemIdentity(_, i)}><div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" /></ContentScope>
              ))}
            </div>
          )}

          {!loading && photos.length === 0 && (
            <div className="text-center py-24">
              <Images size={40} className="text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-body text-muted-foreground"><TextField id="GalleryAlbum_9">
                No photos yet — check back soon.
              </TextField></p>
            </div>
          )}

          {!loading && photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
            >
              {photos.map((photo, i) => (
                <ContentScope key={i} id={"GalleryAlbum_10-" + itemIdentity(photo, i)}><motion.button
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.2 }}
                  onClick={() => openLightbox(i)}
                  className="group relative aspect-square rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Open photo ${i + 1}${photo.caption ? `: ${photo.caption}` : ""}`}
                >
                  <Picture fieldId="GalleryAlbum_11"
                    src={photo.url.startsWith("/") ? photo.url : photo.url + "?w=400&h=400&fit=crop&auto=format"}
                    alt={photo.caption || `Photo ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 290px"
                    width={400}
                    height={400}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="font-body text-xs text-white/90 line-clamp-1"><TextField id="GalleryAlbum_12">{photo.caption}</TextField></p>
                    </div>
                  )}
                </motion.button></ContentScope>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {recap && <div className="recap-link"><Link to="/events">Come to the next gathering →</Link></div>}
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ContentScope id={"GalleryAlbum_10-"+itemIdentity(photos[lightboxIndex],lightboxIndex)}><Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={next}
          onPrev={prev}
        /></ContentScope>
      )}
    </Layout>
  );
};
