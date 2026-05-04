import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

// ─── FILL THESE IN ────────────────────────────────────────────────────────────
// Same values as in your sanity-studio/sanity.config.ts
const PROJECT_ID = "rwdbbktc";
const DATASET = "production";
// ──────────────────────────────────────────────────────────────────────────────

export const sanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: "2024-01-01",
  useCdn: true, // serve from cache — content updates appear within ~60 seconds
});

const builder = imageUrlBuilder(sanityClient);

/**
 * Build a Sanity CDN image URL with optional transformations.
 *
 * Usage:
 *   urlFor(data.heroImage).width(1920).auto("format").url()
 *   urlFor(data.coverImage).width(800).height(500).fit("crop").url()
 */
export const urlFor = (source: SanityImageSource) => builder.image(source);

// ── GROQ Queries ──────────────────────────────────────────────────────────────

export const QUERIES = {
  announcement: `
    *[_type == "announcement" && _id == "announcement-main"][0] {
      isActive, message, type, linkLabel, linkUrl
    }
  `,

  homePage: `
    *[_type == "homePage" && _id == "home-page"][0] {
      heroImage, heroHeadline, heroSubheadline, heroBody,
      statMemberCount, statEventCount, statFoundedYear,
      communityImage, communityBody,
      communityPillars[] { iconName, title, description },
      imanPillars[] { iconName, title, description }
    }
  `,

  aboutPage: `
    *[_type == "aboutPage" && _id == "about-page"][0] {
      heroImage, heroHeadline, heroSubheadline, heroTagline,
      missionStatement, communityImage,
      communityCards[] { iconName, title, description, gradient },
      imanCards[] { iconName, title, description, gradient }
    }
  `,

  resourcesPage: `
    *[_type == "resourcesPage" && _id == "resources-page"][0] {
      heroHeadline, heroSubheadline,
      resourceCards[] { emoji, iconName, title, description, backDescription, ctaText, link, gradient },
      jummahTime, jummahLocation, jummahNotes,
      imamName, imamTitle, imamPhoto, imamBio, imamOfficeHours, imamEmail, imamBookingUrl
    }
  `,

  faqItems: `
    *[_type == "faqItem"] | order(order asc) { question, answer }
  `,

  leadership: `
    *[_type == "leadership" && _id == "leadership-current"][0] {
      academicYear,
      presidentName,
      internalVPName, brothersSocialChairName, sistersSocialChairName, marketingChairName,
      externalVPName, advocacyChairName, brothersDawahChairName, sistersDawahChairName,
      secretaryName, businessManagerName
    }
  `,

  galleryAlbums: `
    *[_type == "galleryAlbum"] | order(coalesce(order, 9999) asc, eventDate desc) {
      title, coverImage, photoCount, category, audience, albumUrl, eventDate
    }
  `,
};
