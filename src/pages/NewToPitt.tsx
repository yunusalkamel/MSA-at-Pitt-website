import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Utensils, BookOpen, Users, Briefcase, Trophy, Bus, Mic2 } from "lucide-react";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import SectionDivider from "@/components/SectionDivider";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";

/* ── Data transposed from the MSA Tips for Freshmen Google Doc ── */

const dayToDay = [
  "Plan your meals into your schedule and actually try to stick to them — it's easy to accidentally skip once classes stack up.",
  "Structure your day around your prayers. If you don't build that in from the beginning, it gets a lot harder later.",
  "Try to get 7–8 hours of sleep and keep your schedule consistent. Focus, memory, and mood depend on it more than you think.",
  "Make friends with at least a couple people in your classes — great for accountability, discussion, and getting notes if you miss a day.",
  "The 'teach your friends' study trick works: it helps you identify weak spots while solidifying what you know.",
  "The tunnel outside of Towers goes to Barco, Posvar, and David Lawrence — often faster than going outside.",
  "Remember your bus pass goes everywhere! Explore the rest of the city. Many museums are free with a Pitt ID.",
];

const dorms = [
  "Communicate prayer/privacy needs with your roommate early. Don't wait until there's tension.",
  "Discuss guests, noise, cleanliness, and fridge/storage upfront.",
  "Navigate bathroom and wudu concerns respectfully.",
  "Best dorms for private bathrooms (helpful for wudu): Bruce, Sutherland, Irvis. If you're in a communal bathroom, a portable bidet works well.",
  "Towers, Quad dorms, and Nordenberg are centrally located — great for getting around by bus or on foot.",
];

const halalFood = {
  onCampus: [
    { name: "The Eatery", note: "All fresh beef and chicken breast are halal. Saffron: only chicken guaranteed halal. Food Truck: chicken tenders halal." },
    { name: "The Perch", note: "All fresh beef only." },
    { name: "On-campus restaurants", note: "PA Tacos, True Burger, Pom and Honey, Delicatessen, Laynes, Chik'n (watch bacon in loaded fries), Prince of India, Omar's Halal Grill, Pizza Romano (chicken, salami, pepperoni — not beef)." },
  ],
  nearby: [
    "Shah's Halal Food (South O)", "Frenchies Deli + Market (South O)", "Pitt Halal Bros (South O)",
    "Ege Mediterranean", "Bengal Kabab House (South O)", "Scotty's Market deli (must try)",
    "Sultan Bey (by ICP)", "Aria Persian Cuisine & Turkish Grille",
  ],
  farther: [
    "Salem's Market — Strip District (halal butcher + full grocery)", "Pasha — Shadyside", "Choolaah — Shadyside",
    "Alihan's — Shadyside", "Uptown Kitchen — Downtown", "Mad Chicken — Downtown",
    "98k Chicken — Squirrel Hill", "Kabab King", "Kabab n Curry", "Afghan Kabab House (by AIC)",
    "Kavsar — Uzbek, Mt. Washington", "Lahore Spice — Pakistani",
  ],
  desserts: ["Mango Mango", "Treats and Beans (on campus)", "Shibam Yemeni Coffee (by ICP)"],
};

const ramadanTips = [
  "Look up the expected start date early and map out when your midterms and major deadlines fall.",
  "If something lands in the last 10 nights or Eid, email your professor ahead of time.",
  "Stock your dorm with easy suhoor foods: dates, oats, eggs, peanut butter, yogurt.",
  "MSA typically organizes community Iftars throughout the month — show up for at least a few.",
  "Be honest with yourself about energy levels. Don't overschedule and don't skip sleep.",
  "Hydrate aggressively between Iftar and Suhoor.",
  "When registering for classes in a Ramadan semester, try to avoid scheduling near Iftar time.",
];

const networking = [
  "\"Networking\" just means connecting with individuals. Genuine curiosity is an easy way to win people over.",
  "Go to office hours! Professors usually want to get to know you.",
  "Always have an updated resume at hand — trying to edit while applying leads to procrastination.",
  "Take printed resume copies to career fairs.",
  "Make an intention for professors to remember your name. Sit in the front of your classes.",
  "Apply as early as August and September for internships and research.",
  "Don't pick and choose for internships — apply for any and everything.",
];

const socialLife = [
  "Try to make friends in each section of your life — dorms, classes, clubs. You can find your people in any of these.",
  "Individual friends outside of a group are extremely valuable, especially in the first semester.",
  "Asking someone about a homework question or to study together is a great way to transition from a class friend to a real friend.",
  "Keep your muslim brothers and sisters close. Surround yourself with good company.",
];

const commuters = {
  parking: [
    "Panther Hollow Parking Lot — $6 (fills up 9–12, need to reserve via Pitt Park app)",
    "Soldiers and Sailors — $8–12", "Posvar Garage — $9",
    "Schenley Park — Free but ~20+ minute walk",
  ],
  microwaves: ["Commuter lounge", "6th floor WPU", "9th floor WPU", "Honors Floor Cathy", "Benedum 403"],
};

const sports = [
  "Men's Soccer @ Cost Center or Dome, 8–9 PM to 10–11 PM on Fridays",
  "Men's Pickup Basketball @ Pitt Rec Center, 6–8 PM on Fridays",
  "Download the IM Leagues app and create a team — soccer, flag football, basketball, esports, volleyball, cricket, pickleball, and more.",
  "Only a once-a-week commitment. Ask around if you don't have a team — people are always willing to play.",
];

/* ── Section component ── */
const Section = ({ icon: Icon, title, children, delay = 0 }: {
  icon: typeof MapPin; title: string; children: React.ReactNode; delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.45, delay }}
    className="liquid-glass-hover p-6 md:p-8 rounded-2xl"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="gold-gradient w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon className="text-primary-foreground" size={18} />
      </div>
      <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="space-y-2.5">
    {items.map((item, i) => (
      <li key={i} className="text-muted-foreground text-sm leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary/50">
        {item}
      </li>
    ))}
  </ul>
);

/* ── Page ── */
const NewToPitt = () => (
  <Layout>
    {/* Hero */}
    <section className="relative py-28 md:py-36 text-center px-4 overflow-hidden">
      <div className="absolute inset-0 gradient-mesh-gold" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
          
          <BridgeBar />
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-5">
          Resources
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4">
          New to <span className="text-gradient-gold inline-block pb-1">Pitt?</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
          Tips from MSA students who were sitting exactly where you are not too long ago. Take what's useful and don't hesitate to reach out.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-6">
          <Link to="/resources" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Back to Resources
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Content */}
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 steps-surface" />
      <div className="absolute inset-0 texture-dots opacity-50" />
      
      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        <Section icon={BookOpen} title="General Day-to-Day Tips">
          <Bullets items={dayToDay} />
        </Section>

        <Section icon={MapPin} title="Roommates & Dorms" delay={0.05}>
          <Bullets items={dorms} />
        </Section>

        <Section icon={Utensils} title="Halal Food" delay={0.1}>
          <h4 className="text-foreground font-semibold text-sm mb-2">On Campus</h4>
          <ul className="space-y-2 mb-4">
            {halalFood.onCampus.map((item, i) => (
              <li key={i} className="text-muted-foreground text-sm leading-relaxed">
                <span className="font-semibold text-foreground">{item.name}:</span> {item.note}
              </li>
            ))}
          </ul>
          <h4 className="text-foreground font-semibold text-sm mb-2">Nearby (Under 1 Mile)</h4>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">{halalFood.nearby.join(" · ")}</p>
          <h4 className="text-foreground font-semibold text-sm mb-2">Farther Out (1–10 Miles)</h4>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">{halalFood.farther.join(" · ")}</p>
          <h4 className="text-foreground font-semibold text-sm mb-2">Desserts</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">{halalFood.desserts.join(" · ")}</p>
        </Section>

        <Section icon={Mic2} title="Ramadan Tips" delay={0.15}>
          <Bullets items={ramadanTips} />
        </Section>

        <Section icon={Briefcase} title="Networking & Professional Growth" delay={0.2}>
          <Bullets items={networking} />
        </Section>

        <Section icon={Users} title="Social Life & Community" delay={0.25}>
          <Bullets items={socialLife} />
          <div className="liquid-glass p-4 mt-4 border-l-2 border-primary/30">
            <p className="text-sm text-foreground italic leading-relaxed">
              "A man is upon the religion of his best friend, so let one of you look at whom he befriends."
            </p>
            <p className="text-xs text-muted-foreground mt-1">— Prophet Muhammad ﷺ (Sunan al-Tirmidhi 2378)</p>
          </div>
        </Section>

        <Section icon={Bus} title="Commuters" delay={0.3}>
          <h4 className="text-foreground font-semibold text-sm mb-2">Parking</h4>
          <Bullets items={commuters.parking} />
          <h4 className="text-foreground font-semibold text-sm mt-4 mb-2">Microwaves on Campus</h4>
          <p className="text-muted-foreground text-sm">{commuters.microwaves.join(" · ")}</p>
        </Section>

        <Section icon={Trophy} title="Sports & Recreation" delay={0.35}>
          <Bullets items={sports} />
        </Section>
      </div>
    </section>

    <SectionDivider />

    {/* Closing */}
    <section className="section-padding-sm gradient-section-emerald-soft">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card-strong glass-glow p-8 md:p-12">
          <ArabicVerse
            arabic="رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي"
            translation="My Lord, expand my breast and ease my task for me."
            reference="Quran 20:25–26"
          />
        </div>
      </div>
    </section>
  </Layout>
);

export default NewToPitt;
