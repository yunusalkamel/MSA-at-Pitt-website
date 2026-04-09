import type { MSAEvent } from "@/data/events";
import EventCardBase from "./EventCardBase";

interface Props {
  event: MSAEvent;
}

const FeaturedEventCard = ({ event }: Props) => (
  <EventCardBase event={event} variant="featured" />
);

export default FeaturedEventCard;
