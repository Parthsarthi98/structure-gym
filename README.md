# Case Compass Studio

Build "Structure Gym", a web app for practising case interview structuring (MBB / consulting style) and MECE thinking across industries. The user is an MBA student preparing for consulting recruitment. Use British spelling and plain, direct UI copy. Clean, focused design, desktop-first but usable on mobile.

## Core concepts the app teaches
- MECE: Mutually Exclusive (no overlap between branches) and Collectively Exhaustive (no gaps; together the branches cover the whole problem).
- Issue trees: a top-level question broken into 2 to 4 levels of branches.
- Frameworks: Profitability (revenue = price x volume; cost = fixed + variable), Market entry, M&A / acquisition, Pricing (cost-based, competitor-based, value-based), Growth / revenue growth, New product launch, Market sizing (top-down, bottom-up), Operations / cost reduction, Competitive response, Investment / PE due diligence, Turnaround, Customer segmentation. Each framework has a reference page with its standard branches, when to use it, common mistakes, and a worked example.

## Industries
Retail, FMCG / consumer goods, Banking & financial services, Insurance, Telecom, Airlines & travel, Healthcare & pharma, Technology / SaaS, E-commerce & D2C, Energy & utilities, Automotive & EV, Manufacturing, Media & entertainment, Hospitality, Education, Logistics, Public sector / social impact. Include India-specific cases alongside global ones.

## Four exercise modes
1. Build an issue tree: show a case prompt. User builds a tree in an interactive editor (add/rename/delete/nest nodes, up to 4 levels). On submit, AI grades it.
2. Spot the MECE flaw: show a pre-written breakdown containing one or more flaws (overlap, gap, mixed levels of abstraction, branches that aren't drivers of the question). User clicks the flawed node(s), picks the flaw type and writes a short fix. Grade deterministically against stored answer keys, with AI feedback on the written fix.
3. Pick the framework: show a case prompt, user selects the best-fit framework from options (or multiple, if a hybrid is correct), then writes 1 to 2 sentences on why and what they would tailor. Score the choice deterministically, AI grades the justification.
4. Timed structuring drill: case prompt with a countdown (default 2 minutes, choosable 90s / 2m / 3m). Tree editor locks at zero, then AI grades as in mode 1, plus a note on time used.

## AI grading (use Lovable AI)
Score each structure out of 10 on a rubric shown to the user: Mutually exclusive (0-2), Collectively exhaustive (0-2), Relevance to the actual question / hypothesis-driven (0-2), Tailoring to the industry and case rather than a generic textbook framework (0-2), Depth and logical levels consistent (0-2). Return: score per criterion, specific overlaps and gaps found (naming the nodes), a model answer tree, and 1 to 2 concrete fixes. Keep feedback plain and specific, no praise padding.

## Content
- Seed a bank of at least 60 case prompts spread across all industries, frameworks and three difficulty levels (Beginner, Intermediate, Advanced). Advanced cases should combine frameworks (e.g. market entry plus pricing, or profitability with a market-sizing sub-question) and include twists like regulatory constraints or a declining market.
- Seed at least 30 "Spot the MECE flaw" items with answer keys.
- Add a "Generate new case" button that uses AI to create a fresh prompt for a chosen industry, framework and difficulty.

## Accounts and progress tracking
- Email login (use the built-in auth and database).
- Store every attempt: mode, case, industry, framework, difficulty, rubric scores, time taken, user's tree, feedback.
- Dashboard: overall average score trend, score by rubric criterion (shows whether MECE or tailoring is the weak spot), heatmap of industry x framework performance, most common error types (overlap, gap, generic framework, wrong framework), streak.
- "Review my mistakes" mode: resurfaces cases the user scored below 6 on, prioritising the weakest criterion, until they score 7+.
- Recommended next drill on the dashboard, based on weakest industry, framework and criterion.

## Navigation
Home / Dashboard, Practice (choose mode, industry, framework, difficulty, or "Surprise me"), Framework Library, Review mistakes, History.

Start with the data model, auth, the framework library, the case bank and the "Build an issue tree" mode working end to end with AI grading, then add the other three modes and the dashboard.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://case-compass-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dea4e4ae-13ca-4dd9-9177-3b9c7a143e24).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
