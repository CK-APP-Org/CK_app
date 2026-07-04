# Task 1: Delete LoginPage.vue, the /login route, and the account Vuex module

**Commit:** `d43b6a1` — "refactor: delete LoginPage.vue, /login route, and account Vuex module"

## What changed, in plain language

We deleted the app's admin-login page entirely. Three things went away together, because they only existed to support each other:

1. **`CK_app/src/pages/LoginPage.vue`** — the actual login screen (username/password form).
2. **The `/login` route** in `CK_app/src/router/routes.js` — the URL that pointed at that screen. Without this, typing `/#/login` in the app just goes nowhere (which is what we want — the feature is gone, not hidden).
3. **`CK_app/src/store/modules/account.js`** — a Vuex "module" (a slice of the app's shared state) that stored the logged-in user's account name, email, and password in memory.

## Why this is safe to delete

This wasn't an active feature — it was a leftover admin backdoor. Before touching anything, we searched the entire codebase for every function this module exposed (`getUserAccount`, `setUserEmail`, `SET_USER_PASSWORD`, etc.) and confirmed the **only** files that referenced them were the four files this refactor touches: `LoginPage.vue`, `SettingsPage.vue`, `HomePage.vue`, and `account.js` itself. Nothing else in the app depends on it.

It's also part of a bigger, already-decided security cleanup: this login flow compared plaintext passwords against a single shared Firestore document that any client could read. That's a real security hole, and the fix here isn't to patch it — it's to remove the entire feature, because it's dead weight nobody uses.

## How the pieces fit together (for anyone new to this codebase)

Think of a Vuex "module" like a labeled drawer in a shared filing cabinet (`store/index.js` is the cabinet). Each drawer (`youbike`, `news`, `account`, etc.) holds its own data and the functions to read/change it. Deleting `account.js` and removing its two lines of registration in `store/index.js`:
```js
import accountModule from "./modules/account";   // <- removed: stop importing the drawer
...
const modules = {
  ...
  account: accountModule,                          // <- removed: stop putting it in the cabinet
  ...
};
```
is like removing a labeled drawer that nobody was opening anymore. The cabinet (the rest of the store) works exactly the same for every other drawer.

Similarly, `routes.js` is just a lookup table Vue Router uses to decide which component to show for a given URL. Removing the `/login` entry means that URL simply isn't in the table anymore — Vue Router falls through to its normal "not found" behavior.

## What was intentionally left alone (for now)

`SettingsPage.vue` and `HomePage.vue` still contain code that *calls into* the things we just deleted (e.g. a button that does `router.push("/login")`, or a computed value that reads `store.getters.getUserAccount`). That's expected and safe at this exact commit — those dangling references don't break the build (see below), and they're removed in Tasks 2 and 3 right after this one. This task's job was strictly "remove the three things", not "clean up every caller" — splitting it this way keeps each commit small and easy to review.

## Verification performed

- Deleted-file line counts matched exactly what was expected (324 lines for `LoginPage.vue`, 39 for `account.js`) — confirms we deleted the whole file, not a partial edit.
- Searched the codebase for any other file still referencing the deleted route or module — found none (the only hits were the string `goToLoginPage`, a *function name* in `SettingsPage.vue* that happens to contain the substring "LoginPage" — not an actual reference to the deleted file).
- Ran the project's linter (`yarn lint`) — it passed cleanly. This might be surprising: you'd expect deleting things other code depends on to cause errors. But a linter checks *syntax and style*, not "does this Vuex getter still exist" — that's a runtime concern, not something static analysis catches. So a clean lint here doesn't yet prove the app works end-to-end; it just confirms nothing here is syntactically broken. Full behavioral verification happens after Task 2 and 3 finish removing the dangling references.
