// Sweep + verify workflow. Pass args = {
//   country, languages, today, who (one sentence: name, company, what you teach, languages, where based), offer (one paragraph: courses and lecturer offer, credentials), exclusions (names already contacted),
//   holds (names linked to a relationship someone else owns, with the owner),
//   lenses: [{ key, prompt }]  // five prompts built from references/lenses.md + the country playbook
//   perLens: 12                 // candidates per lens, 8 to 15
// }
export const meta = {
  name: 'training-partners-sweep',
  description: 'Find and vet training organisations in a country that could resell the AI courses or take the user as partner lecturer: five-lens sweep, then one verifier that opens every site and ranks',
  phases: [
    { title: 'Sweep', detail: 'five lenses over the training market' },
    { title: 'Verify', detail: 'dedupe, open sites and contacts, rank A/B/C' },
  ],
}

const A = args
const BRIEF = `Context (today ${A.today}): ${A.who} offers training to companies and wants PARTNERS, not end clients, in ${A.country}: training organisations that can offer the user's courses through their catalogue or take the user as a partner lecturer for their existing AI, automation and productivity courses. Offer: ${A.offer} Already contacted (EXCLUDE from results): ${A.exclusions || 'none'}. Linked to a relationship someone else owns (return them but flag as HOLD with the owner's name): ${A.holds || 'none'}. Local language(s): ${A.languages}; search in them first, then in English. Use WebSearch and WebFetch; prefer official pages (ministries, funds, agencies, registers, e-procurement) and the organisations' own sites. For every candidate capture: name, website, type, one line on what they do, evidence they deliver corporate training, co-financing access (none / listed provider of which scheme / fund beneficiary / EDIH partner), English-language capability if visible, why it fits the user's courses, contact (general email, phone, named person and role if public on their site), the source URL you opened, a one-line pitch angle, and confidence. Mark uncertain items as such. No em dashes in your text.`

const SCHEMA = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    candidates: { type: 'array', items: { type: 'object', properties: {
      name: { type: 'string' }, website: { type: 'string' }, type: { type: 'string' }, what: { type: 'string' },
      corporate_training_evidence: { type: 'string' }, cofinancing_access: { type: 'string' }, english: { type: 'string' },
      fit: { type: 'string' }, contact_email: { type: 'string' }, contact_phone: { type: 'string' }, contact_person: { type: 'string' },
      source_url: { type: 'string' }, pitch_angle: { type: 'string' }, confidence: { type: 'string', enum: ['verified', 'likely', 'uncertain'] },
    }, required: ['name', 'website', 'type', 'what', 'corporate_training_evidence', 'cofinancing_access', 'english', 'fit', 'contact_email', 'contact_phone', 'contact_person', 'source_url', 'pitch_angle', 'confidence'] } },
    notes: { type: 'string' },
  },
  required: ['lens', 'candidates', 'notes'],
}

const VSCHEMA = {
  type: 'object',
  properties: {
    ranked: { type: 'array', items: { type: 'object', properties: {
      tier: { type: 'string', enum: ['A', 'B', 'C', 'exclude'] }, name: { type: 'string' }, website: { type: 'string' }, type: { type: 'string' }, what: { type: 'string' },
      cofinancing_access: { type: 'string' }, english: { type: 'string' }, fit: { type: 'string' }, contact_email: { type: 'string' }, contact_phone: { type: 'string' }, contact_person: { type: 'string' },
      pitch_angle: { type: 'string' }, flags: { type: 'string', description: 'already contacted / HOLD (owner) / competitor risk / site dead / contact unverified / no public email' }, source_url: { type: 'string' } },
      required: ['tier', 'name', 'website', 'type', 'what', 'cofinancing_access', 'english', 'fit', 'contact_email', 'contact_phone', 'contact_person', 'pitch_angle', 'flags', 'source_url'] } },
    summary: { type: 'string' },
  },
  required: ['ranked', 'summary'],
}

phase('Sweep')
const per = A.perLens || 12
const sweeps = await parallel(A.lenses.map(l => () => agent(`${BRIEF}\n\n${l.prompt}\n\nReturn ${Math.max(8, per - 4)} to ${per + 3} candidates for your lens, each with a source URL you actually opened.`, { label: `sweep:${l.key}`, phase: 'Sweep', schema: SCHEMA, model: 'opus', effort: 'high' })))
const all = sweeps.filter(Boolean).flatMap(s => s.candidates.map(c => ({ ...c, lens: s.lens })))
log(`${all.length} raw candidates from ${sweeps.filter(Boolean).length} lenses`)

phase('Verify')
const verified = await agent(`${BRIEF}\n\nYou are the verifier. Below is the raw candidate pool from five researchers. Tasks: (1) dedupe (same organisation under different names, brands or domains); (2) open each organisation's website or contact page yourself and confirm it is live, that it sells training to companies in ${A.country}, and copy the general email and phone exactly as published, plus a named contact and role when the site shows one, never a guessed address; (3) mark "exclude" with the reason anything that is not a training seller to companies in ${A.country}; mark the already-contacted names and the HOLD names (with owner) in flags; (4) rank the rest: Tier A = clear fit, English-capable or international clientele, B2B catalogue where the user's courses or lecturer offer slot in, or access to co-financed training budgets; Tier B = good fit but local-language delivery only or narrower audience; Tier C = long shot or indirect (association, chamber, community); (5) write a one-line pitch angle tailored to each organisation; (6) flag competitor risk where they already sell AI courses or have their own AI trainers, and hidden overlaps with the HOLD owners. Return the full ranked list (aim for 20 to 50 entries after dedupe) and a summary of five to eight patterns (richest source, uncontacted providers of live schemes, the English-speaking executive market, the cleanest adjacent pitches, high competitor risk, hidden overlaps, corrections, which funding is live and which ended). No em dashes.\n\nRAW POOL:\n${JSON.stringify(all, null, 1)}`, { label: 'verify', phase: 'Verify', schema: VSCHEMA, model: 'opus', effort: 'high' })

return { raw_count: all.length, verified }
