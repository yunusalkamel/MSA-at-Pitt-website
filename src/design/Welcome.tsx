import { Link } from "react-router-dom";
import { LinkField, TextField } from "@/editor/content";
import { LINKS } from "@/config/links";
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
          <Link to="/resources/new-to-pitt">Read the student guide →</Link>
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
      </div>
    </section>
  );
}
export function NextEvent({ event }: { event?: MSAEvent }) {
  if (!event) return null;
  const signup = event.rsvpUrl || event.signupUrl;
  return (
    <section className="upcoming-invite md:hidden">
      <div>
        <small>Featured gathering</small>
        <h3>{event.title}</h3>
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
      {signup ? (
        <LinkField
          fieldId={"next-rsvp-" + event.id}
          data-event-key={event.id}
          data-analytics-action="rsvp_click"
          href={signup}
        >
          RSVP {signup.startsWith("/") ? "→" : "↗"}
        </LinkField>
      ) : (
        <Link to={"/events?event=" + encodeURIComponent(event.id)}>Event details →</Link>
      )}
    </section>
  );
}
