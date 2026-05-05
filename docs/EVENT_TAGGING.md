# MSA Event Tagging Guide

This guide is for **MSA marketers and board members** who manage the Google Calendar.

The website automatically reads your Google Calendar events and displays them with proper labels, audience badges, and action buttons. The smarter your event description, the better the result.

---

## How Tagging Works

The website classifies each event in this order:

1. **Hashtags** — if you add hashtags to your description, those are used directly (most accurate)
2. **Keyword rules** — if no hashtags, the system scans the title and description for known keywords
3. **AI fallback** — if the event is still unclear, Gemini AI tries to classify it automatically

> **Tip:** Use hashtags whenever possible. It takes 5 seconds and guarantees the right result.

---

## Recommended Description Format

```
Short event description here.

RSVP: https://example.com

#audience-tag #category-tag #category-tag
```

The **RSVP line** (if present) becomes the button on the event card. Without an RSVP link, clicking the event takes the user to the MSA Linktree (or directly to the Google Calendar event for Jummah and GBMs).

---

## Audience Hashtags

Use **one** audience hashtag per event:

| Hashtag | Meaning |
|---------|---------|
| `#brothers` | Men only |
| `#sisters` | Women only |
| `#joint` | Both brothers and sisters (most events) |

If you don't add an audience hashtag, no audience badge is shown (event appears as open/general).

---

## Category Hashtags

Use **one or more** category hashtags per event:

| Hashtag | Category |
|---------|---------|
| `#jumuah` or `#jummah` | Friday congregational prayer |
| `#halaqa` | Islamic study circle, Quran, hadith |
| `#dawah` | Outreach, tabling, community education |
| `#sports` | Basketball, soccer, any sport |
| `#social` | Game nights, dinners, hangouts |
| `#ramadan` | Iftar, taraweeh, suhoor events |
| `#career` | Resume workshops, networking, job fairs |
| `#service` | Volunteering, community service, charity |
| `#fundraiser` | Donation drives, fundraising events |
| `#meeting` | Public GBMs, open forums, info sessions |
| `#signature` or `#featured` | Major annual/high-profile events |

---

## RSVP URL Formats

Any of these work:

```
RSVP: https://forms.gle/example
Register: https://forms.gle/example
Sign up: https://linktr.ee/msa.at.pitt
Signup: https://forms.gle/example
Link: https://forms.gle/example
```

---

## Complete Examples

### Weekly Jummah Prayer
```
Weekly congregational prayer open to all.

#joint #jumuah
```
→ Tags: Jummah · Joint | Clicking the event opens the Google Calendar

---

### Brothers Basketball Night
```
Brothers basketball night at the Pete. All skill levels welcome!

#brothers #sports #social
```
→ Tags: Sports · Social · Brothers | Clicking opens Linktree

---

### Sisters Halaqa
```
Sisters halaqa and discussion circle. We'll be going through the seerah this semester.

#sisters #halaqa
```
→ Tags: Halaqa · Sisters | Clicking opens Linktree

---

### Signature Event with RSVP
```
Join us for our annual Fast-a-Thon dinner! Open to all students.

RSVP: https://forms.gle/abc123

#joint #signature #social
```
→ Tags: Signature · Social · Joint | Event card shows **RSVP** button → `forms.gle/abc123`

---

### Dawah Tabling
```
Come help us table on the Cathedral patio! We'll have pamphlets and free snacks.

RSVP: https://forms.gle/signup

#joint #dawah #social
```
→ Tags: Dawah · Social · Joint | RSVP button on card

---

### General Body Meeting (GBM)
```
Monthly General Body Meeting. All students welcome — come hear updates and give feedback!

#joint #meeting
```
→ Tags: Joint | Clicking opens the Google Calendar event

---

### Ramadan Iftar Dinner
```
Come break your fast with us! Potluck-style, bring a dish if you can.

RSVP: https://forms.gle/iftar

#joint #ramadan #social #signature
```
→ Tags: Ramadan · Social · Signature · Joint | RSVP button on card

---

## Click Button Logic

| Situation | What Clicking Does |
|-----------|-------------------|
| Has RSVP link | Opens the RSVP/signup link |
| Jummah or public meeting (no RSVP) | Opens the Google Calendar event |
| All other events (no RSVP) | Opens the MSA Linktree |

---

## Setup for Developers

### 1. Run the database migration

In the Supabase dashboard → SQL Editor, run:

```
supabase/migrations/20260505000000_calendar_event_ai_tags.sql
```

Or via CLI: `supabase db push`

### 2. Set the Gemini API key (optional)

The calendar works without this. Add it for AI fallback on vague events.

In Supabase dashboard → Edge Functions → Secrets:
- Key: `GEMINI_API_KEY`
- Value: your Gemini API key from Google AI Studio

Optionally set `GEMINI_MODEL` (defaults to `gemini-2.5-flash-lite`).

### 3. Deploy the edge function

```bash
supabase functions deploy google-calendar-events
```

### 4. Test the tagging system

**Test hashtags:** Add `#brothers #sports` to a calendar event description. The card should show "Brothers" and "Sports" tags.

**Test rules:** Add a description like "Sisters Quran study circle" (no hashtags). Should classify as sisters + halaqa automatically.

**Test AI fallback:** Add a vague description like "Community Night" (no hashtags, no clear keywords). If `GEMINI_API_KEY` is set, AI will classify it. Either way, the calendar loads.

**Test RSVP:** Add `RSVP: https://forms.gle/test` to a description. The event card should show a gold "RSVP" button.

**Test missing API key:** Remove `GEMINI_API_KEY` from secrets. The calendar must still load all events correctly — vague ones just show as "uncategorized."
