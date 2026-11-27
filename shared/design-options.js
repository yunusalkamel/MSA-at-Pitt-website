// The alternatives retained from PR #55. "site" keeps the current production rendering.
export const designChoices = {
  hero: { label: "Hero", choices: {site:"Current collage", single:"Single photo", reel:"Photo reel"} },
  framing: { label:"Hero framing", choices:{site:"Full screen",split:"Split layout"} },
  density: { label:"Desktop collage", choices:{site:"4 × 4",sparse:"2 × 2",dense:"5 × 5"} },
  rotation: { label:"Collage rotation", choices:{site:"Current cadence",slow:"Slow",still:"Static"} },
  photography: {label:"Day and evening photography",choices:{site:"Follow theme",day:"Always daylight",night:"Always evening"}},
  texture: { label:"Hero texture", choices:{site:"Film grain",plain:"Clean",halftone:"Halftone"} },
  background: { label:"Page background", choices:{site:"Continuous",original:"Section backgrounds"} },
  transitions: { label:"Section transitions", choices:{site:"Current rules",seamless:"Seamless",bands:"Soft color bands"} },
  stats: { label:"Homepage stats", choices:{site:"Low float",flow:"In flow",hidden:"Hidden"} },
  order: { label:"Homepage section order", choices:{site:"Current order",events:"Lead with events",story:"Lead with community"} },
  navigation: { label:"Navigation material", choices:{site:"Frosted pill",solid:"Solid pill",bar:"Full-width bar"} },
  prayerNav: { label:"Prayer in navigation", choices:{site:"Menu link and next prayer",link:"Menu link only"} },
  announcement: { label:"Announcement strip", choices:{site:"Compact",roomy:"Roomy",hidden:"Hidden"} },
  resource: { label:"Resource cards", choices:{site:"Current photo cards",flat:"Flat",tint:"Photo tint",frost:"Frosted photo"} },
  resourceDetails: { label:"Resource card details", choices:{site:"Current behavior",visible:"Always visible"} },
  gallery: { label:"Photo albums layout", choices:{site:"Contact sheet",filmstrip:"Filmstrip",spotlight:"Spotlight"} },
  highlights: { label:"Homepage highlights", choices:{site:"Current sections",quiet:"Hide stats and first-visit guide"} },
  theme: { label:"Theme", choices:{site:"Visitor preference",light:"Always light",dark:"Always dark"} },
  themeMotion: { label:"Theme transition", choices:{site:"Soft",instant:"Instant"} },
};

export const originalDesign = {
  framing:"split",density:"sparse",rotation:"still",texture:"plain",background:"original",
  stats:"flow",order:"story",navigation:"solid",prayerNav:"link",resource:"flat",
  resourceDetails:"visible",themeMotion:"instant",
};
