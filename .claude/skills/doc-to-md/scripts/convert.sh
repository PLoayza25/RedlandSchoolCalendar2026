#!/usr/bin/env bash
# Convert PDF / Word / PowerPoint / Excel files to Markdown.
# Usage: convert.sh <file-or-folder> [more...]   (output goes to docs-md/ next to the repo root)
# Skips files whose .md is already newer than the source, so re-runs are cheap.
set -uo pipefail
OUT="${DOC_TO_MD_OUT:-docs-md}"
mkdir -p "$OUT"

convert_one() {
  local src="$1" base dest
  base="$(basename "$src")"
  dest="$OUT/$base.md"
  if [[ -f "$dest" && "$dest" -nt "$src" ]]; then
    echo "skip (up to date): $dest"; return
  fi
  case "${src,,}" in
    *.docx|*.odt)
      pandoc -t gfm --wrap=none "$src" -o "$dest" ;;
    *.pdf)
      markitdown "$src" -o "$dest" 2>/dev/null || pdftotext -layout "$src" "$dest" ;;
    *.pptx|*.xlsx|*.xls|*.html|*.htm)
      markitdown "$src" -o "$dest" ;;
    *.doc)
      soffice --headless --convert-to docx --outdir /tmp "$src" >/dev/null 2>&1 \
        && pandoc -t gfm --wrap=none "/tmp/${base%.*}.docx" -o "$dest" ;;
    *) return ;;
  esac
  if [[ -s "$dest" ]]; then
    echo "ok: $src -> $dest ($(wc -w < "$dest") words)"
  else
    echo "WARN: $src produced no text (scanned PDF? needs OCR)"; rm -f "$dest"
  fi
}

for arg in "$@"; do
  if [[ -d "$arg" ]]; then
    while IFS= read -r -d '' f; do convert_one "$f"; done < <(
      find "$arg" -type f \( -iname '*.pdf' -o -iname '*.docx' -o -iname '*.doc' -o -iname '*.odt' \
        -o -iname '*.pptx' -o -iname '*.xlsx' -o -iname '*.xls' \) -not -path "*/$OUT/*" -print0)
  else
    convert_one "$arg"
  fi
done
