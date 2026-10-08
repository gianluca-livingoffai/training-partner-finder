---
name: training-partner-finder
description: Find, vet and approach training organisations in a country (Italy, Brazil, the Baltics, the UK, the USA or any other) that could resell the user's courses or take them on as a partner lecturer. Runs the five-lens market sweep (follow the public training money to its procured providers, commercial IT trainers, business schools and chambers, AI-specific players, adjacent sales/leadership/HR trainers), a verifier that opens every site and ranks A/B/C with pitch angles and risk flags, then the outreach kit (type-specific partnership emails with the course deck attached, WhatsApp list, Gmail send loop, follow-up tracking). Use it whenever the user asks to find training companies, academies, business schools or associations to partner with in a country, partner lecturer opportunities, "who sells training to companies in X", or to approach such organisations, even if they only say "find partners in Italy". NOT for finding end clients to train directly (that is sales prospecting), and NOT for grant or funding research on its own.
---

# Training partner finder

This is the method behind a Latvian run in October 2026: 50 organisations vetted and ranked in one pass, 44 emailed with the deck, the first reply came in 22 minutes and became a call two days later. It works because of three things: **it follows the public training money to the providers who already have budget, it searches in the local language, and a single verifier opens every site before anything is ranked.** Everything else is packaging.

Files in this skill, read each when its phase says so:
- `references/country-playbooks.md`: per-country funding instruments, existing provider lists, seed organisations, search phrases, outreach culture. Latvia is verified; the other countries are starters to verify with the playbook workflow before the first run there. Start here.
- `references/lenses.md`: the five lenses and how to adapt them to a country.
- `references/verify-and-rank.md`: what the verifier checks, tier criteria, flags, the table format.
- `references/outreach-emails.md`: the partnership email skeleton, the per-type variants, the rules and why they exist.
- `references/send-loop.md`: Gmail drafts through the connector, deck attached and sent through the browser, verification, gotchas.
- `references/workflow-template.js`: the Workflow script for the sweep and the verifier. `references/playbook-workflow.js`: the script that researches a new country's playbook.
- `scripts/partner_tools.py`: turns the ranked JSON into the table, the WhatsApp list and the email bodies.
- `assets/offer.json` (copy `offer.example.json`): the user's intro line, credentials, course one-liners, asks by organisation type, signature, deck path. Everything personal lives here, so the rest of the skill stays generic.

Working folder: `training-partners-<country>-<yyyy-mm>/` (ranked.json, providers.md, emails.md, drafts.json).

## Phase 0: frame the run (2 minutes, in chat)

Confirm, or state your assumptions and go on:
1. **Country and languages.** Outreach language follows the country playbook. The hook changes with the country: in the Baltics it was "training in English for international teams"; in the user's home market it is credentials and hands-on practice, not language.
2. **The offer.** `assets/offer.json`: courses, credentials, deck path. The deck should carry no prices: partners look at the courses first and talk terms on a call.
3. **Exclusions and holds.** Who is already contacted, and who is linked to a relationship the user or a partner owns. Holds get drafted but never sent until cleared.
4. **Scope.** Research only, research plus drafts, or research plus drafts plus send. Sending always waits for an explicit word on the exact list.

Why ask so little: everything above has a sensible default; only holds and the deck path genuinely need the user.

## Phase 1: country playbook

Open `references/country-playbooks.md` and read the country's section. It tells you where the training money sits, which registers already list providers, which seed organisations to start from, the local search phrases and how people there answer cold email.

If the section is a starter, run `references/playbook-workflow.js` with the Workflow tool first (one researcher plus one skeptic who re-opens every funding URL, about ten minutes), pass the starter text as `hints`, and replace the starter with the verified result so the next run starts warm. If speed matters more than depth, skip it: use the starter's seeds and phrases directly in the lens prompts and let the verifier carry the weight. Without the Workflow tool, run the same two prompts as two subagents in sequence.

## Phase 2: sweep with five lenses

Read `references/lenses.md`, then build the five lens prompts for this country from the playbook (seeds plus search phrases). Run them in parallel with the Workflow tool using `references/workflow-template.js` (pass country, languages, who the user is, the offer, exclusions, holds and the five prompts as `args`). Each lens returns 8 to 15 candidates with a source URL the researcher actually opened. Without the Workflow tool, run five subagents in one turn; as a last resort, do the lenses one after another yourself.

The lenses exist because one search angle never finds the whole market: the money lens finds providers with budget, the commercial lens finds catalogues, the schools lens finds executive education and chambers, the AI lens finds competitors who may still want an English or Google-side bench, and the adjacent lens finds sales and leadership firms with no AI module, which are the cleanest pitches and replied fastest in Latvia.

## Phase 3: verify and rank

One verifier agent (or you) takes the whole raw pool: dedupe, open every website or contact page, copy email and phone exactly as published, drop anything that does not sell training to companies in that country, mark already-contacted and partner-linked organisations, rank A/B/C, write a one-line pitch angle per organisation, flag competitor risk and hidden overlaps. Details and the tier definitions are in `references/verify-and-rank.md`. Then load every website with curl yourself for the dead-site check; in Latvia one site was down and one contact URL returned 404.

Save the verifier output as `ranked.json`, then run:

```bash
python3 scripts/partner_tools.py table ranked.json > providers.md
python3 scripts/partner_tools.py whatsapp ranked.json
```

## Phase 4: deliver the list and stop for the pick

Give the user, in chat: the count per tier, the five or six patterns the verifier found (which register was the richest source, who is high competitor risk, which hidden overlaps to check), and the WhatsApp-ready list if they asked for one. File `providers.md` where they keep project notes, with a status line at the top (date, what was sent, what is held).

Then wait. The user picks who to write to, by name or by tier. They also decide the association question (in Latvia the choice was a guest-session offer for associations and chambers instead of trying to sell them courses).

## Phase 5: draft the emails

Read `references/outreach-emails.md`. For each approved organisation write only the bespoke partner sentence and pick two or three courses; the script assembles the rest from the offer file so 40 emails stay consistent:

```bash
python3 scripts/partner_tools.py emails ranked.json --picks picks.json --offer assets/offer.json --country "Latvia" > emails.md
```

Create the Gmail drafts through the Gmail connector (`create_draft`, arrays are fine for to and cc), keep the returned messageIds in `drafts.json`, and show the texts grouped by type. Holds carry the hold reason only in your own log, never in the email.

## Phase 6: send, only on the user's word

They approve a list ("send all except X and Y"). Then follow `references/send-loop.md`: open each draft in the browser, attach the deck, click Send, confirm the sent notice, and verify at the end with one Gmail search of Sent filtered by the attachment name. Expect about 45 seconds per email. Do not use the connector's send for these: attachments only travel through the browser.

## Phase 7: log and follow up

Log the sends with the time, the holds, the auto-replies and the real replies; set a follow-up seven days out for the silent ones; record replies as they come. Report: Sent, Held, Updated, Needs approval, Failed.

## Rules that matter, and why

- **No scheme names in the emails** (no fund or programme names). The funding knowledge is for targeting, not for the pitch; naming a scheme narrows the conversation and dates the email. Say "partner on training, through your catalogue or as one of your lecturers".
- **No prices in the deck or the email.** Partners look at the courses first and talk terms on the call.
- **Deck attached to everyone**, including associations. The attachment is the proof of substance.
- **Associations and chambers get a guest session, not a sales pitch**, plus one question (next procurement, which topics members ask for). They do not buy courses; they open doors.
- **Hold anything linked to a relationship someone else owns.** Ask the relationship owner first; a cold email behind their back costs more than the lead is worth.
- **One named person when the site shows one, the general box in cc.** Named recipients replied; general boxes auto-replied or stayed silent.
- **Nothing is sent without the user's explicit word on the exact list**, every channel. Show the texts, wait for "send".
- **Keep outbound text clean**: no links in the body (the web composer rewrites them), and whatever house style the user has (the original author bans em dashes).
- **Local language for research always**, outreach language as the country dictates. Half the Latvian market only showed up for Latvian queries.

## Pitfalls already paid for

- Gmail draft message IDs change when an attachment is added in the browser; refetch them with `list_drafts` before opening compose URLs.
- The Gmail web composer rewrites URLs into redirect links; keep the signature to email and phone, no links.
- The browser extension can drop mid-batch; check state with a screenshot before repeating an upload, or the email goes out with two attachments.
- Out-of-office and "within 3 working days" auto-replies arrive within minutes; log them as signal that the mailbox is live, not as replies.
