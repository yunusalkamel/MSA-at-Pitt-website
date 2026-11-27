import type { SiteMenus } from "@/editor/visual-model";
const make = (rows: readonly (readonly [string, string])[]) => rows.map(([url, title]) => ({
  id: url === "/" ? "home" : url.slice(1).replace(/\//g, "-"), url, title,
}));
export const mainMenu = make([["/","Home"],["/about","About"],["/events","Events"],["/resources/prayer","Prayer"]]);
export const resourceMenu = make([["/resources","All Resources"],["/resources/new-to-pitt","New to Pitt"],["/gallery","Gallery"],["/resources/chaplain","Chaplain"],["/resources/faq","FAQ"]]);
export const footerInvolved = make([["/events","Attend an event"],["/join","Join the MSA"],["/gallery","See our community"],["/about","Meet the board"]]);
export const footerCampus = make([["/resources/new-to-pitt","Student guide"],["/resources/prayer","Prayer on campus"],["/resources/chaplain","Meet the chaplain"],["/resources","All resources"]]);
export const defaultMenus: SiteMenus = {
  kind: "menus", main: mainMenu, resources: resourceMenu,
  footer: [
    ...footerInvolved.map(entry => ({...entry, group:"involved" as const})),
    ...footerCampus.map(entry => ({...entry, group:"campus" as const})),
  ],
};
