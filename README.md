# training-partner-finder

A Claude Code skill that finds, vets and approaches training organisations in a country that could resell your courses or take you on as a partner lecturer. Built from a real run in Latvia (October 2026): 50 organisations vetted and ranked in one pass, 44 emailed with a course deck attached, first reply in 22 minutes.

It is written for trainers and consultants who want partners, not end clients, in a new market: the organisations that already have the clients, the catalogue and, where it exists, the public training money.

## What it does

1. **Country playbook.** Where the training money sits, which registers already list providers, seed organisations, local-language search phrases, how people answer cold email. Latvia is verified; Italy, Brazil, Estonia, Lithuania, the UK and the USA are starters you verify with the included research workflow.
2. **Five-lens sweep.** Five parallel researchers, each blind to the others: follow the public money to its procured providers; commercial IT and digital trainers; business schools, chambers and digital hubs; AI-specific players; adjacent sales, leadership, HR and marketing trainers with no AI module yet.
3. **Verify and rank.** One verifier dedupes, opens every site, copies contacts as published, ranks A/B/C, writes a pitch angle per organisation and flags competitor risk and relationship overlaps.
4. **Outreach kit.** One email skeleton, one bespoke sentence per organisation, type-specific variants (training company, business school, association, hub, peer firm, seminar organiser, e-learning producer, community), the deck attached to everyone, drafts created in Gmail, sent through the browser only after you approve the exact list.

## Install

Copy this folder to `~/.claude/skills/training-partner-finder/` and edit `assets/offer.example.json` into `assets/offer.json` with your own name, credentials, courses, signature and deck path. Then ask Claude Code for "find training partners in Estonia" or "do the same for Italy".

Works best with the Workflow tool (parallel agents), the Gmail connector and the Claude in Chrome extension. Without them the skill falls back to sequential agents and manual steps; the method is the same.

## Files

- `SKILL.md`: the seven phases, the rules and why they exist, the pitfalls already paid for.
- `references/country-playbooks.md`, `lenses.md`, `verify-and-rank.md`, `outreach-emails.md`, `send-loop.md`.
- `references/workflow-template.js` and `playbook-workflow.js`: Workflow scripts, parametrised by country and offer.
- `scripts/partner_tools.py`: ranked JSON to a markdown table, a WhatsApp list, or the email bodies.
- `assets/offer.example.json`: the offer file template.

## Author

Gianluca Giuliani, Living Off AI. MIT licence. No warranty: verify every funding claim and every contact before you write to anyone, and never send without reading the final text yourself.
