export const INDUSTRIES = [
  { id: "retail", name: "Retail" },
  { id: "fmcg", name: "FMCG / consumer goods" },
  { id: "banking", name: "Banking & financial services" },
  { id: "insurance", name: "Insurance" },
  { id: "telecom", name: "Telecom" },
  { id: "airlines", name: "Airlines & travel" },
  { id: "healthcare", name: "Healthcare & pharma" },
  { id: "tech", name: "Technology / SaaS" },
  { id: "ecommerce", name: "E-commerce & D2C" },
  { id: "energy", name: "Energy & utilities" },
  { id: "auto", name: "Automotive & EV" },
  { id: "manufacturing", name: "Manufacturing" },
  { id: "media", name: "Media & entertainment" },
  { id: "hospitality", name: "Hospitality" },
  { id: "education", name: "Education" },
  { id: "logistics", name: "Logistics" },
  { id: "public", name: "Public sector / social impact" },
] as const;

export type IndustryId = (typeof INDUSTRIES)[number]["id"];

export const FRAMEWORK_LIST = [
  { id: "profitability", name: "Profitability" },
  { id: "market-entry", name: "Market entry" },
  { id: "ma", name: "M&A / acquisition" },
  { id: "pricing", name: "Pricing" },
  { id: "growth", name: "Growth / revenue growth" },
  { id: "product-launch", name: "New product launch" },
  { id: "market-sizing", name: "Market sizing" },
  { id: "operations", name: "Operations / cost reduction" },
  { id: "competitive-response", name: "Competitive response" },
  { id: "pe-dd", name: "Investment / PE due diligence" },
  { id: "turnaround", name: "Turnaround" },
  { id: "segmentation", name: "Customer segmentation" },
] as const;

export type FrameworkId = (typeof FRAMEWORK_LIST)[number]["id"];

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const MODES = [
  { id: "build", name: "Build an issue tree", short: "Build" },
  { id: "flaw", name: "Spot the MECE flaw", short: "Spot the flaw" },
  { id: "framework", name: "Pick the framework", short: "Pick framework" },
] as const;
export type ModeId = (typeof MODES)[number]["id"];

export const RUBRIC = [
  { key: "mutuallyExclusive", name: "Mutually exclusive", hint: "No overlap between branches" },
  { key: "collectivelyExhaustive", name: "Collectively exhaustive", hint: "No gaps; branches cover the whole problem" },
  { key: "relevance", name: "Relevance", hint: "Answers the actual question; hypothesis-driven" },
  { key: "tailoring", name: "Tailoring", hint: "Specific to the industry and case, not a textbook template" },
  { key: "depth", name: "Depth & levels", hint: "Logical levels consistent; enough depth" },
] as const;
export type RubricKey = (typeof RUBRIC)[number]["key"];
export type RubricScores = Record<RubricKey, number>;

export const ERROR_TYPES = {
  overlap: "Overlap",
  gap: "Gap",
  "mixed-levels": "Mixed levels",
  "not-a-driver": "Not a driver",
  generic: "Generic framework",
  "wrong-framework": "Wrong framework",
} as const;
export type ErrorType = keyof typeof ERROR_TYPES;

export const industryName = (id: string) => INDUSTRIES.find((i) => i.id === id)?.name ?? id;
export const frameworkName = (id: string) => FRAMEWORK_LIST.find((f) => f.id === id)?.name ?? id;
export const modeName = (id: string) => id === "chain" ? "Value chain drill" : MODES.find((m) => m.id === (id === "timed" ? "build" : id))?.name ?? id;
