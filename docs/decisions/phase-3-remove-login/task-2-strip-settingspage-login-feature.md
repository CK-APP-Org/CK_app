# Task 2: Strip the login/backup/import feature out of SettingsPage.vue

**Commit:** `aafd74f` — "refactor: remove login/backup/import feature from SettingsPage.vue"

## What changed, in plain language

`SettingsPage.vue` went from 975 lines to 339 lines. It used to do two unrelated jobs mixed together in one file:

1. **Real, actively-used settings** — pick your class, toggle which widgets show on the home page, customize the toolbar, change the theme color, clear local data. These all still work exactly as before.
2. **A dead admin feature** — a login card, three popup dialogs for "backing up" and "importing" your data, and roughly 380 lines of code that talked to Firebase to save/load that data. Task 1 (the previous commit) already deleted the login page and its Vuex module; this task removed everything in *this* file that depended on them.

We removed job #2 entirely and left job #1 completely untouched.

## Why this is safe

Every one of the removed pieces was **only** reachable from the deleted login card — there was no other button, page, or automatic trigger that called `saveData`, `confirmImport`, or `logout`. Before editing, we explicitly listed the features that must NOT be touched (class dropdown, clear-data dialog, home-widget dialog, toolbar dialog, theme color) and checked after editing that every one of them was still present and still wired to the same template elements.

## How Vue's `setup()` function works (for readers new to Vue 3's Composition API)

This file uses Vue 3's "Composition API" style. Instead of spreading a component's logic across separate `data`, `methods`, and `computed` blocks (the older "Options API"), everything lives inside one `setup()` function, and whatever it returns in its `return { ... }` object becomes available to the `<template>` section above it.

That means two things had to be removed *together* for each dead feature:
- The variable/function definition inside `setup()` (e.g. `const saveData = async () => { ... }`)
- Its name in the `return { ... }` list at the bottom (e.g. the `saveData,` line)

Removing only one half would leave either dead code that's unreachable (definition without being returned) or a crash (returned name pointing at nothing). We removed both halves for every deleted item, and left both halves alone for every kept item.

## The two big deletions (confirmImport and saveData)

Two functions accounted for most of the ~640 deleted lines:
- **`confirmImport`** (~250 lines): read a user's data back from a shared Firestore document and overwrite the local app state with it.
- **`saveData`** (~130 lines): the reverse — pushed local app state up to that same Firestore document.

Both talked to a single shared Firestore document keyed by username — the same document structure flagged as a security problem in the original codebase audit (anyone who could read that document could see every user's data). Deleting the code that reads/writes it removes that exposure entirely, rather than trying to patch access rules around it.

## A few "why does this file still say `useRouter`?" notes

- `useRouter` (plural — gives you a `router` object to call `.push(path)`) is still imported and used, because the legitimate `clearAllData` function calls `router.push("/")` after clearing data. Only `useRoute` (singular — reads the *current* route's query params, e.g. `?justLoggedIn=true`) was removed, because that was only used by the deleted `onMounted` login-redirect logic.
- Similarly, a couple of verification greps this task ran turned up "matches" that looked alarming at first glance but weren't: `useRoute` matched inside the substring of `useRouter` (still legitimate), and an earlier task's grep for `LoginPage` matched inside `goToLoginPage` (which this task did delete). Substring matches like these are a normal false-positive of quick greps — worth a second look before trusting the raw count, not a sign of a problem.

## Verification performed

- Applied all 10 planned edits (banner, admin-login card, 3 dialogs, dead imports, dead refs/computeds, the two big function deletions, the trimmed `return {}`, and the dead CSS for `.custom-banner`/`.adminbackground`/`.admin-username`/`.admin-email`).
- Grepped for every deleted name (`isLoggedIn`, `saveData`, `confirmImport`, `firebaseConfig`, etc.) — zero real matches.
- Grepped for every feature that must survive (class selection, clear-data, home-widget dialog, toolbar dialog, theme color) — all present and correctly connected between `<template>` and `setup()`.
- `yarn lint` — clean, no errors.
- Started the dev server (`yarn dev`), confirmed it compiled with no errors, and confirmed both `/` and `/#/settings` respond with HTTP 200 with no new errors in the server log. (Full interactive browser click-through — opening each dialog and confirming it still works — is still worth doing manually before merging, since this was a non-interactive check.)
