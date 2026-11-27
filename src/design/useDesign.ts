import { useContext } from "react";
import { Content } from "@/editor/content";
import { visualKey } from "@/editor/visual-model";
import type { designChoices } from "../../shared/design-options.js";

export type DesignOptions = Partial<Record<keyof typeof designChoices, string>>;
export type DesignField = { kind: "design"; options: DesignOptions };
const defaults: DesignOptions = {};
export function useDesign() {
  const value = useContext(Content).fields[visualKey.design];
  return value?.kind === "design" ? value.options : defaults;
}
