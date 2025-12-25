# Repository Guidelines

## Project Structure & Module Organization
- `main.tex` drives the resume; it sets page geometry, imports packages, and `\input`s section files.
- Section files (e.g., `workex.tex`, `skills.tex`, `extra.tex`, `honors.tex`, `publications.tex`, `patents.tex`, `teachex.tex`) hold content blocks and can be toggled by commenting their `\input` lines in `main.tex`.
- Build artifacts are written alongside sources; prefer outputting to `main.pdf` to keep the root clean.

## Build, Test, and Development Commands
- Compile once for a quick check: `pdflatex -interaction=nonstopmode main.tex`.
- Continuous builds (if available): `latexmk -pdf -interaction=nonstopmode main.tex`.
- Clean auxiliary files after checks: `latexmk -c` or manually remove `.aux`, `.log`, `.out`.

## Coding Style & Naming Conventions
- Keep LaTeX terse: rely on `\section*` and existing `\itemize` blocks with `[noitemsep,nolistsep]` to preserve spacing.
- Maintain the established vertical spacing commands (`\vspace{-0.1in}`–`-0.2in`) around sections; adjust only when layout issues are visible in the PDF.
- Prefer bold org names and italic titles, with roles/dates aligned using `\hfill`.
- Use ASCII; avoid introducing non-UTF8 symbols that may break the build.

## Testing Guidelines
- Build the PDF after any change; ensure the log is free of errors and unexpected overfull boxes.
- Review the generated `main.pdf` for layout regressions (widows, large gaps, or broken alignment).
- If adding macros, confirm they do not clash with existing packages (geometry, enumitem, titlesec, hyperref, babel).

## Commit & Pull Request Guidelines
- Use concise, descriptive commits (e.g., `update-workex-bullets`, `tune-spacing-education`); group related content edits together.
- For pull requests, summarize scope (which sections changed), attach the updated `main.pdf`, and note any spacing or package adjustments made.
- Link to any tracking issue if relevant and call out content sources when adding new achievements or metrics.
