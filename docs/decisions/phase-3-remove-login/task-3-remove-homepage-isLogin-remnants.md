# Task 3: Remove dead isLogin/admins remnants from HomePage.vue

**Commit:** `30fe4a3` — "refactor: remove dead isLogin/admins remnants from HomePage.vue"

## What changed, in plain language

`HomePage.vue` is the app's main screen (the icon grid you see after opening the app). It had a small, quiet leftover from the same dead admin-login feature Tasks 1-2 removed: an `admins` list (one extra icon: "管理資訊" / "Admin Info", linking to `/adminpost`) and an `isLogin` check meant to decide whether to show it.

We deleted four things:
1. The `admins` array itself.
2. A block of `<template>` markup that would have rendered the admin icon — but it was already wrapped in an HTML comment (`<!-- ... -->`), so it was never actually shown to any user, ever.
3. The `isLogin` computed value that the (already-dead) template block checked.
4. A second, separate dead spot: a whole block of *commented-out* imports (`useStore`, Firestore functions, `useQuasar`, `useRouter`) left over from some earlier version of this file that doesn't exist anymore in the live code.

## Why this is safe — "already commented out" is the key detail

Unlike Tasks 1-2 (which removed *live, reachable* code), everything in this task was already inert before we touched it. In Vue/JavaScript, text wrapped in `<!-- -->` (template) or `/* */` (script) is never executed — it's just text sitting in the file. So this task didn't change what users see or how the app behaves at all; it just deleted paragraphs of code that were already switched off, cleaning up clutter for anyone reading the file later.

The one behavior-relevant deletion is `isLogin` itself — but since its only caller was inside that same commented-out block, deleting it doesn't change anything either. We confirmed this by searching the whole file for every place `isLogin` was used before deleting it, and the only place was that dead block.

## The bonus find: a dead comment block containing the word "firebase"

While double-checking this task's scope, we found something the original plan draft missed: a second, separate commented-out import block at the top of the `<script>` section:
```js
/*import { useStore } from "vuex";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";*/
```
This mattered for a specific reason: Task 4 (next) removes the `firebase` npm package entirely, and its safety check is "make sure nothing in the codebase still writes `from "firebase/..."` anywhere" — using a simple text search (`grep`). A text search doesn't know the difference between a real import and one sitting inside a comment; it would have found this block and made Task 4's safety check report a false alarm. Removing this dead comment here, in the same task that's already cleaning up unused leftovers in this file, avoids that. We updated the phase's plan document itself to add this as an explicit step, rather than silently working around it, so the plan stays an accurate record of what was done and why.

## Verification performed

- Grepped for `isLogin` and `admins` in the file — zero matches (both fully gone).
- Grepped for the word `firebase` in the file — zero matches (confirms the dead comment block is gone too, and Task 4's later check will get a clean result).
- `yarn lint` — clean, no errors.
- Started the dev server, confirmed no compile errors, and confirmed the app's root page (`/`, where `HomePage.vue` renders) responds with HTTP 200.
