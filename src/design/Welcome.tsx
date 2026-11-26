import { Link } from "react-router-dom";
import { LinkField, TextField } from "@/editor/content";
import { LINKS } from "@/config/links";
import { resolveEventAction } from "@/components/events/resolveEventAction";
import type { MSAEvent } from "@/data/events";
export function WelcomePath() {
  return (
    <section className="welcome-path">
      <h2>
        <TextField id="WelcomeHeading">New to MSA?</TextField>
      </h2>
      <div>
        <article>
          <h3>Your first visit</h3>
          <p>
            Find a gathering that fits your week. The student guide covers
            prayer rooms, food and getting around Pitt.
          </p>
          <Link to="/events">Find an event →</Link>
          <Link to="/resources/new-to-pitt">Read the student guide ↗</Link>
        </article>
        <article>
          <h3>Stay in the loop</h3>
          <p>Get the next event announcement or register as a member.</p>
          <LinkField
            fieldId="WelcomeWhatsApp"
            href={LINKS.whatsappAnnouncements}
          >
            Join announcements ↗
          </LinkField>
          <Link to="/join">Become a member →</Link>
        </article>
        <article>
          <h3>Lend a hand</h3>
          <p>
            Ask the board where an extra pair of hands would help at the next
            gathering.
          </p>
          <Link to="/contact">Contact the board →</Link>
        </article>
      </div>
    </section>
  );
}
export function NextEvent({ event }: { event?: MSAEvent }) {
  if (!event) return null;
  const action = resolveEventAction(event);
  return (
    <section className="upcoming-invite">
      <div>
        <small>Next gathering</small>
        <h2>{event.title}</h2>
        <p>
          {[
            new Date(event.startDate + "T12:00:00").toLocaleDateString(
              "en-US",
              { month: "long", day: "numeric" },
            ),
            event.timeLabel,
            event.location,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {action.kind === "signup" && action.href ? (
        <LinkField
          fieldId={"next-rsvp-" + event.id}
          data-event-key={event.id}
          data-analytics-action="rsvp_click"
          href={action.href}
        >
          RSVP ↗
        </LinkField>
      ) : (
        <Link to="/events">Event details →</Link>
      )}
    </section>
  );
}
