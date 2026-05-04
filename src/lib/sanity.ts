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

export const QUERIES = {
  announcement: `*[_type == "announcement" && _id == "announcement-main"][0] { isActive, message, type, linkLabel, linkUrl }`,

  homePage: `*[_type == "homePage" && _id == "home-page"][0] {
    heroImage, heroHeadline, heroSubheadline, heroEyebrow, heroTagline, heroBody,
    statEventsPerSemester, statFoundedYear, statMemberCount,
    communityImage, communityHeadline, communityBody,
    communityPillars[] { iconName, title, description },
    imanPillars[] { iconName, title, description }
  }`,

  aboutPage: `*[_type == "aboutPage" && _id == "about-page"][0] {
    heroImage, heroHeadline, heroSubheadline, heroTagline,
    missionStatement, communityImage, communityBody,
    communityCards[] { iconName, title, description, gradient },
    imanCards[] { iconName, title, description, gradient }
  }`,

  resourcesPage: `*[_type == "resourcesPage" && _id == "resources-page"][0] {
    heroHeadline, heroSubheadline,
    resourceCards[] { emoji, iconName, title, description, backDescription, ctaText, link, gradient },
    jummahTime, jummahLocation, jummahNotes,
    imamName, imamTitle, imamPhoto, imamBio, imamOfficeHours, imamEmail, imamBookingUrl
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
    academicYear, presidentName,
    internalVPName, brothersSocialChairName, sistersSocialChairName, marketingChairName,
    externalVPName, advocacyChairName, brothersDawahChairName, sistersDawahChairName,
    secretaryName, businessManagerName
  }`,

  galleryAlbums: `*[_type == "galleryAlbum"] | order(coalesce(order, 9999) asc, eventDate desc) {
    title, "slug": slug.current, coverImage,
    "photoCount": count(photos), category, audience, eventDate
  }`,

  galleryAlbumBySlug: `*[_type == "galleryAlbum" && slug.current == $slug][0] {
    title, "slug": slug.current, coverImage, category, audience, eventDate,
    "photos": photos[] {
      "url": image.asset->url,
      "width": image.asset->metadata.dimensions.width,
      "height": image.asset->metadata.dimensions.height,
      caption
    }
  }`,
};
