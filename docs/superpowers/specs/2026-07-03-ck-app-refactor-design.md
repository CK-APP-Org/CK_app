# CK App Refactor — Design

## Context

`docs/EVALUATION.md` (generated 2026-06-24, multi-agent review, 13 units) audited the CK App codebase and scored it 4.4/10: functional but carrying critical security debt (a real Taipei Metro credential and plaintext user passwords committed to source, a world-readable single-document Firestore user database with no rules), zero automated tests, and two god-components (`TransportPage.vue` ~1746 lines, `TodoPage.vue` 1393 lines).

`docs/refactoring-plan.md` translates that audit into an 8-phase remediation plan (Phase 0 prep → Phase 7 test infra). This design adopts that plan as the technical scope, as-is, and specifies the operational envelope for executing it: how the 8 phases are sequenced and isolated, how each is verified, and one deviation from the plan's Phase 1-B as written.

This doc does not restate the technical content of `docs/refactoring-plan.md` — that file remains the source of truth for *what* changes in each phase. This doc governs *how* the work is carried out.

## Scope decomposition

Each of the 8 phases in `docs/refactoring-plan.md` is treated as an independent sub-project with its own spec-to-merge cycle:

1. **Phase 0** — Prep (branch, move `src/tools/`, write smoke-test checklist)
2. **Phase 1** — Security (Firebase dedup, Metro credential extraction)
3. **Phase 2** — Quick wins (remove `storeWatcherPlugin`, dedupe mutation, strip `console.log`, remove unused deps)
4. **Phase 3** — Remove dead login/account feature (confirmed: delete, not fix)
5. **Phase 4** — Component splitting, done as four independent sub-phases in order: Transport → Todo → Settings → Food
6. **Phase 5** — Hygiene (i18n removal, version alignment, Vuex cleanup)
7. **Phase 6** — Bug fixes (Menu date off-by-one, Food time overflow)
8. **Phase 7** — Test infrastructure (Vitest, unit tests for the pure functions extracted in Phase 4)

Sequencing rationale: security first (highest-severity findings), then low-risk cleanup, then the one destructive/product decision (Phase 3), then the highest-effort structural work (Phase 4), then remaining hygiene/bugs, then tests last — tests are written against the pure functions that Phase 4 extracts, so testing before extraction would mean testing code that's about to move.

## Git workflow

- Each phase is a branch off `main` (e.g. `refactor/phase-1-security`), branched from the latest `main` after the previous phase's PR merges.
- Each phase is its own PR, reviewed and merged individually — not batched.
- No commit in this work uses the `[deploy]` prefix; that remains manually triggered by the user once they're ready to ship.
- Phase 4's four sub-phases (Transport/Todo/Settings/Food) are each their own commit at minimum, so a bad extraction in one component doesn't block or entangle the others; whether they're separate PRs or one PR with four commits is decided when Phase 4 starts, based on how Phase 1–3 PRs felt in practice.

## Verification

- No automated tests exist before Phase 7. For Phases 0–6, verification is: start `quasar dev`, then exercise the relevant slice of the manual smoke-test checklist from `docs/refactoring-plan.md` (§ Verification) via browser automation — targeted to whatever that phase touched, not the full checklist every time.
- Full checklist (all of YouBike, Metro, Food, Calendar, Todo, Home, Settings, Menu, News) is run once at the end of Phase 6, before starting Phase 7.
- **Native-only gap:** browser smoke-testing exercises the web build only. Capacitor-specific behavior (native Android/iOS webview quirks, native Firebase SDK paths, `android:allowBackup`, native build files touched in Phase 5's version alignment) cannot be exercised this way. Any phase that touches native-only code paths gets flagged explicitly in its PR description so the user can test on-device before merging.
- Phase 7 itself is verified by running `yarn test` (post-rename from the current no-op script) and confirming it's wired into CI.

## Deviation from `docs/refactoring-plan.md` as written

**Phase 1-B (Metro credentials):** the plan as written says to create `src/config/metroApi.js` exporting `METRO_API_USER`/`METRO_API_PASS` as constants. This design instead keeps the *value* out of version control entirely — e.g. an environment variable or a gitignored local config file with a checked-in `.env.example`/`metroApi.example.js` placeholder — because the root problem the evaluation identifies is the credential being committed to source at all; moving it to a different file in the same repo doesn't fix that. The plan's own recommendation to rotate the credential stands and is the user's responsibility (rotating a third-party Taipei Metro/TDX account isn't something Claude can do); the code changes in this phase assume rotation has happened and will not commit whatever the new value is.

## Rollback safety

Because each phase is isolated to its own branch/PR, a problem discovered in one phase (e.g. Phase 3's login removal breaking something unexpected) can be reverted independently without unwinding unrelated phases. Phase 4's per-component sub-phases give the same isolation at a finer grain within the highest-risk phase.

## Out of scope

- Anything not already listed in `docs/refactoring-plan.md`'s phases (e.g. rewriting the polling architecture beyond what Phase 4 touches, redesigning the persistence layer beyond what's already called out) is out of scope for this refactor and would need its own follow-up spec.
- Rotating the leaked Metro credential and Firebase/Firestore exposure response (rules, `allowBackup`) are the user's action items outside of Claude's code changes; this design only covers the code-side remediation.
