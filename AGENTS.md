<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- The reviewed exercise bank (cases, flaw drills, quick checks, value chains, chain drills) is verbatim JSON in `src/data/bank/<industry>.json`, typed and flattened in `src/data/bank/index.ts`; never edit the JSON by hand. Framework reference, lessons and glossary stay as TypeScript in `src/data/`. Why: content is reviewed externally, versioned with code and needs no seeding.
- AI calls go through `src/lib/ai.server.ts` (streamed Responses API, strict JSON schema) and are exposed via public (no sign-in) server functions in `src/lib/grading.functions.ts` with an input-size cap. Why: the app must work without an account while keeping the key server-side.
- Scoring/review rules (flaw scoring, review queue, streak) are pure functions in `src/data/flaws.ts` and `src/lib/stats.ts`, covered by `src/lib/stats.test.ts`. Why: deterministic rules must stay testable.
- All trees render through `src/components/TreeDiagram.tsx` using the `DNode` type from `src/data/types.ts` (`status` drives overlap/gap/mixed/good styling). Why: one consistent visual language for trees.
- The app works signed out: attempts, lesson progress and generated cases live in browser storage (`src/lib/local-store.ts`); when signed in they use the database, and `syncLocalToAccount` moves browser data into the account on first sign-in. No route is auth-gated; pages reading this data use `ssr: false`. Why: sign-in is an optional sync across devices.
- Legacy timed drill URLs redirect to self-paced build drills; retain historical timing fields for old attempts, and clear legacy interview-date browser storage on app mount. Why: removed timing features must not return through old links or saved preferences.
- Visual language is a print magazine: tokens in `src/styles.css` (paper/ink/red + retro palette), square corners and no shadows enforced globally, page openers via `Opener` in `AppHeader.tsx`. Why: one consistent editorial look.
- Every exercise exposes a full answer; case model answers come from `CaseItem.answer` (generated cases, stored in `generated_cases.answer`) or the `revealAnswer` server function. Why: beginners must always be able to see a worked answer.
