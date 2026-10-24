import type { FrameworkId } from "./taxonomy";

export type TreeNode = { id: string; label: string; children: TreeNode[] };

let n = 0;
const t = (label: string, children: TreeNode[] = []): TreeNode => ({ id: `fw${n++}`, label, children });

export type FrameworkRef = {
  id: FrameworkId;
  name: string;
  summary: string;
  whenToUse: string[];
  branches: TreeNode;
  mistakes: string[];
  example: { prompt: string; tree: TreeNode; note: string };
};

export const FRAMEWORKS: FrameworkRef[] = [
  {
    id: "profitability",
    name: "Profitability",
    summary: "Profit = Revenue − Cost. Revenue = Price × Volume. Cost = Fixed + Variable. Split until you find the driver that moved.",
    whenToUse: ["Profits are falling or below target", "Margins are compressing", "One unit or product line underperforms peers"],
    branches: t("Why have profits changed?", [
      t("Revenue", [t("Price per unit", [t("List price"), t("Discounts / mix")]), t("Volume", [t("Number of customers"), t("Units per customer")])]),
      t("Costs", [t("Fixed costs", [t("Rent, salaries, depreciation")]), t("Variable costs", [t("Materials, commissions, freight")])]),
    ]),
    mistakes: [
      "Stopping at 'revenue vs cost' without going to drivers",
      "Listing 'competition' as a branch: it's a cause acting on price or volume, not a driver itself",
      "Ignoring mix: total revenue can fall while every segment's price holds",
      "Not comparing against the market: is it us or the whole industry?",
    ],
    example: {
      prompt: "A mid-sized Indian quick-service restaurant chain has seen operating profit fall 25% over two years while revenue is flat.",
      tree: t("Why has profit fallen 25% with flat revenue?", [
        t("Revenue (flat, but check composition)", [t("Ticket size: price × items per order"), t("Orders: footfall vs delivery-app orders"), t("Store mix: new vs mature stores")]),
        t("Costs (likely driver)", [t("Variable: food cost, aggregator commission (20–30%), packaging"), t("Fixed: rent escalation, staff wages, new-store pre-opening")]),
      ]),
      note: "Flat revenue plus falling profit points to cost. The shift to delivery apps raises variable cost per order via commissions — a tailored hypothesis.",
    },
  },
  {
    id: "market-entry",
    name: "Market entry",
    summary: "Should we enter, and if so how? Assess market attractiveness, our ability to win, economics, and entry mode.",
    whenToUse: ["Entering a new country, segment or product category", "Deciding between build, buy or partner"],
    branches: t("Should the client enter market X?", [
      t("Market attractiveness", [t("Size and growth"), t("Profitability / margins"), t("Regulation and barriers")]),
      t("Competitive landscape", [t("Incumbents and share"), t("Likely response")]),
      t("Client's ability to win", [t("Capabilities and fit"), t("Differentiation")]),
      t("Economics and entry mode", [t("Investment and payback"), t("Build / buy / partner")]),
    ]),
    mistakes: ["Forgetting entry mode", "No go/no-go criterion (e.g. payback < 4 years)", "Treating the market as homogeneous — segment it"],
    example: {
      prompt: "A European discount grocer is considering entering India.",
      tree: t("Should the grocer enter India?", [
        t("Is Indian grocery attractive?", [t("Organised retail share and growth"), t("Margins vs kirana and quick commerce"), t("FDI rules for multi-brand retail")]),
        t("Can we win?", [t("Private-label sourcing locally"), t("Real-estate access in tier-1 cities")]),
        t("Economics and mode", [t("Capex per store, breakeven"), t("JV vs wholly-owned cash-and-carry")]),
      ]),
      note: "FDI restrictions on multi-brand retail shape the entry mode — the twist that makes it tailored.",
    },
  },
  {
    id: "ma",
    name: "M&A / acquisition",
    summary: "Should we buy the target? Strategic rationale, standalone value, synergies, price and risks.",
    whenToUse: ["Evaluating an acquisition or merger", "Assessing a target for strategic fit"],
    branches: t("Should the client acquire the target?", [
      t("Strategic rationale", [t("Fit with strategy"), t("Alternatives: build or partner")]),
      t("Target standalone value", [t("Market and position"), t("Financials and outlook")]),
      t("Synergies", [t("Revenue synergies"), t("Cost synergies")]),
      t("Price and risks", [t("Valuation vs price"), t("Integration, regulatory, cultural risk")]),
    ]),
    mistakes: ["Counting synergies twice (in value and in rationale)", "Ignoring integration cost", "No comparison with organic alternative"],
    example: {
      prompt: "A large Indian paints company wants to acquire a mid-sized waterproofing chemicals firm.",
      tree: t("Should it acquire the waterproofing firm?", [
        t("Rationale", [t("Adjacency: same dealers, same painters"), t("Build alternative: time to scale")]),
        t("Target value", [t("Waterproofing market growth"), t("Target margins, brand strength")]),
        t("Synergies", [t("Cross-sell via 50k+ dealers"), t("Shared logistics and procurement")]),
        t("Price and risks", [t("Multiple vs peers"), t("Founder retention, channel conflict")]),
      ]),
      note: "Shared dealer network is the core synergy hypothesis.",
    },
  },
  {
    id: "pricing",
    name: "Pricing",
    summary: "Set a price using three lenses: cost-based (floor), competitor-based (reference), value-based (ceiling).",
    whenToUse: ["Pricing a new product", "Re-pricing after cost change", "Responding to competitor price moves"],
    branches: t("What price should the client set?", [
      t("Cost-based (floor)", [t("Unit cost"), t("Target margin")]),
      t("Competitor-based (reference)", [t("Competitor prices"), t("Relative positioning")]),
      t("Value-based (ceiling)", [t("Customer willingness to pay"), t("Value vs next best alternative")]),
      t("Strategic considerations", [t("Objective: share vs margin"), t("Volume impact, cannibalisation")]),
    ]),
    mistakes: ["Only using cost-plus", "Forgetting price elasticity / volume", "Ignoring pricing model (subscription, tiered, usage)"],
    example: {
      prompt: "A pharma company is launching a novel diabetes drug in the US.",
      tree: t("How should the drug be priced?", [
        t("Floor: cost", [t("COGS is low; R&D recovery matters more")]),
        t("Reference: alternatives", [t("Existing GLP-1 prices"), t("Generic metformin")]),
        t("Ceiling: value", [t("Outcomes: HbA1c, weight, CV events"), t("Payer willingness, formulary placement")]),
        t("Strategy", [t("List vs net price after rebates"), t("Access programmes")]),
      ]),
      note: "Payer and rebate dynamics make pharma pricing distinct.",
    },
  },
  {
    id: "growth",
    name: "Growth / revenue growth",
    summary: "Grow revenue through existing customers, new customers, new products, or new markets (Ansoff), organically or inorganically.",
    whenToUse: ["Client wants to double revenue", "Growth has stalled"],
    branches: t("How can the client grow revenue?", [
      t("Existing products, existing customers", [t("Increase price"), t("Increase frequency / share of wallet")]),
      t("Existing products, new customers", [t("New segments"), t("New geographies / channels")]),
      t("New products", [t("Adjacent products for current customers")]),
      t("Inorganic", [t("Acquisitions"), t("Partnerships")]),
    ]),
    mistakes: ["Listing ideas without a structure", "No prioritisation by size and feasibility", "Missing retention / churn"],
    example: {
      prompt: "An Indian edtech firm selling test-prep wants to double revenue in three years.",
      tree: t("How to double revenue?", [
        t("Core test-prep", [t("Reduce churn after first exam attempt"), t("Upsell offline/hybrid centres")]),
        t("New learners", [t("Tier-2/3 cities in vernacular languages")]),
        t("New products", [t("Upskilling for working professionals")]),
        t("Inorganic", [t("Acquire regional coaching chains")]),
      ]),
      note: "Prioritise by revenue potential and time to impact.",
    },
  },
  {
    id: "product-launch",
    name: "New product launch",
    summary: "Should we launch, and how? Customer need, market, product fit, economics, go-to-market.",
    whenToUse: ["Launching a new product or service", "Evaluating a product idea"],
    branches: t("Should the client launch product X?", [
      t("Customer and market", [t("Need and target segment"), t("Market size and growth")]),
      t("Product and competition", [t("Differentiation"), t("Competitor offerings")]),
      t("Economics", [t("Price, unit cost, volume"), t("Investment and cannibalisation")]),
      t("Go-to-market", [t("Channels"), t("Launch plan and capabilities")]),
    ]),
    mistakes: ["Skipping cannibalisation", "No success criteria", "Go-to-market treated as an afterthought"],
    example: {
      prompt: "A dairy cooperative wants to launch a high-protein yoghurt.",
      tree: t("Should it launch?", [
        t("Demand", [t("Fitness-focused urban consumers"), t("Category growth")]),
        t("Competition", [t("D2C protein brands, imports")]),
        t("Economics", [t("Premium price vs cold-chain cost"), t("Cannibalising regular curd")]),
        t("GTM", [t("Modern trade and quick commerce first")]),
      ]),
      note: "Cold chain is the tailoring point.",
    },
  },
  {
    id: "market-sizing",
    name: "Market sizing",
    summary: "Estimate a market top-down (population → segments → penetration → spend) or bottom-up (units × usage × price). Sanity-check with the other method.",
    whenToUse: ["How big is the market for X?", "Sub-question inside entry or launch cases"],
    branches: t("How big is the market?", [
      t("Top-down", [t("Total population / households"), t("Share in target segment"), t("Penetration / adoption"), t("Spend per user per year")]),
      t("Bottom-up", [t("Number of outlets / supply units"), t("Throughput per unit"), t("Price per unit")]),
      t("Sanity check", [t("Compare methods, benchmarks")]),
    ]),
    mistakes: ["Not stating assumptions", "Mixing units (annual vs monthly)", "No sanity check"],
    example: {
      prompt: "Size the market for EV home chargers in India.",
      tree: t("Annual market for EV home chargers?", [
        t("EV sales per year (cars, 2-wheelers separately)"),
        t("Share of buyers with dedicated parking"),
        t("Share installing a charger vs portable cable"),
        t("Price per charger + installation"),
      ]),
      note: "Splitting 2-wheelers from cars matters: most 2W EVs charge from a normal socket.",
    },
  },
  {
    id: "operations",
    name: "Operations / cost reduction",
    summary: "Map the value chain or cost base, find the biggest buckets, then attack each via price, volume or efficiency.",
    whenToUse: ["Cut costs by X%", "Improve throughput or efficiency", "Process bottlenecks"],
    branches: t("How can the client reduce costs?", [
      t("Map cost base", [t("Largest cost buckets"), t("Benchmark vs peers")]),
      t("Direct costs", [t("Procurement: price paid"), t("Consumption: volume used, waste")]),
      t("Indirect costs", [t("Overheads, SG&A"), t("Footprint")]),
      t("Process and productivity", [t("Bottlenecks, automation"), t("Labour productivity")]),
    ]),
    mistakes: ["Cutting without mapping where cost sits", "Ignoring impact on quality/revenue", "No phasing (quick wins vs structural)"],
    example: {
      prompt: "A private hospital chain wants to cut operating costs 15% without hurting outcomes.",
      tree: t("How to cut opex 15%?", [
        t("Clinical staff (~40%)", [t("Rostering vs bed occupancy"), t("Nurse-to-bed ratios")]),
        t("Consumables and drugs (~25%)", [t("Group purchasing"), t("Formulary standardisation")]),
        t("Facilities and overheads", [t("Energy"), t("Shared back-office")]),
      ]),
      note: "Starting from the cost split focuses effort on the biggest buckets.",
    },
  },
  {
    id: "competitive-response",
    name: "Competitive response",
    summary: "A competitor has moved. Understand the move, its impact on us, our options, and pick a response.",
    whenToUse: ["New entrant", "Competitor price cut or product launch"],
    branches: t("How should the client respond?", [
      t("Understand the move", [t("What exactly changed"), t("Competitor's motive and staying power")]),
      t("Impact on client", [t("Customers at risk"), t("Revenue and margin impact")]),
      t("Response options", [t("Match / undercut"), t("Differentiate"), t("Do nothing / reposition")]),
      t("Evaluate and choose", [t("Cost and likely counter-response")]),
    ]),
    mistakes: ["Jumping straight to a price war", "Not quantifying the threat", "Ignoring which segments are actually at risk"],
    example: {
      prompt: "Jio-style free data offer from a new telecom entrant threatens an incumbent.",
      tree: t("How should the incumbent respond?", [
        t("The move", [t("Free voice + cheap data; deep pockets")]),
        t("Impact", [t("Prepaid data-heavy users churn first")]),
        t("Options", [t("Match on data price for at-risk segments"), t("Bundle content, retain postpaid")]),
      ]),
      note: "Segment the response rather than cut prices for everyone.",
    },
  },
  {
    id: "pe-dd",
    name: "Investment / PE due diligence",
    summary: "Should a fund invest? Market, company, management, financials/value-creation, and exit.",
    whenToUse: ["PE fund evaluating a target", "Commercial due diligence"],
    branches: t("Should the fund invest?", [
      t("Market", [t("Size, growth, cyclicality"), t("Structure and competition")]),
      t("Company", [t("Position and moat"), t("Customers and concentration")]),
      t("Financials and value creation", [t("Quality of earnings"), t("Levers: pricing, margin, M&A")]),
      t("Deal and exit", [t("Entry valuation, leverage"), t("Exit routes and multiple")]),
    ]),
    mistakes: ["Ignoring exit", "Not separating market from company", "No view on management"],
    example: {
      prompt: "A PE fund is evaluating a chain of diagnostic labs in India.",
      tree: t("Should the fund invest?", [
        t("Market", [t("Preventive testing growth"), t("Fragmented: consolidation play")]),
        t("Company", [t("B2C vs B2B mix"), t("Home-collection capability")]),
        t("Value creation", [t("Bolt-on acquisitions"), t("Test-menu expansion")]),
        t("Exit", [t("IPO comparables")]),
      ]),
      note: "Fragmentation makes buy-and-build the core thesis.",
    },
  },
  {
    id: "turnaround",
    name: "Turnaround",
    summary: "A business is in distress. Stabilise cash, diagnose root causes, then fix and rebuild.",
    whenToUse: ["Losses and cash crunch", "Declining sales in a structurally weak position"],
    branches: t("How to turn the business around?", [
      t("Stabilise", [t("Cash runway, working capital"), t("Stop the bleeding")]),
      t("Diagnose", [t("Market vs company-specific decline"), t("Which units destroy value")]),
      t("Fix", [t("Cost restructuring"), t("Portfolio: exit, keep, grow")]),
      t("Rebuild", [t("Growth plan"), t("Capability and leadership")]),
    ]),
    mistakes: ["Skipping cash", "Treating symptoms not causes", "Trying to fix everything at once"],
    example: {
      prompt: "A legacy department store chain has had 3 years of losses.",
      tree: t("How to turn it around?", [
        t("Stabilise", [t("Liquidate slow inventory, renegotiate leases")]),
        t("Diagnose", [t("Footfall loss to e-commerce vs store-specific")]),
        t("Fix", [t("Close bottom 20% stores"), t("Concessions model")]),
      ]),
      note: "Cash first, then structure.",
    },
  },
  {
    id: "segmentation",
    name: "Customer segmentation",
    summary: "Split customers into groups with distinct needs and economics, then choose which to target and how.",
    whenToUse: ["Who should we target?", "Personalising offers", "Prioritising marketing spend"],
    branches: t("How should the client segment and target customers?", [
      t("Segmentation bases", [t("Demographic / firmographic"), t("Needs and behaviour"), t("Value / profitability")]),
      t("Segment attractiveness", [t("Size and growth"), t("Margin and cost to serve")]),
      t("Fit and access", [t("Our ability to serve"), t("Channel reach")]),
      t("Targeting and proposition", [t("Priority segments"), t("Tailored offer")]),
    ]),
    mistakes: ["Segments that overlap (age and income mixed as one cut)", "Not linking segments to economics", "Too many segments"],
    example: {
      prompt: "A private bank wants to segment its retail customers to improve cross-sell.",
      tree: t("How to segment for cross-sell?", [
        t("By life stage", [t("Young salaried"), t("Families"), t("Retired")]),
        t("Within each: by balance tier"),
        t("Attractiveness: product holding gap × margin"),
      ]),
      note: "Use one cut at each level so segments don't overlap.",
    },
  },
];

export const getFramework = (id: string) => FRAMEWORKS.find((f) => f.id === id);
