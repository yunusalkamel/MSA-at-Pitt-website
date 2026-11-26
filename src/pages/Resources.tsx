import { useChaplainDetails } from "@/hooks/useChaplainDetails";
import { PageHero } from "@/components/PageHero";
import { LinkField } from "@/editor/content";
import { TextField, itemIdentity, ContentScope, CardCopies } from "@/editor/content";
import { useIsMobile } from "@/hooks/use-mobile";
import { communityPhoto } from "@/data/communityPhotos";
import { ResourceTile } from "@/design/ResourceTile";
import { motion } from "framer-motion";
import { BookOpen, Heart, Moon, MessageSquare, Link as LinkIcon, ArrowRight, Mail, Clock, Calendar } from "lucide-react";
import { LINKS } from "@/config/links";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import SectionDivider from "@/components/SectionDivider";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/geometric-tile.svg";

const resources = [
  {
    icon: BookOpen, emoji: "📘", title: "Tips for Freshmen",
    desc: "New to Pitt? MSA students who've been there share what they wish they'd known.",
    backDesc: "Covers everything from class registration tips, best halal food spots, prayer room locations, and how to get the most out of your first semester at Pitt.",
    ctas: [
      { label: "Read the Tips", href: "/resources/new-to-pitt", internal: true },
      { label: "Google Doc", href: "https://docs.google.com/document/d/1sWSKZ-PfdgzmSeO_IcZIlhZtkpinHK4esdQSStORKNQ/edit?usp=sharing", internal: false },
    ],
    gradient: "from-[var(--gold)] to-[var(--gold-muted)]",
  },
  {
    icon: Heart, emoji: "💚", title: "Wellness Resources",
    desc: "Mental health, support services, and wellness tools compiled specifically for MSA at Pitt members.",
    backDesc: "Access counseling services, crisis hotlines, stress management tips, and self-care guides curated by MSA members who understand your unique journey.",
    ctas: [{ label: "View Resources", href: "https://docs.google.com/document/d/1WLQeRHtyrLR3upxWgGZJ_cnE6mGxyU9u-6iROcgSvVY/edit?usp=sharing", internal: false }],
    gradient: "from-[#0A5C46] to-[#148066]",
  },
  {
    icon: Moon, emoji: "🌙", title: "Revert Resources",
    desc: "Just taken your shahada, or exploring Islam? This guide was made with you in mind.",
    backDesc: "Step-by-step guidance for new Muslims — from learning how to pray, to finding a supportive community, to understanding the basics of Islamic practice.",
    ctas: [{ label: "Explore", href: "https://revert-resources.carrd.co/", internal: false }],
    gradient: "from-[#14345A] to-[#11233C]",
  },
  {
    icon: MessageSquare, emoji: "💬", title: "Anonymous Suggestions",
    desc: "Have feedback for the MSA board? Share it anonymously — we genuinely read every response.",
    backDesc: "Your voice matters. Completely anonymous, no login required. A sisters-only form is also available — responses are read by a trusted sister on the board.",
    ctas: [
      { label: "General Form", href: "https://docs.google.com/forms/d/e/1FAIpQLSf4Mxrk2dXPCS5v9pu0HIAjrc0D7fEoXaAinYgqZ-Qfi_2oig/viewform?usp=sharing", internal: false },
      { label: "Sisters Form", href: "#sisters-form-placeholder", internal: false, secondary: true },
    ],
    gradient: "from-[#8A6212] to-[var(--gold-muted)]",
  },
];

const FlipCard = ({ resource, index }: { resource: typeof resources[0]; index: number }) => {
  const mobile = useIsMobile();
  const actions=resource.ctas.filter(cta=>!cta.href.startsWith("#")).map(cta=><ContentScope key={cta.label} id={(cta.internal?(mobile?"Resources_4-":"Resources_14-"):(mobile?"Resources_6-":"Resources_16-"))+itemIdentity(cta,cta.label)}>
          {cta.internal?<Link to={cta.href}><TextField id={mobile?"Resources_5":"Resources_15"}>{cta.label}</TextField> →</Link>:<LinkField fieldId={mobile?"Resources_destination_1":"Resources_destination_2"} href={cta.href} target="_blank" rel="noopener noreferrer"><TextField id={mobile?"Resources_7":"Resources_17"}>{cta.label}</TextField> ↗</LinkField>}
        </ContentScope>);
    return <ResourceTile label={resource.title}
      title={<TextField id={mobile?"Resources_1":"Resources_8"}>{resource.title}</TextField>}
      summary={<TextField id={mobile ? "Resources_2" : "Resources_9"}>{resource.desc}</TextField>}
      detailTitle={<><span aria-hidden="true"><TextField id="Resources_11">{resource.emoji}</TextField></span> <TextField id="Resources_12">{resource.title}</TextField></>}
      hint={<TextField id="Resources_10">Hover to learn more →</TextField>}
      body={<TextField id={mobile?"Resources_3":"Resources_13"}>{resource.backDesc}</TextField>}
      photo={communityPhoto((["students", "lakeshore", "river-talk", "craft-detail"] as const)[index % 4]).src} tone={["pine","clay","plum","slate"][index%4]}
      primary={actions[0]} extra={actions.slice(1)}/>;
};

function resourceCard(resource: typeof resources[number], index: number) {
  return (
    <CardCopies key={resource.title} id={"Resources_22-" + itemIdentity(resource, resource.title)}>
      <FlipCard resource={resource} index={index} />
    </CardCopies>
  );
}

const Resources = () => {
  const { email, officeHours } = useChaplainDetails();
  const mobile=useIsMobile();
  return (
    <Layout>
      {/* Hero */}
      <PageHero className="relative text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
          <div className="absolute inset-0 gradient-mesh-gold" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          <div className="absolute top-1/3 left-1/5 w-64 h-64 rounded-full bg-primary/8 blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-secondary/8 blur-[80px]" />
        </div>

        <div className="relative z-10">
          <motion.div initial={false} className="page-hero-kicker">
            <span className="text-base">🤲</span>
          </motion.div>
          <motion.h1 initial={false} className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4"><TextField id="Resources_18">
            We've got </TextField><span className="text-gradient-gold inline-block pb-1"><TextField id="Resources_19">you.</TextField></span>
          </motion.h1>
          <motion.p initial={false} className="font-satoshi text-base md:text-xl text-muted-foreground max-w-2xl mx-auto"><TextField id="Resources_20">
            From navigating college to navigating your faith — here are resources to support you.
          </TextField></motion.p>
        </div>
      </PageHero>

      {/* Resource Cards */}
      <section className="section-padding resource-section relative overflow-hidden">
        <div className="absolute inset-0 steps-surface pointer-events-none" />
        <div className="absolute inset-0 texture-cross opacity-25 pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-primary/[0.06] blur-[110px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-secondary/[0.05] blur-[90px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="max-md:sr-only"><ContentScope id="Resources_21"><SectionHeading title="Your Resources" label="Everything You Need" /></ContentScope></div>
          <div className="resource-grid grid sm:grid-cols-2 lg:grid-cols-3">
            {resourceCard(resources[0], 0)}

            {/* Prayer card — combined prayer page */}
            <CardCopies id="resource-prayer"><ResourceTile label="Prayer" title={<TextField id={mobile?"Resources_23":"Resources_26"}>Prayer</TextField>} body={<TextField id={mobile?"Resources_24":"Resources_27"}>Daily times, Jummah and places to pray on campus.</TextField>} photo="/photos/prayer/jummah-ballroom.webp" tone="pine" primary={<Link to="/resources/prayer"><TextField id={mobile?"Resources_25":"Resources_28"}>Open prayer guide</TextField> →</Link>} /></CardCopies>

            {/* Chaplain card */}
            <CardCopies id="resource-chaplain"><ResourceTile label="University Chaplain" title={<TextField id={mobile?"Resources_29":"Resources_33"}>University Chaplain</TextField>} body={<TextField id={mobile?"Resources_30":"Resources_34"}>Office hours, spiritual guidance and a space to talk.</TextField>} summary={<TextField id="Resources_35">{officeHours}</TextField>} photo="/photos/prayer/imam-muhammad-patel.webp" tone="slate" primary={<Link to="/resources/chaplain"><TextField id={mobile?"Resources_31":"Resources_36"}>Meet the chaplain</TextField> →</Link>} extra={<LinkField fieldId="Resources_destination_3" href={"mailto:" + email}><TextField id="Resources_32">Email the chaplain</TextField> ↗</LinkField>}/></CardCopies>

            {/* FAQ card */}
            <CardCopies id="resource-faq"><ResourceTile label="FAQ" title={<TextField id={mobile?"Resources_37":"Resources_40"}>FAQ</TextField>} body={<TextField id={mobile?"Resources_38":"Resources_41"}>Answers about membership, events, prayer and campus life.</TextField>} photo={communityPhoto("hall-friends").src} tone="clay" primary={<Link to="/resources/faq"><TextField id={mobile?"Resources_39":"Resources_42"}>Read FAQ</TextField> →</Link>} /></CardCopies>
            {resources.slice(1).map((resource, i) => resourceCard(resource, i + 1))}
          </div>

          {/* Bottom action row — calendar subscriptions + linktree */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 liquid-glass-hover p-6 md:p-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div>
              <p className="font-display text-lg font-bold text-foreground mb-1"><TextField id="Resources_43">Stay Connected</TextField></p>
              <p className="font-dm-sans text-muted-foreground text-sm"><TextField id="Resources_44">Subscribe to the events calendar or browse everything on our Linktree.</TextField></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
              <LinkField fieldId="Resources_destination_4" href={LINKS.googleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="btn-premium text-sm px-4 py-2.5 whitespace-nowrap">
                <Calendar size={14} /><TextField id="Resources_45"> Google Calendar
              </TextField></LinkField>
              <LinkField fieldId="Resources_destination_5" href={LINKS.appleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="btn-premium-secondary text-sm px-4 py-2.5 whitespace-nowrap">
                <Calendar size={14} /><TextField id="Resources_46"> Apple Calendar
              </TextField></LinkField>
              <LinkField fieldId="Resources_destination_6" href={LINKS.linktree} target="_blank" rel="noopener noreferrer" className="btn-premium-secondary text-sm px-4 py-2.5 whitespace-nowrap">
                <LinkIcon size={14} /><TextField id="Resources_47"> Linktree
              </TextField></LinkField>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* Ayat */}
      <section className="section-padding-sm gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="glass-card-strong glass-glow p-8">
            <ContentScope id="Resources_48"><ArabicVerse
              arabic="رَبِّ زِدْنِي عِلْمًا"
              translation="My Lord, increase me in knowledge."
              reference="Quran 20:114"
            /></ContentScope>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
