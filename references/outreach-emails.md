# Outreach emails

The Latvian wave (October 2026) used one skeleton for 44 organisations, with one bespoke sentence per organisation and an ask that changes with the organisation type. Consistency is deliberate: the user reviews 40 texts in minutes, and the bespoke sentence is the only place where effort goes.

## Skeleton (six paragraphs plus signature)

1. **Greeting.** `Dear <First name>,` when the site shows a named person (several names: `Dear Jānis, Juris and Roberts,`). Otherwise `Hello <Organisation> team,` (or the unit: `Hello Training Solutions team,`). Named recipients replied; general boxes auto-replied or stayed silent.
2. **Intro.** From the offer file: who the user is, where the user is based (the base line changes with the country), the 1,000+ people in four countries, the three partner credentials. Same sentence everywhere.
3. **Partner sentence (bespoke).** "I would like to partner with <Org> on AI training in English, in whichever form works best for you: <the forms that fit this organisation>." Built from the verifier's pitch angle. This is the sentence you write by hand for each organisation.
4. **Attachment sentence.** "The attachment has six course cards. Two may fit <their programmes / your catalogue / your members / your calendar>: <course one-liner>, and <course one-liner>." Pick two or three courses that fit; the one-liners come from the offer file so the course descriptions never drift.
5. **Why now.** Default: "Why now: entrepreneurs that I talk with in <Country> keep asking for AI training in English for their international teams, and I would rather deliver it with an established partner than alone." Associations, chambers, employer bodies and communities: "... and your members are exactly those teams." The user changed "companies I work with" to "entrepreneurs that I talk with" on the sent version; keep the user's wording.
6. **Ask.** Default: "Could we find 20 minutes for a call? I am happy to discuss formats and terms then." (no "next week": the user removed it). Associations and chambers: "Could we find 20 minutes for a call to see whether a session fits your event calendar?"
7. **Signature.** Best regards, YOUR NAME, YOUR ROLE, YOUR COMPANY, <your address>, +00 000 000 0000, <city>. No website link (the composer would rewrite it).

Subject: `Partnering on AI training in English`. Associations, chambers, employer bodies: `AI training in English for your members: a guest session and a question`. Adapt "in English" to the country's angle (Italy: `Collaborazione sulla formazione AI per le aziende`).

## Partner sentence by organisation type (the Latvian wordings, to adapt)

| Type | Shape of the partner sentence | Example |
|---|---|---|
| Training company, adult education provider | catalogue or lecturer pool, plus English groups of their existing AI courses | "...in whichever form works best for you: offering the attached courses through your catalogue, or joining your pool of lecturers for the AI, automation and productivity courses you already run, including English delivery of your Microsoft 365 Copilot courses when a group needs it." |
| Business school, university unit, school | guest lecturer in executive and corporate programmes, or an English AI course in the catalogue | "...as a guest lecturer in your executive and corporate programmes, for example a hands-on tools session alongside your AI programmes, or with an English AI course in your catalogue." |
| Association, chamber, employer body | a guest session for members (45 to 60 minutes, practical, in English or with local handouts) plus one question: next training procurement and which AI topics members ask for | "I would like to offer <Org> members a guest session on AI at work in manufacturing companies: in English or with Latvian handouts, 45 to 60 minutes, practical, built around what production and sales teams do every day... If it is useful, I would also like to be notified of your next training procurement and to understand which AI topics your members ask for most." |
| EDIH, cluster, development agency | joining their pool of trainers or experts for the programmes they run for companies, or an English-language group | "...joining your pool of trainers or experts for the programmes you run for companies, or adding an English-language group for teams that do not work in Latvian." |
| Peer AI training firm | partner rather than competitor: an English bench for their international clients, under their brand or co-branded, plus the tracks they lack (Gemini, Copilot) | "I would like to explore working with <Org> as a partner rather than a competitor: English-language delivery for your international clients and a Google Workspace with Gemini track, under your brand or co-branded, plus the attached courses where they complement yours." |
| Seminar or conference organiser | an English AI course for their calendar, a session in an existing track, a keynote option | "...an English-language AI course for your calendar, an AI for managers session in your efficiency track, and a keynote option for your next Strategy Forum." |
| E-learning producer | subject-matter partner for AI-literacy, Copilot and Gemini modules, from course design to recorded sessions | "...from course design and scripts to recorded sessions, so your e-learning carries real hands-on practice rather than theory." |
| Community, NGO | live workshops for the company teams in their programmes, guest sessions | "...live AI workshops in English for the company teams in your programmes, and guest sessions wherever they help, built on the same tools your programmes already teach." |
| Sales, leadership, HR, marketing firm | an AI module next to what they already sell (AI for Sales next to sales training, Implementing an AI culture next to leadership work) | "...an AI module next to your leadership and organisational development work, the attached courses through your catalogue, or joining your pool of trainers for international groups." |

## Country adaptation

- **Language**: the playbook decides (Baltics, UK, USA: English; Italy: Italian; Brazil: Portuguese). Translate the skeleton once per country and keep it in the offer file under `locales` so every email in that country shares it.
- **Angle**: "AI training in English for international teams" is a Baltic hook. In Italy and Brazil the hook is a hands-on practitioner with partner credentials who can fill their catalogue's AI gap; in the UK and USA it is the Google and Microsoft depth plus the AI Business Brain method. Set `why_now` in the offer file per country.
- - **Base line**: say where you are based in a way that is true for the trip; it changes per country in the offer file.

## Rules and why

- No scheme or fund names in the email: targeting knowledge, not pitch. It dates the email and narrows the talk.
- No prices anywhere: terms belong to the call.
- No links in the body: the composer rewrites them and the email looks like spam.
- No em dashes: house rule for everything outbound.
- One named person in `to`, the general box in `cc`, never two organisations in one email.
- Holds (relationship-owner conflicts) are drafted like the others and left in Drafts without attachment until the user clears them.
- The user approves the exact list before anything is sent, and the user may edit a sent text: read the sent copy afterwards and carry the user's wording into the template (that is how "entrepreneurs that I talk with" and the dropped "next week" got into the template).

## Build

Write `picks.json` with, per approved organisation: `greeting`, `partner_sentence`, `courses` (keys from the offer file), optional `fit_phrase` ("fit your programmes" is the default; "matter most to your members", "fit your calendar", "translate well into e-learning modules"), `to`, `cc`, `type_class` (default, association). Then:

```bash
python3 scripts/partner_tools.py emails ranked.json --picks picks.json --offer assets/offer.json --country "Latvia" --locale en > emails.md
```

It also writes `drafts.json` next to `emails.md` (to, cc, subject, body per organisation) for the Gmail MCP step.
