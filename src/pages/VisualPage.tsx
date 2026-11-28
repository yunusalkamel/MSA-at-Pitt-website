import { SITE_NAME } from "../../shared/brand.js";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Content, TextField, ContentScope } from "@/editor/content";
import { getVisualPage, isScheduled } from "@/editor/visual-model";
import { usePageMeta } from "@/lib/usePageMeta";
import { PageHero } from "@/components/PageHero";
import Layout from "@/components/Layout";
import NotFound from "./NotFound";

export default function VisualPage() {
  const { fields } = useContext(Content);
  const { pathname } = useLocation();
  const page = getVisualPage(fields, pathname);
  const admin = /^\/admin(?:\/|$)/.test(window.location.pathname);
  const visible = page?.path && (admin || (page.visibility === "published" && isScheduled(page)));
  usePageMeta({ title: visible ? `${page.title} | ${SITE_NAME}` : `Page not found | ${SITE_NAME}` });
  if (!visible) return <NotFound />;
  return <Layout names={["Page introduction"]}>
    <PageHero className={page.template === "campaign" ? "gradient-section-gold-soft text-center" : page.template === "landing" ? "gradient-section-emerald-soft text-center" : ""}>
      <ContentScope id="visual-page-hero">
        <h1 className="font-display font-bold"><TextField id="title">{page.title}</TextField></h1>
        {page.subtitle && <p className="text-lg mt-3"><TextField id="subtitle">{page.subtitle}</TextField></p>}
      </ContentScope>
    </PageHero>
  </Layout>;
}
