# Verify and rank

One verifier takes the whole raw pool. Doing it in one place is what makes the list trustworthy: dedupe needs the full set, tiers need comparison, and the pitch angles need to differ from each other.

## The verifier's tasks, in order

1. **Dedupe.** Same organisation under different names, brands or domains (an academy and its parent agency are one row).
2. **Open every website or contact page yourself.** Confirm the site is live, that the organisation sells training to companies in this country, and copy the general email and phone exactly as published. Add a named contact and role only when the site shows one. Never invent or "likely" an email.
3. **Exclude** what does not sell training to companies in the country (state AI centres, foreign schools without a local presence, pure consultancies without training). Keep the row with tier "exclude" and the reason, so the next run does not rediscover it.
4. **Mark** already contacted (from the exclusions list) and partner-linked holds (from the holds list) in `flags`.
5. **Rank** the rest:
   - **Tier A**: clear fit, English-capable or international clientele, a B2B catalogue where the courses or the lecturer offer slot in, or direct access to co-financed training budgets. Write first.
   - **Tier B**: good fit but narrower: local-language delivery only, narrower audience, or a sector niche.
   - **Tier C**: long shots and indirect routes: associations, chambers, communities, bodies that open doors rather than buy.
6. **Pitch angle**: one line per organisation, tailored, that becomes the bespoke sentence of the email later.
7. **Flags**: competitor risk (they already sell AI courses or have their own AI faculty), partner-linked, already contacted, site dead, contact unverified, no public email.
8. **Summary**: five to eight patterns, in prose. The Latvian summary is the model: which register was the richest source and why, which providers of a scheme are still uncontacted, who the English-speaking executive market is, which adjacent firms are the cleanest pitch, who is high competitor risk, which hidden overlaps to check with a relationship owner, any corrections to the raw pool, which funding is live and which ended.

## After the verifier: the dead-site check

Load every website yourself:

```bash
python3 - <<'PY'
import json, subprocess
rows = json.load(open("ranked.json"))
rows = rows["ranked"] if isinstance(rows, dict) else rows
for r in rows:
    url = r["website"] if r["website"].startswith("http") else "https://" + r["website"]
    code = subprocess.run(["curl", "-sS", "-o", "/dev/null", "-L", "-m", "15", "-w", "%{http_code}", url], capture_output=True, text=True).stdout
    print(code, r["name"], url)
PY
```

Note failures in the row's flags ("site did not respond twice", "contact URL 404, training page works").

## ranked.json

A list (or `{"ranked": [...], "summary": "..."}`) of rows with these fields, all strings:
`tier` (A, B, C, exclude), `name`, `website`, `type` (training company, business school, university unit, association, chamber, employer body, EDIH or cluster, development agency, peer AI training firm, seminar organiser, e-learning producer, community, adult education provider, school), `what`, `cofinancing_access`, `english`, `fit`, `contact_email`, `contact_phone`, `contact_person`, `pitch_angle`, `flags`, `source_url`.

## The table the user files

`partner_tools.py table ranked.json` writes the markdown table for your notes: a header with scope, date, who was already emailed and who is linked through whom; the summary patterns; then one section per tier with the columns Organisation (linked to the site), Type, What they do, Co-financing access, English, Why it fits, Contact, Pitch angle, Flags; then the excluded rows with reasons; then Sources. Keep a status line at the top and update it after each send wave (sent, held, no public email, replies pending).
