# MSA at Pitt photography

- **Daylight wall** has 26 photographs selected for the light-mode home hero.
- **Evening wall** has 26 photographs selected for the dark-mode home hero. A few photographs work in both themes. The Pittsburgh bridge stays on the dark desktop wall.
- **Full library** has 55 photographs for the gallery, About page, and other site sections. Their IDs, focal points, and album metadata live in `src/data/communityPhotos.ts`.

Community images have a full WebP and smaller `-320` and `-720` versions. The phone collage uses `-tile.webp` portrait crops. Wide groups and images that lose their subject in a portrait crop stay out of the phone collage.

Captions use the album name and its verified month and year when available. Undated albums show their name. The missing dates are tracked in the photo data.
