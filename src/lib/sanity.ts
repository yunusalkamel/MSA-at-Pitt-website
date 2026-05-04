import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const PROJECT_ID = "rwdbbktc";
const DATASET = "production";

export const sanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: "2024-01-01",
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (source: SanityImageSource) => builder.image(source);

/**
 * Returns a tiny (~30px wide), heavily blurred version of a Sanity image,
 * suitable for use as a CSS `background-image` placeholder while the
 * full-resolution image loads. Kills the "flash to bundled fallback".
 */
export const lqipFor = (source: SanityImageSource) =>
  builder.image(source).width(30).quality(20).blur(50).url();

// ── GROQ queries ──────────────────────────────────────────────────────────────
// We pull `asset->metadata.lqip` where useful so components can render a base64
// blur placeholder synchronously. For images shaped `{ asset, hotspot, crop }`
// you need to spread `...` into the projection (Sanity preserves that shape).

export const QUERIES = {
  announcement: `*[_type == "announcement" && _id == "announcement-main"][0] {
    isActive, message, type, linkLabel, linkUrl
  }`,

  homePage: `*[_type == "homePage" && _id == "home-page"][0] {
    heroImage { ..., "lqip": asset->metadata.lqip },
    heroHeadline, heroSubheadline, heroEyebrow, heroTagline, heroBody,
    statEventsPerSemester, statFoundedYear, statMemberCount,
    communityImage { ..., "lqip": asset->metadata.lqip },
    communityHeadline, communityBody,
    communityPillars[] { iconName, title, description },
    imanPillars[] { iconName, title, description }
  }`,

  aboutPage: `*[_type == "aboutPage" && _id == "about-page"][0] {
    heroImage { ..., "lqip": asset->metadata.lqip },
    heroHeadline, heroSubheadline, heroTagline,
    missionStatement,
    communityImage { ..., "lqip": asset->metadata.lqip },
    communityBody,
    communityCards[] { iconName, title, description, gradient },
    imanCards[] { iconName, title, description, gradient }
  }`,

  resourcesPage: `*[_type == "resourcesPage" && _id == "resources-page"][0] {
    heroHeadline, heroSubheadline,
    resourceCards[] { emoji, iconName, title, description, backDescription, ctaText, link, gradient },
    jummahTime, jummahLocation, jummahNotes,
    imamName, imamTitle,
    imamPhoto { ..., "lqip": asset->metadata.lqip },
    imamBio, imamOfficeHours, imamEmail, imamBookingUrl
  }`,

  newToPittPage: `*[_type == "newToPittPage" && _id == "new-to-pitt-page"][0] {
    heroHeadline, heroSubheadline,
    dayToDay, dormTips,
    halalOnCampus[] { name, note }, halalNearby, halalFarther, halalDesserts,
    ramadanTips, networkingTips, socialTips,
    commuter_parking, commuter_microwaves, sportsTips
  }`,

  prayerLocationsPage: `*[_type == "prayerLocationsPage" && _id == "prayer-locations-page"][0] {
    heroHeadline, heroSubheadline,
    onCampusSpaces[] { name, detail, features },
    masajid[] { name, distance, details, mapsUrl }
  }`,

  joinPage: `*[_type == "joinPage" && _id == "join-page"][0] {
    heroHeadline, heroSubheadline,
    steps[] { num, headline, copy, ctaText, href },
    whatHappensNext[] { iconName, title, description },
    presidentQuote
  }`,

  faqItems: `*[_type == "faqItem"] | order(order asc) { question, answer }`,

  leadership: `*[_type == "leadership" && _id == "leadership-current"][0] {
    academicYear,
    presidentName, presidentMajor,
    internalVPName, brothersSocialChairName, sistersSocialChairName, marketingChairName,
    externalVPName, advocacyChairName, brothersDawahChairName, sistersDawahChairName,
    secretaryName, businessManagerName,
    cecChairName
  }`,

  galleryAlbums: `*[_type == "galleryAlbum"] | order(coalesce(order, 9999) asc, eventDate desc) {
    title, "slug": slug.current,
    coverImage { ..., "lqip": asset->metadata.lqip },
    "photoCount": count(photos), category, audience, eventDate,
    "year": coalesce(string(eventDate), "")
  }`,

  /** A trimmed set of recent gallery albums for the homepage preview. */
  galleryAlbumsPreview: `*[_type == "galleryAlbum"] | order(coalesce(order, 9999) asc, eventDate desc) [0...3] {
    title, "slug": slug.current,
    coverImage { ..., "lqip": asset->metadata.lqip },
    eventDate
  }`,

  galleryAlbumBySlug: `*[_type == "galleryAlbum" && slug.current == $slug][0] {
    title, "slug": slug.current,
    coverImage { ..., "lqip": asset->metadata.lqip },
    category, audience, eventDate,
    "photos": photos[] {
      "url": image.asset->url,
      "lqip": image.asset->metadata.lqip,
      "width": image.asset->metadata.dimensions.width,
      "height": image.asset->metadata.dimensions.height,
      caption
    }
  }`,
};
