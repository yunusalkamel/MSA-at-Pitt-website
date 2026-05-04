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

/**
 * Turns a Sanity image reference into a real URL.
 * Usage: urlFor(data.heroImage).width(1920).auto("format").url()
 */
export const urlFor = (source: SanityImageSource) => builder.image(source);

// ── GROQ Queries ──────────────────────────────────────────────────────────────
// These are the questions we ask Sanity to get data back.
// Each one maps to a section your team can edit in the Studio.

export const QUERIES = {
  // Site-wide announcement bar
  announcement: `
    *[_type == "announcement" && _id == "announcement-main"][0] {
      isActive, message, type, linkLabel, linkUrl
    }
  `,

  // Homepage — hero, stats, pillars, community section
  homePage: `
    *[_type == "homePage" && _id == "home-page"][0] {
      heroImage, heroHeadline, heroSubheadline, heroBody,
      statMemberCount, statEventCount, statFoundedYear,
      communityImage, communityBody,
      communityPillars[] { iconName, title, description },
      imanPillars[] { iconName, title, description }
    }
  `,

  // About page — hero, mission text, pillar cards
  aboutPage: `
    *[_type == "aboutPage" && _id == "about-page"][0] {
      heroImage, heroHeadline, heroSubheadline, heroTagline,
      missionStatement, communityImage,
      communityCards[] { iconName, title, description, gradient },
      imanCards[] { iconName, title, description, gradient }
    }
  `,

  // Resources page — cards, Jummah info, Imam bio
  resourcesPage: `
    *[_type == "resourcesPage" && _id == "resources-page"][0] {
      heroHeadline, heroSubheadline,
      resourceCards[] { emoji, iconName, title, description, backDescription, ctaText, link, gradient },
      jummahTime, jummahLocation, jummahNotes,
      imamName, imamTitle, imamPhoto, imamBio, imamOfficeHours, imamEmail, imamBookingUrl
    }
  `,

  // FAQ — list of questions and answers
  faqItems: `
    *[_type == "faqItem"] | order(order asc) { question, answer }
  `,

  // Board leadership — all roles and names for org chart
  leadership: `
    *[_type == "leadership" && _id == "leadership-current"][0] {
      academicYear,
      presidentName,
      internalVPName, brothersSocialChairName, sistersSocialChairName, marketingChairName,
      externalVPName, advocacyChairName, brothersDawahChairName, sistersDawahChairName,
      secretaryName, businessManagerName
    }
  `,

  // Gallery — all albums for the main grid
  galleryAlbums: `
    *[_type == "galleryAlbum"] | order(coalesce(order, 9999) asc, eventDate desc) {
      title,
      "slug": slug.current,
      coverImage,
      photoCount,
      "photoCount": count(photos),
      category,
      audience,
      eventDate
    }
  `,

  // Single album by slug — for the album detail page
  galleryAlbumBySlug: `
    *[_type == "galleryAlbum" && slug.current == $slug][0] {
      title,
      "slug": slug.current,
      coverImage,
      category,
      audience,
      eventDate,
      "photos": photos[] {
        "url": image.asset->url,
        "width": image.asset->metadata.dimensions.width,
        "height": image.asset->metadata.dimensions.height,
        caption
      }
    }
  `,
};
