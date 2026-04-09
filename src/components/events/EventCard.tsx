import type { MSAEvent } from "@/data/events";
import EventCardBase from "./EventCardBase";

interface Props {
  event: MSAEvent;
  index?: number;
}

const EventCard = ({ event, index = 0 }: Props) => (
  <EventCardBase event={event} variant="standard" index={index} />
);

export default EventCard;
