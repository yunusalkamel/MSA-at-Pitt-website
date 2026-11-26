const captions = {
  "river-talk": "Students listening beside the river at sunset",
  "rink-friends": "Friends together at the rink",
  "rink-group": "Group photo on the ice",
  "rink-skates": "Lacing up skates",
  "river-speaker": "A speaker at the riverside gathering",
  "fall-walk": "Students walking along a tree-lined path",
  "park-day": "A sunny afternoon at the amusement park",
  "flowers": "Bouquets from Bouquet Night",
  "lecture": "A speaker addressing students in the hall",
  "hall-wide": "The audience gathered in the hall",
  "hall-friends": "Three friends after the talk",
  "hall-group": "Students together after the talk",
  "friends-dusk": "Friends outdoors at dusk",
  "students": "Students outside a campus building",
  "day-trip": "Friends gathered at the waterfront sign",
  "lakeshore": "Looking out over the lake",
  "lawn-friends": "A selfie on the lawn",
  "panel": "A panel discussion on stage",
  "serving": "Students helping at a serving table",
  "campus-friends": "Friends gathered outside on campus",
  "gathering": "Students greeting one another indoors",
  "dinner-friends": "Friends talking over dinner",
  "potluck": "Students serving a shared meal",
  "table-friends": "A selfie at the table",
  "volunteers": "Students in aprons around a serving table",
  "gala-table": "Friends at a gala table",
  "gala-portraits": "Students posing together at the MSA gala",
  "gala-group": "A group portrait at the MSA gala",
  "ballroom": "Students gathered in a ballroom",
  "banquet": "A view across a full banquet hall",
  "henna": "Henna at Salaam Social",
  "cookout": "Friends at an evening cookout",
  "grill": "Cooking together at the grill",
  "craft-table": "Students making cards together",
  "craft-friends": "Friends working around a table",
  "craft-detail": "Lettering a handmade card",
  "craft-group": "Students holding up their finished cards",
  "lettering": "Adding a design to a card",
  "lawn-prayer": "Students praying outdoors on campus",
  "meeting": "A group photo after a campus gathering",
  "tea": "Friends sharing tea at Dobra Tea",
  "fajr-group": "Students gathered for Fajr and Breakfast",
  "fajr-bridge": "The bridge at Fajr and Breakfast",
  "friendsgiving-serve": "Serving dinner at Friendsgiving",
  "friendsgiving-food": "The Friendsgiving buffet",
  "friendsgiving-hall": "Students gathered around Friendsgiving tables",
  "friendsgiving-table": "Friends sharing a meal at Friendsgiving",
  "sudan-iftar": "A shared meal at the Sudan Iftar"
} as const;

export type PhotoId = keyof typeof captions;
export function communityPhoto(id: PhotoId) {
  return { id, title: captions[id], src: "/photos/community/" + id + ".webp" };
}

export const daylightWall: PhotoId[] = [
  "campus-friends", "friendsgiving-serve", "flowers", "craft-table",
  "park-day", "hall-group", "tea", "lawn-prayer",
  "river-talk", "students", "gala-table", "serving",
  "lawn-friends", "craft-group", "hall-wide", "day-trip",
  "henna", "fall-walk", "volunteers", "gathering",
];
export const eveningWall: PhotoId[] = [
  "fajr-bridge", "gala-portraits", "rink-friends", "friendsgiving-table",
  "cookout", "sudan-iftar", "friends-dusk", "gala-group",
  "river-talk", "ballroom", "table-friends", "rink-group",
  "banquet", "panel", "grill", "dinner-friends",
  "potluck", "friendsgiving-hall", "lakeshore", "fajr-group",
];

function album(slug: string, title: string, category: string[], ids: PhotoId[], eventDate?: string) {
  const shots = ids.map(communityPhoto);
  return {
    slug, title, category, eventDate,
    coverImageUrl: shots[0].src,
    photoCount: shots.length,
    photos: shots.map(p => ({ url: p.src, caption: p.title })),
    shots: shots.map(p => ({ src: p.src, caption: p.title })),
  };
}

export const communityAlbums = [
  album("pitt-friendsgiving", "Friendsgiving", ["social", "general", "fall25"], ["friendsgiving-serve", "friendsgiving-food", "friendsgiving-hall", "friendsgiving-table"]),
  album("pitt-msa-gala", "MSA Gala", ["signature", "general", "spring26"], ["gala-portraits", "gala-table", "gala-group"], "2026-04-17"),
  album("pitt-fajr-breakfast", "Fajr and Breakfast", ["dawah", "general", "fall25"], ["fajr-bridge", "fajr-group"], "2025-09-26"),
  album("pitt-card-making", "Making cards together", ["social", "general", "spring26"], ["craft-table", "craft-friends", "craft-detail", "craft-group", "lettering"], "2026-03-22"),
  album("pitt-sudan-iftar", "Sudan Iftar", ["general", "spring25"], ["sudan-iftar"], "2025-03-26"),
  album("pitt-on-the-ice", "On the ice", ["social", "general", "spring26"], ["rink-group", "rink-friends", "rink-skates"], "2026-01-16"),
  album("pitt-campus-life", "Around campus", ["general"], ["students", "flowers", "henna", "tea", "fall-walk", "campus-friends", "lawn-prayer", "lawn-friends", "meeting", "gathering"]),
  album("pitt-community-table", "At the community table", ["general"], ["potluck", "volunteers", "dinner-friends", "table-friends", "serving", "cookout", "grill"]),
  album("pitt-days-out", "Days out together", ["social", "general"], ["river-talk", "river-speaker", "park-day", "day-trip", "lakeshore", "friends-dusk"]),
  album("pitt-gatherings", "In the audience", ["general"], ["hall-wide", "lecture", "hall-friends", "hall-group", "ballroom", "banquet", "panel"]),
];
