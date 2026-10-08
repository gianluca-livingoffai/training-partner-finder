# Send loop: Gmail drafts, deck attached and sent through Chrome

Why this route: the Gmail MCP creates and edits drafts well, but attachments only travel as inline base64, useless for a PDF of 650 KB or more. The browser attaches and sends; the MCP verifies.

## Drafts (Gmail MCP)

- `create_draft` with `to` and `cc` as arrays works. Keep the body plain text with no URLs: the web composer rewrites every URL into a google.com redirect and autosaves it. Signature = name, role, email, phone, city.
- `update_draft` returns a NEW messageId. Keep `drafts.json` current.
- `get_draft` does not show files attached in the browser. Do not use it to check attachments.
- A draft's messageId changes again when a file is attached in the browser. Before opening compose URLs for drafts attached earlier, refetch with `list_drafts` (query `newer_than:2d has:attachment`, metadata view gives recipients and messageId). A stale id opens the Drafts list with nothing to send.

## Per draft (Claude in Chrome, one tab)

1. `navigate` to `https://mail.google.com/mail/?authuser=<your address>#drafts?compose=<messageId>`, wait 5 to 6 s. Each navigate reloads the page, so only one compose is open.
2. `screenshot` at scale 0.3. If the compose is a minimized bar at the bottom right, click the bar's title area to expand it (its x position shifts when the right side panel collapses, so read it from the screenshot; a click on an already expanded window minimizes it).
3. `find` "hidden file input (input type=file) of the compose window addressed to <recipient>" and `file_upload` the deck with its absolute path. Wait 8 s.
4. `find` the attachment chip by file name in the compose addressed to <recipient>: exactly one chip.
5. `find` "primary Send button of the expanded compose window addressed to <recipient>" and click it by ref. Wait 3 to 4 s.
6. `find` "the 'Message sent' notice (in your Gmail UI language)". "'Sending…'" means still sending; the Drafts counter in the tab title dropping by one is the confirmation. Chain the next `navigate` in the same batch.

About 45 seconds per email in one `browser_batch` per step group. The Chrome extension can drop mid-batch ("not connected"): the batch usually ran anyway, so check state with a screenshot and a chip `find` before repeating an upload, or the email goes out with two attachments.

Already-attached drafts (for example Tier A attached before approval) skip step 3: open, check the chip, send.

## Verify everything at the end

```
search_threads  query: in:sent after:YYYY/MM/DD has:attachment filename:<deck file name>.pdf   view: METADATA_ONLY, pageSize 50
list_drafts     query: newer_than:2d subject:(AI training)   view: METADATA_ONLY
```

Count the Sent threads against the approved list; the drafts left must be exactly the holds. Each sent message is about 920 KB when the deck is attached.

## Replies

Search `in:inbox after:YYYY/MM/DD -from:<your address>` and the subject line. Auto-replies arrive within minutes (out of office, "within 3 working days"): log them as "mailbox live", not as replies. Real replies in Latvia came from the CEO of a small provider within 22 minutes; move them to the project note's Waiting list and create the calendar event when a call is agreed.
