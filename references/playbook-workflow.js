// Country playbook research. Pass args = { country, languages, today, who, offer, hints }
// hints: what you already expect for that country (schemes, registers, known providers), so the researcher starts warm.
export const meta = {
  name: 'country-training-market-playbook',
  description: 'Research one country: public training money, existing provider lists, seed organisations per lens, local search phrases, outreach culture; then a skeptic re-opens every funding source',
  phases: [
    { title: 'Research', detail: 'one researcher' },
    { title: 'Verify', detail: 'one skeptic re-opens the funding URLs' },
  ],
}

const A = args

const PLAYBOOK = {
  type: 'object',
  properties: {
    country: { type: 'string' },
    funding_instruments: { type: 'array', items: { type: 'object', properties: {
      name: { type: 'string' }, administrator: { type: 'string' }, what_it_pays: { type: 'string' },
      who_can_deliver: { type: 'string' }, foreign_trainer_route: { type: 'string' }, url: { type: 'string' }, status_now: { type: 'string' }
    }, required: ['name', 'administrator', 'what_it_pays', 'who_can_deliver', 'foreign_trainer_route', 'url', 'status_now'] } },
    existing_lists: { type: 'array', items: { type: 'object', properties: {
      name: { type: 'string' }, what_it_lists: { type: 'string' }, url: { type: 'string' }, how_to_use: { type: 'string' }
    }, required: ['name', 'what_it_lists', 'url', 'how_to_use'] } },
    lenses: { type: 'array', items: { type: 'object', properties: {
      lens: { type: 'string' },
      seeds: { type: 'array', items: { type: 'object', properties: {
        name: { type: 'string' }, url: { type: 'string' }, type: { type: 'string' }, english_delivery: { type: 'string' }, why: { type: 'string' }
      }, required: ['name', 'url', 'type', 'english_delivery', 'why'] } },
      search_phrases: { type: 'array', items: { type: 'string' } }
    }, required: ['lens', 'seeds', 'search_phrases'] } },
    outreach_notes: { type: 'array', items: { type: 'string' } },
    competitor_notes: { type: 'array', items: { type: 'string' } },
    caveats: { type: 'array', items: { type: 'string' } },
  },
  required: ['country', 'funding_instruments', 'existing_lists', 'lenses', 'outreach_notes', 'competitor_notes', 'caveats'],
}

const VERDICT = {
  type: 'object',
  properties: {
    country: { type: 'string' },
    corrections: { type: 'array', items: { type: 'object', properties: {
      item: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, url: { type: 'string' }
    }, required: ['item', 'problem', 'fix', 'url'] } },
    confirmed: { type: 'array', items: { type: 'string' } },
    missing_instruments: { type: 'array', items: { type: 'object', properties: {
      name: { type: 'string' }, why_it_matters: { type: 'string' }, url: { type: 'string' }
    }, required: ['name', 'why_it_matters', 'url'] } },
    confidence: { type: 'string' },
  },
  required: ['country', 'corrections', 'confirmed', 'missing_instruments', 'confidence'],
}

const BRIEF = `Context (today ${A.today}). ${A.who} ${A.offer} The user does NOT want to sell to end companies in a new country; the user wants to partner with established training organisations that already have clients and, where it exists, access to public or quasi-public training money. In Latvia this worked because the ESF+ sector-skills projects publish the providers they procured, and five lenses covered the market (1 follow the public money to procured or accredited providers; 2 commercial IT and digital trainers; 3 business schools, university continuing education, chambers and employer bodies, EDIH-type hubs; 4 AI-specific players; 5 adjacent sales, leadership, HR and marketing trainers with no AI module yet).

Rules: open sources yourself with WebFetch or WebSearch and only report what you saw; prefer official pages and the organisations' own sites; mark anything you could not open as "unverified"; give real URLs you opened, never guessed ones; no em dashes anywhere; keep every field concise.`

phase('Research')
const pb = await agent(`${BRIEF}

Your country: ${A.country}. Local language(s): ${A.languages}. Produce the COUNTRY PLAYBOOK:
1. funding_instruments: every public or quasi-public scheme that pays for company training (national, dominant regional ones, sector funds, vouchers, levies, EU funds where relevant). For each: administrator, what it pays and to whom, who may DELIVER (accredited or listed providers only? any supplier? named lecturers?), how a foreign freelance trainer gets in (usually as named lecturer of a listed provider), the official URL, status now (open, closed, ended, upcoming). Starting hints: ${A.hints || 'none'}
2. existing_lists: registers and catalogues that already enumerate providers (accreditation registers, fund-approved provider lists, chamber training arms, exec-ed directories, EDIH partner lists, training-market associations' member lists). URL plus how to use it.
3. lenses: for each of the five lenses, 6 to 10 seed organisations you verified exist and sell training to companies (name, URL you opened, type, English delivery, one-line why), plus 8 to 12 search phrases in the local language(s) and in English.
4. outreach_notes: how to write to them in that country (formality, titles, language of the first email, response habits, best channel, decision-maker role).
5. competitor_notes: who already sells AI training to companies at scale.
6. caveats: what you could not verify or what changes often.`, { label: `research:${A.country}`, phase: 'Research', schema: PLAYBOOK, model: 'opus', effort: 'high' })

phase('Verify')
const verdict = pb ? await agent(`${BRIEF}

You are the skeptic for ${A.country}. Re-open the official URL of EVERY funding instrument and the top 3 existing lists below and check: does the scheme exist under that name, does it pay for company training as stated, is the "who can deliver" rule right, is the status right, is the foreign-trainer route realistic. Report corrections (with the URL that proves each), the items you confirmed, and any major instrument the researcher MISSED. Default to flagging when uncertain. confidence = your overall trust in the corrected playbook: high, medium or low.

PLAYBOOK:
${JSON.stringify(pb, null, 1)}`, { label: `verify:${A.country}`, phase: 'Verify', schema: VERDICT, model: 'opus', effort: 'high' }) : null

return { playbook: pb, verdict }
