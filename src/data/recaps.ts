export type RecapAudience = "brothers" | "sisters" | "everyone";

export interface Recap {
  slug: string;
  title: string;
  /** ISO date at the precision supplied by the recap or reference. */
  date?: string;
  audience: RecapAudience;
  cover: string;
  slides: { src: string; alt: string; aspect: number }[];
  stat?: string;
}

function recap(slug: string, title: string, date: string | undefined, descriptions: string[], {
  audience = "everyone", aspect = 4 / 5, stat,
}: { audience?: RecapAudience; aspect?: number; stat?: string } = {}): Recap {
  const folder = `/photos/recaps/${slug}`;
  return {
    slug, title, date, audience, stat, cover: folder + "/cover.webp",
    slides: descriptions.map((alt, index) => ({
      src: folder + "/" + String(index + 1).padStart(2, "0") + ".webp", alt, aspect,
    })),
  };
}

export const recaps = [
  // Event dates use the MSA calendars. The Fall GBM month is from the owner; the exact day is unconfirmed.
  recap("fajr-breakfast-a", "Fajr & Breakfast", "2026-10-03", [
    "Fajr & Breakfast recap with friends and a dawn gathering by the river.",
    "Friends posing by the river and a group portrait at breakfast.",
    "Friends in scarves, breakfast drinks and group photos by the waterfront.",
    "Snapshots of students together at the riverside gathering.",
  ]),
  recap("cedar-point-recap", "Cedar Point", "2026-09-12", [
    "Cedar Point recap with collages of rides and students in the park.",
    "Students beside flowerbeds, midway games and amusement park rides.",
    "Group portraits, friends posing for a selfie and souvenir shops.",
    "Friends getting ready for rides, with photos of the roller coaster.",
    "Students posing around the park and outside its attractions.",
  ]),
  recap("ice-cream-social-a", "Ice Cream Social", "2026-08-28", [
    "Ice Cream Social recap with friends, refreshments and games outdoors.",
    "Snapshots of students on campus with an ice cream truck illustration.",
    "Students playing a giant four-in-a-row game and meeting on the lawn.",
    "Portraits from the social, including students gathered for outdoor prayer.",
  ]),
  recap("msa-gala", "The MSA Gala", "2026-04-17", [
    "The MSA Gala, with group portraits from the evening.",
    "Friends at their tables, a speaker and a close-up of the food.",
    "Group portraits and conversations around the gala tables.",
    "Friends in formal clothes posing in groups at the gala.",
    "Students serving dinner, speaking at the podium and gathering at tables.",
  ]),
  recap("fastathon", "Fast-a-Thon", "2026-03-04", [
    "Fastathon recap with a banquet hall and a speaker at the podium.",
    "Friends posing, guests at dinner and a talk from the podium.",
    "A group of friends and photos from the evening program.",
    "Students sharing dinner and helping at the buffet.",
    "Friends and speakers at the banquet with a Ramadan Mubarak greeting.",
  ]),
  recap("speaker-event", "When Faith Feels Heavy", "2026-11-06", [
    "Speaker event recap with photos of the talks and the audience.",
    "Students and guest speakers posing in the event hall.",
    "Group portraits and snapshots from the evening program.",
  ]),
  recap("world-hijab-day", "World Hijab Day", "2026-02-01", [
    "MSA at Pitt World Hijab Day recap with friends in colorful hijabs.",
    "Folded hijabs on a table and students posing in the hallway.",
    "Friends at the event and a tray of pastries.",
    "Students posing together in their hijabs.",
  ], { audience: "sisters" }),
  recap("brothers-paintball", "Brothers Paintball", "2025-11-01", [
    "Brothers Paintball recap with a paintball illustration and a photo of the field.",
    "Students in paintball gear and a group picture on the field.",
  ], { audience: "brothers" }),
  recap("banquet-for-gaza", "Banquet for Gaza", "2024-10-12", [
    "Speakers and guests during the Banquet for Gaza program.",
    "Guests, speakers and snapshots from the banquet raffle.",
  ], { aspect: 1 }),
  recap("charity-banquet", "Charity Banquet", "2026-10-22", [
    "Charity Banquet recap, with photographs of the speakers and guests.",
    "Guests and volunteers at the HDT table.",
    "Speakers and attendees during the charity banquet program.",
    "Students with an MSA tote and a view of the banquet audience.",
    "$14,915.18 raised for charity. One week, one community, one cause.",
  ], { stat: "$14,915.18 raised for charity" }),
  recap("friendsgiving", "Friendsgiving", "2026-11-19", [
    "MSA Friendsgiving recap with a buffet and dinner guests.",
    "Friends posing and helping serve food.",
    "Students sharing food and meeting around the dinner tables.",
    "Groups of friends posing at Friendsgiving.",
    "Friends posing together and guests around the dinner tables.",
  ]),
  recap("capa-picnic", "Pitt × CAPA MSA Picnic", "2026-10-17", [
    "Pitt and CAPA MSA picnic with students together outside.",
    "Students at a pavilion and an outdoor volleyball game.",
    "Friends in the park, with sunshine and picnic illustrations.",
    "Thank you for coming, with students at the playground.",
  ]),
  recap("fajr-breakfast-b", "Fajr & Breakfast", "2025-09-27", [
    "Fajr & Breakfast title and a waterfront group portrait.",
    "Friends posing with the Pittsburgh skyline behind them.",
    "Students by the water at dawn and a view of the city at night.",
    "Riverside snapshots and portraits from the gathering.",
  ]),
  recap("cedar-point", "Cedar Point", "2025-09-06", [
    "Cedar Point recap dated September 6, 2025, showing students and a ride.",
    "Friends posing in the park and beside rides.",
    "Group portraits across the amusement park.",
    "Students talking and walking along the midway.",
    "Friends together at Cedar Point in daylight and after dark.",
  ]),
  recap("fall-gbm-2025", "Fall GBM", "2025-09", [
    "MSA GBM cover with two groups of students.",
    "Students chatting before the general body meeting.",
    "Presenters in front of the screen and a group photo.",
    "Audience members and friends around the meeting hall.",
    "Students sharing food and catching up at the meeting.",
    "Group portraits and conversations around the hall.",
  ], { aspect: 1 }),
  recap("ice-cream-social-b", "Ice Cream Social", "2025-08-30", [
    "Ice Cream Social recap with group portraits by a campus building.",
    "Refreshments, friends on the lawn and groups meeting on August 30, 2025.",
    "Students playing games on the campus lawn.",
    "Students gathering on a blue mat and talking around campus.",
    "Group portraits of students outside a campus building.",
  ]),
  recap("freshman-orientation", "Freshman Orientation", "2026-08-21", [
    "Freshman orientation recap with students and a presentation.",
    "Students talking before the orientation session.",
    "Friends posing and listening to the orientation presentation.",
  ]),
].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

const shortMonths = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

export function recapDate(date: string | undefined, compact = false) {
  if (!date) return "Date to confirm";
  const [year, month] = date.split("-");
  const label = shortMonths.format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)));
  return compact ? `${label} '${year.slice(-2)}` : `${label} ${year}`;
}
