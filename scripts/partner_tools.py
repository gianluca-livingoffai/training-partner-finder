#!/usr/bin/env python3
"""Turn a ranked.json from the verifier into a markdown table, a WhatsApp list, or the outreach emails.

Usage:
  partner_tools.py table ranked.json [--title ...] [--status "..."]           -> markdown to stdout
  partner_tools.py whatsapp ranked.json [--all]                                -> "* Name: site" list to stdout
  partner_tools.py emails ranked.json --picks picks.json --offer offer.json --country Latvia [--locale en] [--drafts drafts.json] -> emails.md to stdout, drafts.json written

ranked.json: a list, or {"ranked": [...], "summary": "..."}; rows have tier, name, website, type, what,
cofinancing_access, english, fit, contact_email, contact_phone, contact_person, pitch_angle, flags, source_url.
picks.json: {"<name as in ranked.json>": {"greeting": "Dear Paula,", "partner_sentence": "...", "courses": ["aibb","sales"],
  "fit_phrase": "matter most to your members", "to": ["..."], "cc": ["..."], "type_class": "association"}}
type_class defaults to "association" for association/chamber/employer body/community rows, else "default".
"""
import argparse, json, re, sys, urllib.parse
from pathlib import Path

ASSOC_TYPES = ("association", "chamber", "employer", "community", "federation", "confederation", "ngo")
GROUPS = [
    ("Training companies and schools", ("training", "adult", "e-learning", "seminar", "school", "coding", "peer", "academy", "bootcamp", "provider", "producer", "organiser", "consultanc")),
    ("Business schools and universities", ("business school", "university", "executive", "continuing", "lifelong")),
    ("Associations, chambers and hubs", ASSOC_TYPES + ("edih", "cluster", "hub", "agency", "association")),
]


def load_rows(path):
    data = json.load(open(path))
    rows = data["ranked"] if isinstance(data, dict) else data
    summary = data.get("summary", "") if isinstance(data, dict) else ""
    return rows, summary


def host(url):
    if not url:
        return "-"
    u = url if url.startswith("http") else "https://" + url
    h = urllib.parse.urlparse(u).netloc.replace("www.", "")
    return h or url


def is_assoc(row):
    t = (row.get("type") or "").lower()
    return any(k in t for k in ASSOC_TYPES)


def group_of(row):
    t = (row.get("type") or "").lower()
    for label, keys in GROUPS[1:2]:  # business schools first: "school" also matches group 1
        if any(k in t for k in keys):
            return label
    for label, keys in (GROUPS[2],):
        if any(k in t for k in keys):
            return label
    return GROUPS[0][0]


def cmd_table(a):
    rows, summary = load_rows(a.ranked)
    out = [f"# {a.title}", ""]
    if a.status:
        out += [f"**Status:** {a.status}", ""]
    if summary:
        out += ["## Summary", "", summary, ""]
    cols = ["Organisation", "Type", "What they do", "Co-financing access", "English", "Why it fits", "Contact", "Pitch angle", "Flags"]
    for tier, label in (("A", "Tier A: write first"), ("B", "Tier B: good fit, narrower"), ("C", "Tier C: long shots and indirect routes")):
        sel = [r for r in rows if r.get("tier") == tier]
        if not sel:
            continue
        out += [f"## {label} ({len(sel)})", "", "| " + " | ".join(cols) + " |", "|" + "---|" * len(cols)]
        for r in sel:
            site = r.get("website") or ""
            site_url = site if site.startswith("http") else ("https://" + site if site else "")
            org = f"[{r['name']}]({site_url})" if site_url else r["name"]
            contact = " / ".join(x for x in (r.get("contact_person"), r.get("contact_email"), r.get("contact_phone")) if x)
            cells = [org, r.get("type", ""), r.get("what", ""), r.get("cofinancing_access", ""), r.get("english", ""), r.get("fit", ""), contact, r.get("pitch_angle", ""), r.get("flags", "")]
            out.append("| " + " | ".join(c.replace("|", "/").replace("\n", " ") for c in cells) + " |")
        out.append("")
    exc = [r for r in rows if r.get("tier") == "exclude"]
    if exc:
        out += [f"## Excluded ({len(exc)})", ""]
        out += [f"- {r['name']}: {r.get('flags') or r.get('what')}" for r in exc] + [""]
    srcs = sorted({r.get("source_url") for r in rows if r.get("source_url")})
    if srcs:
        out += ["## Sources", ""] + [f"- {s}" for s in srcs] + [""]
    print("\n".join(out))


def cmd_whatsapp(a):
    rows, _ = load_rows(a.ranked)
    sel = [r for r in rows if r.get("tier") != "exclude"]
    if not a.all:
        sel = [r for r in sel if "hold" not in (r.get("flags") or "").lower() and "no public email" not in (r.get("flags") or "").lower()]
    groups = {}
    for r in sel:
        groups.setdefault(group_of(r), []).append(r)
    order = [g for g, _ in GROUPS]
    for g in order:
        if g not in groups:
            continue
        print(g)
        for r in groups[g]:
            print(f"* {r['name']}: {host(r.get('website'))}")
        print()


def cmd_emails(a):
    rows, _ = load_rows(a.ranked)
    by_name = {r["name"]: r for r in rows}
    picks = json.load(open(a.picks))
    offer = json.load(open(a.offer))
    ov = offer.get("country_overrides", {}).get(a.country, {})
    locale = a.locale or ov.get("locale") or "en"
    L = offer["locales"].get(locale)
    if not L:
        sys.exit(f"locale {locale} not in offer file; write it first (see references/outreach-emails.md, Country adaptation)")
    base = ov.get("base", offer["defaults"]["base"])
    city = ov.get("city", offer["defaults"]["city"])
    drafts, md = [], [f"# Partnership emails, {a.country} ({locale})", ""]
    for name, p in picks.items():
        row = by_name.get(name, {"name": name, "type": p.get("type", "")})
        tclass = p.get("type_class") or ("association" if is_assoc(row) else "default")
        courses = [L["courses"][k] for k in p["courses"]]
        n = L["numbers"].get(str(len(courses)), str(len(courses)))
        if len(courses) == 1:
            clist = courses[0]
        else:
            clist = "; ".join(courses[:-1]) + ("; and " if len(courses) > 2 else ", and ") + courses[-1]
        attach = L["attachment_lead"].format(n=n, fit_phrase=p.get("fit_phrase", L["fit_phrase_default"]), courses=clist)
        greeting = p.get("greeting")
        if not greeting:
            person = (row.get("contact_person") or "").split(",")[0].strip()
            greeting = L["greeting_named"].format(names=person.split()[0]) if person else L["greeting_team"].format(org=name)
        paras = [greeting, L["intro"].format(base=base), p["partner_sentence"], attach,
                 L["why_now"].get(tclass, L["why_now"]["default"]).format(country=a.country),
                 L["ask"].get(tclass, L["ask"]["default"]),
                 "\n".join(s.format(city=city) for s in offer["signature"])]
        body = "\n\n".join(paras)
        if "—" in body or "–" in body:
            sys.exit(f"em or en dash in the email to {name}; house rule: none in outbound text")
        subject = p.get("subject") or L["subject"].get(tclass, L["subject"]["default"])
        to = p.get("to") or ([row["contact_email"]] if row.get("contact_email") else [])
        cc = p.get("cc") or []
        drafts.append({"key": re.sub(r"[^a-z0-9]+", "", name.lower())[:24], "name": name, "type": row.get("type", ""), "type_class": tclass,
                       "to": to, "cc": cc, "subject": subject, "body": body, "hold": "hold" in (row.get("flags") or "").lower()})
        md += [f"## {name} ({row.get('type', '')}) · to {', '.join(to) or '?'}" + (f" cc {', '.join(cc)}" if cc else ""), f"Subject: {subject}", "", body, ""]
    Path(a.drafts).write_text(json.dumps(drafts, ensure_ascii=False, indent=1))
    print("\n".join(md))
    print(f"\n<!-- {len(drafts)} drafts written to {a.drafts}; holds: {sum(d['hold'] for d in drafts)} -->")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("table"); t.add_argument("ranked"); t.add_argument("--title", default="Training organisations to approach"); t.add_argument("--status", default="")
    w = sub.add_parser("whatsapp"); w.add_argument("ranked"); w.add_argument("--all", action="store_true", help="include holds and rows without public email")
    e = sub.add_parser("emails"); e.add_argument("ranked"); e.add_argument("--picks", required=True); e.add_argument("--offer", required=True)
    e.add_argument("--country", required=True); e.add_argument("--locale"); e.add_argument("--drafts", default="drafts.json")
    a = ap.parse_args()
    {"table": cmd_table, "whatsapp": cmd_whatsapp, "emails": cmd_emails}[a.cmd](a)


if __name__ == "__main__":
    main()
