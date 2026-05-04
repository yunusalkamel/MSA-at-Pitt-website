import type { MSAEvent } from "@/data/events";
import EventCardBase from "./EventCardBase";

interface Props {
  event: MSAEvent;
  showSignatureBadge?: boolean;
}

const FeaturedEventCard = ({ event, showSignatureBadge = false }: Props) => (
  <EventCardBase event={event} variant="featured" showSignatureBadge={showSignatureBadge} />
);

export default FeaturedEventCard;
