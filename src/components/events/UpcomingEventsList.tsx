import EventCard from "./EventCard";
import EmptyState from "./EmptyState";
import type { MSAEvent } from "@/data/events";

interface Props {
  events: MSAEvent[];
}

const UpcomingEventsList = ({ events }: Props) => {
  if (events.length === 0) return <EmptyState />;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {events.map((event, i) => (
        <EventCard key={event.id} event={event} index={i} />
      ))}
    </div>
  );
};

export default UpcomingEventsList;
