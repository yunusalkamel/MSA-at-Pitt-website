import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Building2, Landmark } from "lucide-react";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import SectionDivider from "@/components/SectionDivider";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";

const onCampus = [
  {
    name: "WPU Reflection Room",
    detail: "3rd floor of the William Pitt Union",
    features: [
      "Prayer mats and prayer attire (thobes, abayas, hijabs) provided.",
      "Ablution stations in both the men's and women's restrooms on the same floor.",
      "2 private bathrooms + showers on this floor.",
      "This is the main spot for daily prayers.",
    ],
  },
  {
    name: "Rec Center Reflection Room",
    detail: "8th floor, past the bathrooms and behind the double doors",
    features: [
      "Sometimes locked — you may need to ask staff to unlock it.",
      "Private bathrooms with wudu stations adjacent.",
    ],
  },
  {
    name: "Benedum Room 403",
    detail: "Engineering building",
    features: [
      "Equipped with a sink that can be used for wudu.",
      "Can lock from the inside for privacy.",
    ],
  },
  {
    name: "School of Public Health — Room A721",
    detail: "Floor 7, all the way down the hallway from the elevators and to the left",
    features: ["Has a seat and prayer mat."],
  },
];

const masajid = [
  {
    name: "Islamic Center of Pittsburgh (ICP)",
    distance: "~10 minute walk from campus",
    details: [
      "Two Jumu'ah services every Friday (~30 min each):",
      "Arabic Khutba at 12:15 PM",
      "English Jumu'ah at 1:15 PM",
      "MSA supplements these with on-campus Jummah at 2 PM — typically at O'Hara. Check Instagram and WhatsApp for updates.",
    ],
  },
  {
    name: "Attawheed Islamic Center (AIC)",
    distance: "About 5 miles west",
    details: [
      "Two Jumu'ah services: 12:00 PM and 1:10 PM",
      "Founded by Pitt and CMU grad students in 1995.",
      "Several halal restaurants nearby including Afghan Kabab House, Raya's Pizza, Saba, and Rahma Market.",
    ],
  },
];

const PrayerLocations = () => (
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
          Prayer <span className="text-gradient-gold inline-block pb-1">Locations</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
          On-campus prayer spaces and nearby masajid for the Pitt community.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/resources" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Back to Resources
          </Link>
          <span className="hidden sm:block text-border">·</span>
          <Link to="/resources/prayer" className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
            🕌 Prayer Hub <ArrowRight size={13} />
          </Link>
        </motion.div>
      </div>
    </section>

    {/* On-campus */}
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 steps-surface" />
      <div className="absolute inset-0 texture-dots opacity-50" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="gold-gradient w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
            <Building2 className="text-primary-foreground" size={18} />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">On-Campus Spaces</h2>
        </div>

        <div className="space-y-5">
          {onCampus.map((space, i) => (
            <motion.div
              key={space.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="liquid-glass-hover p-6 md:p-7 rounded-2xl"
            >
              <div className="flex items-start gap-3 mb-3">
                <MapPin size={16} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{space.name}</h3>
                  <p className="text-muted-foreground text-sm">{space.detail}</p>
                </div>
              </div>
              <ul className="space-y-1.5 pl-7">
                {space.features.map((f, j) => (
                  <li key={j} className="text-muted-foreground text-sm leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-primary/50">
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <SectionDivider />

    {/* Masajid */}
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 warm-surface" />
      <div className="absolute inset-0 texture-cross opacity-40" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-secondary w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
            <Landmark className="text-secondary-foreground" size={18} />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Nearby Masajid</h2>
        </div>

        <div className="space-y-5">
          {masajid.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="liquid-glass-hover p-6 md:p-7 rounded-2xl"
            >
              <h3 className="font-display text-lg font-bold text-foreground mb-1">{m.name}</h3>
              <p className="text-sm text-primary font-semibold mb-3">{m.distance}</p>
              <ul className="space-y-1.5">
                {m.details.map((d, j) => (
                  <li key={j} className="text-muted-foreground text-sm leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary/50">
                    {d}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <SectionDivider />

    {/* Closing */}
    <section className="section-padding-sm gradient-section-emerald-soft">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card-strong glass-glow p-8 md:p-12">
          <ArabicVerse
            arabic="أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ"
            translation="Establish prayer from the decline of the sun to the darkness of the night."
            reference="Quran 17:78"
          />
        </div>
      </div>
    </section>
  </Layout>
);

export default PrayerLocations;
