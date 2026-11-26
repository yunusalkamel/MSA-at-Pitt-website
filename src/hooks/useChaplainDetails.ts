import { LINKS } from "@/config/links";
import { usePlainTextField } from "@/editor/content";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES } from "@/lib/sanity";

export function useChaplainDetails() {
  const { data } = useSanityData<{ imamEmail?: string; imamOfficeHours?: string }>(QUERIES.resourcesPage);
  const officeHours = usePlainTextField(
    "Chaplain_14",
    data?.imamOfficeHours?.trim() || LINKS.chaplainOfficeHours,
    ["/resources/chaplain/Chaplain_14"],
  );
  return { email: data?.imamEmail?.trim() || LINKS.chaplainEmail, officeHours };
}
