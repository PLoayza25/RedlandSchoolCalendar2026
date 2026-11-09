---
name: doc-to-md
description: Convert PDF, Word (.docx/.doc/.odt), PowerPoint and Excel files into Markdown once, so later work reads compact text instead of re-parsing binary documents. Use when the user drops documents into the project, says "convert to markdown", "md these files", or asks questions about the content of PDFs/Word files (calendars, unit plans, IB/MYP guides, policies).
---

# doc-to-md

Turn source documents into Markdown **once**, save them in `docs-md/`, and read
the `.md` from then on. That saves time and tokens on every later request.

## How to run

```bash
.claude/skills/doc-to-md/scripts/convert.sh <file-or-folder> [more...]
```

- Output: `docs-md/<original filename>.md` (e.g. `docs-md/Calendar 2026.pdf.md`).
  Set `DOC_TO_MD_OUT=other/dir` to change it.
- Re-running is cheap: files whose `.md` is newer than the source are skipped.
- Engines: Word → `pandoc` (best headings/tables); PDF → `markitdown`, falling
  back to `pdftotext -layout`; PowerPoint/Excel → `markitdown`; `.doc` → LibreOffice then pandoc.

## Workflow

1. Before reading any PDF/Word file, check `docs-md/` for an up-to-date `.md` and read that instead.
2. If missing or stale, run the script on just the files needed (or the whole folder).
3. Skim the result. PDF tables often lose their columns: if a table matters, rebuild
   it as a Markdown table by hand and note that in the file.
4. A `WARN ... no text` line means a scanned PDF; tell the user it needs OCR
   (the `pdf` skill covers OCR) rather than guessing the content.
5. Use `grep -n` on `docs-md/` to find the relevant section, then read only that part.

## Don't

- Don't convert files the task doesn't need.
- Don't edit the original documents; the `.md` is a working copy.
- Don't treat the `.md` as the final deliverable when the user wants a branded
  Redland document; build that separately with the docs/docx skills.
