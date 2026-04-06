import type { MSAEvent } from "@/data/events";
import EventCardBase from "./EventCardBase";

interface Props {
  event: MSAEvent;
  index?: number;
}

const EventCard = ({ event, index = 0 }: Props) => {
  return <EventCardBase event={event} index={index} variant="standard" />;
};

export default EventCard;
