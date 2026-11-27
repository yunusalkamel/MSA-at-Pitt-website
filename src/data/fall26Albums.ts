import { recaps } from "./recaps";

// The source photographs for these events are currently available as recap sheets.
export const fall26Albums = recaps.flatMap((recap) =>
  recap.date?.startsWith("2026-") && recap.date.slice(5, 7) >= "08"
    ? [{
        slug: "fall-2026-" + recap.slug,
        title: recap.title,
        eventDate: recap.date,
        category: ["fall26"],
        coverImageUrl: recap.cover,
        photoCount: recap.slides.length,
        photos: recap.slides.map(slide => ({ url: slide.src, caption: slide.alt })),
      }]
    : [],
);
