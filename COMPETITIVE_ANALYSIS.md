# Excellent Driving — Competitive / Market Comparison

Saved 2026-08-27 for future reference. Ad-hoc research pass comparing the
Excellent Driving product (per `Claude.md`) against existing driving-school
booking/e-learning platforms. Not a phase deliverable, not part of the
`Claude.md` build order — a reference snapshot in time.

## Market context

No driving school in Suriname was found to be running its own booking
website or app — the market there currently runs on phone/WhatsApp/walk-in.
So the real comparison set is driving-school SaaS platforms a school could
otherwise buy off the shelf, most built for the US/EU market and assuming
card payments and English-only content.

## Closest analogs (booking + e-learning combined, like this app)

| | **Excellent Driving** | **Zutobi Instructor** | **DriveEZ / Total Drive** |
|---|---|---|---|
| Booking flow | 5-step wizard: package → instructor → date → slot → payment | Real-time calendar sync, reminders | Scheduling + student CRM |
| E-learning/quiz | Modules + lessons + pass/fail quiz (≥70%), progress tracking | Full LMS: videos, simulations, parent-teen guide, assessments | Basic progress tracking, no real curriculum |
| Payments | Cash / bank transfer, manually confirmed by admin | Card/online payments, deposits | Card/online payments |
| Notifications | WhatsApp Business API (booking, reminder, payment, cancellation) | SMS/email reminders | SMS/email reminders |
| Languages | EN/NL now, ES/PT planned | English only | English only |
| Pricing model | N/A — owned, not rented | 5-user minimum, ~$40-60/add-on, monthly SaaS fee | Monthly SaaS fee |

## Booking-only tools schools sometimes bolt on instead

SimplyBook.me, Bookeo, Reservio, Goldie, EasyWeek, Picktime, Square
Appointments — generic appointment schedulers with a "driving school" skin.
Good calendars, but no curriculum, no quiz engine, and payments assume card
rails, which don't fit a cash/bank-transfer market like Suriname.

## Where Excellent Driving is ahead

- Only product in this set combining booking + a real quiz/LMS + **cash and
  bank-transfer** payment flows in one product. Zutobi is the only real LMS
  competitor, and it assumes card payments and a 5+ user subscription.
- Native WhatsApp confirmations instead of SMS/email — WhatsApp is the
  dominant channel in Suriname/Caribbean; none of the SaaS options treat it
  as first-class (Square merely lets you paste a booking link into a
  WhatsApp message).
- EN/NL bilingual out of the box, with ES/PT staged — none of the
  competitors localize beyond English.

## Where it's behind

Zutobi's curriculum depth (instructor videos, behind-the-wheel training
content, parent-teen guide) is well beyond the current TEXT/QUIZ/VIDEO-
placeholder lesson model in `Claude.md`. Worth keeping in view for the
`/admin/content` quiz builder in Phase 3, if the goal is to eventually rival
that depth.

## Sources

- https://zutobi.com/us/driver-guides/driving-school-software-alternatives
- https://www.getapp.com/education-childcare-software/driving-school/
- https://www.getapp.com/education-childcare-software/a/zutobi-instructor/
- https://www.capterra.com/p/10014230/Zutobi-Instructor/
- https://bookedin.com/driving-school-scheduling-software/
- https://simplybook.me/en/driving-school-scheduling-software
- https://www.bookeo.com/classes/driving-school-booking-software/
- https://www.guideflow.com/blog/driving-school-software
