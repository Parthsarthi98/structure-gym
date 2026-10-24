import type { Lesson } from "./types";

/** Beginner lessons; all case figures are illustrative. Quiz answers are zero-based. */
export const LESSONS: Lesson[] = [
  {
    "id": "l1",
    "number": 1,
    "title": "What a case interview is",
    "summary": "Learn the interview flow, what is assessed and how to turn analysis into a recommendation.",
    "minutes": 18,
    "sections": [
      {
        "kind": "text",
        "heading": "A business problem, solved aloud",
        "body": "A case interview is a conversation about a business decision. You receive an incomplete problem, ask focused questions, organise possible explanations, request evidence and recommend an action. You are not expected to know every industry. You are expected to make your reasoning visible. The figures in these lessons are illustrative, not market estimates."
      },
      {
        "kind": "timeline",
        "heading": "A typical 25–35 minute case",
        "steps": [
          {
            "title": "Clarify",
            "time": "2–3 minutes",
            "body": "Confirm the objective, success measure, scope and period. Repeat the question in your own words; ask only questions that affect your approach."
          },
          {
            "title": "Structure",
            "time": "2–4 minutes",
            "body": "Ask for a brief pause. Draw a tailored issue tree, explain its logic and suggest where to start."
          },
          {
            "title": "Analyse",
            "time": "15–22 minutes",
            "body": "Test the most useful branches with data. Explain calculations, units and assumptions; translate each finding into an implication."
          },
          {
            "title": "Synthesise",
            "time": "2–3 minutes",
            "body": "Answer the original question first. Give two supporting findings, a material risk and a practical next step. Timing varies by firm and format."
          }
        ]
      },
      {
        "kind": "text",
        "heading": "What interviewers assess",
        "body": "Look for five habits: a clear objective; a logical, tailored structure; accurate quantitative reasoning; sensible interpretation of evidence; and concise, collaborative communication. Commercial judgement means noticing what a number implies for customers and operations, not just calculating it. In interviewer-led cases, follow the question while keeping the overall objective in view."
      },
      {
        "kind": "example",
        "title": "Café profit decline",
        "prompt": "A café’s monthly profit fell from £10,000 to £6,000. What would you investigate?",
        "tree": {
          "label": "Profit decline",
          "children": [
            {
              "label": "Revenue",
              "children": [
                {
                  "label": "Transactions"
                },
                {
                  "label": "Average spend"
                }
              ]
            },
            {
              "label": "Cost",
              "children": [
                {
                  "label": "Ingredients"
                },
                {
                  "label": "Staff and rent"
                }
              ]
            }
          ]
        },
        "note": "Clarify the comparison period and whether opening hours changed. Suppose revenue stayed at £40,000 while costs rose from £30,000 to £34,000. The £4,000 cost increase explains the profit decline. Ask for cost categories before proposing a price rise; the tree is a starting point, not a finding."
      },
      {
        "kind": "example",
        "title": "A delivery decision",
        "prompt": "A shop can add delivery. Should it launch?",
        "tree": {
          "label": "Launch delivery?",
          "children": [
            {
              "label": "Economics",
              "children": [
                {
                  "label": "Orders × contribution"
                },
                {
                  "label": "Set-up cost"
                }
              ]
            },
            {
              "label": "Feasibility",
              "children": [
                {
                  "label": "Delivery capacity"
                },
                {
                  "label": "Customer experience"
                }
              ]
            }
          ]
        },
        "note": "Clarify the required return and launch period. At 1,000 orders a month, £4 contribution per order and £2,000 additional monthly fixed cost, operating profit rises £2,000 before set-up costs. A £6,000 set-up cost has a simple three-month payback if volumes hold. Recommend a pilot, subject to demand evidence and delivery quality."
      },
      {
        "kind": "tip",
        "body": "When given a number, say what you will use it to test before calculating."
      },
      {
        "kind": "tip",
        "body": "If you get stuck, summarise what is known, what remains uncertain and the next useful question."
      }
    ],
    "quiz": [
      {
        "q": "What should you do first?",
        "options": [
          "List every framework you know",
          "Confirm the objective and scope",
          "Calculate market size",
          "Recommend a cost cut"
        ],
        "answer": 1,
        "explanation": "A structure only helps if it answers the right question.",
        "wrongWhy": ["Listing frameworks does not establish which problem the client needs solved.", "", "Market sizing may be irrelevant until the objective and scope are clear.", "Recommending a cost cut assumes a solution before the problem is understood."]
      },
      {
        "q": "Revenue is unchanged and profit fell £4,000. What follows?",
        "options": [
          "Prices fell",
          "Demand fell",
          "Total cost rose £4,000",
          "Rent must have risen"
        ],
        "answer": 2,
        "explanation": "Profit equals revenue minus cost. The total cost increase is known; its category is not.",
        "wrongWhy": ["Unchanged revenue does not establish whether prices fell because sales volume could have offset a price change.", "Unchanged revenue does not establish whether demand fell because prices could have offset a volume change.", "", "The profit change identifies a total cost increase, not which cost category increased."]
      },
      {
        "q": "Which closing statement is strongest?",
        "options": [
          "There are many factors",
          "I would need more data before saying anything",
          "Here are all my calculations",
          "Pilot delivery: projected profit is positive, but validate demand and service quality"
        ],
        "answer": 3,
        "explanation": "A useful synthesis answers the question, supports the answer and names a risk and next step.",
        "wrongWhy": ["Saying there are many factors gives neither a recommendation nor supporting evidence.", "Refusing to offer any view misses the opportunity to make a qualified recommendation from the available evidence.", "Listing calculations does not synthesise them into a recommendation.", ""]
      }
    ]
  },
  {
    "id": "l2",
    "number": 2,
    "title": "MECE explained visually",
    "summary": "Spot overlaps and missing categories, and learn when arithmetic is a driver split rather than a partition.",
    "minutes": 24,
    "sections": [
      {
        "kind": "text",
        "heading": "Two separate tests",
        "body": "MECE means mutually exclusive and collectively exhaustive. Mutually exclusive (ME): an item belongs to only one sibling category. Collectively exhaustive (CE): the categories cover the entire defined scope. State the population, unit and period first. A set of useful questions is not automatically a strict partition."
      },
      {
        "kind": "venn",
        "heading": "Overlap: not mutually exclusive",
        "a": "Students",
        "b": "Women",
        "overlap": "Women who study",
        "caption": "Counting student customers and women customers separately counts some people twice."
      },
      {
        "kind": "venn",
        "heading": "Another overlap",
        "a": "Online orders",
        "b": "Repeat orders",
        "overlap": "Repeat online orders",
        "caption": "Channel and purchase history are different dimensions. Pick one dimension at a time."
      },
      {
        "kind": "pie",
        "heading": "Missing people: not collectively exhaustive",
        "slices": [
          "Under 18",
          "18–34",
          "35–54"
        ],
        "missing": "55+",
        "caption": "These age bands do not cover older customers. Unknown ages also need an explicit treatment."
      },
      {
        "kind": "pie",
        "heading": "Missing expenditure",
        "slices": [
          "Rent",
          "Food"
        ],
        "missing": "All other spending",
        "caption": "Rent and food may not overlap, but they do not account for the full household budget."
      },
      {
        "kind": "compare",
        "heading": "Customers",
        "bad": {
          "title": "Students / professionals / women",
          "tree": {
            "label": "Customers",
            "children": [
              {
                "label": "Students"
              },
              {
                "label": "Professionals"
              },
              {
                "label": "Women"
              }
            ]
          }
        },
        "good": {
          "title": "Age bands",
          "tree": {
            "label": "Customers",
            "children": [
              {
                "label": "Under 18"
              },
              {
                "label": "18–34"
              },
              {
                "label": "35–54"
              },
              {
                "label": "55+"
              }
            ]
          }
        },
        "why": "A woman may also be a student or professional. For customers with known ages, non-overlapping age bands cover everyone; add an unknown-age bucket if records are incomplete."
      },
      {
        "kind": "compare",
        "heading": "Revenue",
        "bad": {
          "title": "Online sales / repeat customers",
          "tree": {
            "label": "Revenue",
            "children": [
              {
                "label": "Online sales"
              },
              {
                "label": "Repeat customers"
              }
            ]
          }
        },
        "good": {
          "title": "Price × volume",
          "tree": {
            "label": "Revenue",
            "children": [
              {
                "label": "Average realised price"
              },
              {
                "label": "Units sold"
              }
            ]
          }
        },
        "why": "A repeat customer can buy online, so adding those revenues double-counts. For one product, revenue equals realised price times units. This is a multiplicative driver split, not additive categories; for multiple products, sum price × units by product."
      },
      {
        "kind": "compare",
        "heading": "Household spend",
        "bad": {
          "title": "Food / groceries / rent",
          "tree": {
            "label": "Household spend",
            "children": [
              {
                "label": "Food"
              },
              {
                "label": "Groceries"
              },
              {
                "label": "Rent"
              }
            ]
          }
        },
        "good": {
          "title": "One category per payment",
          "tree": {
            "label": "Household spend",
            "children": [
              {
                "label": "Housing"
              },
              {
                "label": "Food and drink"
              },
              {
                "label": "Other spending"
              }
            ]
          }
        },
        "why": "Food and groceries overlap and the first list omits other spending. Define food and drink to include all groceries and eating out; housing excludes those purchases. Other spending closes the total and should be expanded if large."
      },
      {
        "kind": "compare",
        "heading": "Wardrobe",
        "bad": {
          "title": "Work clothes / blue clothes",
          "tree": {
            "label": "Wardrobe",
            "children": [
              {
                "label": "Work clothes"
              },
              {
                "label": "Blue clothes"
              }
            ]
          }
        },
        "good": {
          "title": "By garment type",
          "tree": {
            "label": "Wardrobe",
            "children": [
              {
                "label": "Tops"
              },
              {
                "label": "Bottoms"
              },
              {
                "label": "One-piece garments"
              },
              {
                "label": "Other items"
              }
            ]
          }
        },
        "why": "A blue work shirt belongs to both bad branches. Assign each item to one garment type using explicit rules; other items include footwear and accessories. Classify physical items, not possible outfit combinations."
      },
      {
        "kind": "compare",
        "heading": "Airline operating costs",
        "bad": {
          "title": "Fuel / international flights",
          "tree": {
            "label": "Airline operating costs",
            "children": [
              {
                "label": "Fuel"
              },
              {
                "label": "International flights"
              }
            ]
          }
        },
        "good": {
          "title": "By expense category",
          "tree": {
            "label": "Airline operating costs",
            "children": [
              {
                "label": "Fuel"
              },
              {
                "label": "Staff"
              },
              {
                "label": "Other operating costs"
              }
            ]
          }
        },
        "why": "International flights also consume fuel. Use mutually exclusive accounting categories for a defined period. Other operating costs include leases, maintenance and airport fees; split this bucket further when material."
      },
      {
        "kind": "compare",
        "heading": "Hospital admissions",
        "bad": {
          "title": "Children / emergencies",
          "tree": {
            "label": "Hospital admissions",
            "children": [
              {
                "label": "Children"
              },
              {
                "label": "Emergencies"
              }
            ]
          }
        },
        "good": {
          "title": "By admission route",
          "tree": {
            "label": "Hospital admissions",
            "children": [
              {
                "label": "Emergency"
              },
              {
                "label": "Planned"
              },
              {
                "label": "Other or unrecorded"
              }
            ]
          }
        },
        "why": "A child can be an emergency admission. Classify each admission, not each person, by its recorded route. A patient admitted twice generates two admissions; other or unrecorded closes the dataset."
      },
      {
        "kind": "example",
        "title": "Audit a customer split",
        "prompt": "A gym divides members into under-30s and premium members. Is it MECE?",
        "tree": {
          "label": "Members",
          "children": [
            {
              "label": "Under 30",
              "children": [
                {
                  "label": "Premium"
                },
                {
                  "label": "Standard"
                }
              ]
            },
            {
              "label": "30+",
              "children": [
                {
                  "label": "Premium"
                },
                {
                  "label": "Standard"
                }
              ]
            }
          ]
        },
        "note": "It was not: a premium member could be under 30, and older standard members were absent. Split by age first, then membership tier within each age group. Assume these are the only tiers and ages are known."
      },
      {
        "kind": "example",
        "title": "Choose a revenue decomposition",
        "prompt": "A shop wants to explain monthly sales revenue.",
        "tree": {
          "label": "Revenue",
          "children": [
            {
              "label": "Product A",
              "children": [
                {
                  "label": "Units"
                },
                {
                  "label": "Realised price"
                }
              ]
            },
            {
              "label": "All other products",
              "children": [
                {
                  "label": "Units"
                },
                {
                  "label": "Weighted average price"
                }
              ]
            }
          ]
        },
        "note": "Add revenue across the two product groups; within each group multiply units by realised price. Keep discounts in realised price consistently. Do not add price to volume or confuse a mathematical decomposition with a customer partition."
      },
      {
        "kind": "tip",
        "body": "Test overlap with one concrete item: could it fit two sibling branches?"
      },
      {
        "kind": "tip",
        "body": "Test completeness by looking for an item that fits none. A small “other” category is acceptable; an unexplained large one needs work."
      }
    ],
    "quiz": [
      {
        "q": "Which split is mutually exclusive for known ages?",
        "options": [
          "Students / women",
          "Online / loyal",
          "Under 18 / 18–34 / 35+",
          "Premium / young"
        ],
        "answer": 2,
        "explanation": "Each age fits exactly one band; the bands cover all known ages.",
        "wrongWhy": ["A student can also be a woman, so these groups overlap.", "An online customer can also be loyal, so these groups overlap.", "", "A premium customer can also be young, so these groups overlap."]
      },
      {
        "q": "Rent and food cover only 60% of household spend. What is wrong?",
        "options": [
          "The split is not exhaustive",
          "The split must overlap",
          "The arithmetic must be wrong",
          "Nothing is missing"
        ],
        "answer": 0,
        "explanation": "Other spending is outside the two branches, so the scope is not covered.",
        "wrongWhy": ["", "Covering only 60% demonstrates a gap, not necessarily an overlap.", "A partial set of spending categories can correctly total 60% without an arithmetic error.", "The remaining 40% of household spend is missing from the split."]
      },
      {
        "q": "How do price and units explain revenue?",
        "options": [
          "Add them",
          "Multiply them for a single product",
          "Count them as customer groups",
          "Subtract units from price"
        ],
        "answer": 1,
        "explanation": "Revenue equals realised price multiplied by units; across products, sum the product-level revenues.",
        "wrongWhy": ["Adding price and units combines incompatible quantities and does not calculate revenue.", "", "Price and units are revenue drivers, not groups of customers.", "Subtracting units from price combines incompatible quantities and does not calculate revenue."]
      }
    ]
  },
  {
    "id": "l3",
    "number": 3,
    "title": "Ways to split MECE",
    "summary": "Choose mathematical, process, stakeholder, segment, boundary, time and opposite-pair splits with clear limits.",
    "minutes": 26,
    "sections": [
      {
        "kind": "text",
        "heading": "Maths split",
        "body": "Use an identity when the outcome is numerical. Profit = revenue − cost; revenue = realised price × units. Signs and operations matter: these are causal or accounting drivers, not necessarily additive categories."
      },
      {
        "kind": "tree",
        "heading": "Maths split example",
        "caption": "For a bakery, 1,000 loaves × £3 minus £2,200 total cost gives £800 profit. Hold the period constant and avoid counting variable costs again as fixed costs.",
        "tree": {
          "label": "Profit",
          "children": [
            {
              "label": "Revenue",
              "children": [
                {
                  "label": "Realised price"
                },
                {
                  "label": "Units"
                }
              ]
            },
            {
              "label": "Cost",
              "children": [
                {
                  "label": "Fixed cost"
                },
                {
                  "label": "Variable cost"
                }
              ]
            }
          ]
        }
      },
      {
        "kind": "text",
        "heading": "Process or value chain",
        "body": "Follow the steps that produce an outcome. Define hand-offs so an activity or cost has one home."
      },
      {
        "kind": "tree",
        "heading": "Process or value chain example",
        "caption": "For late parcels, compare the delay accumulated in each stage. Define local sorting as last mile and origin handling as first mile; do not count one delay twice.",
        "tree": {
          "label": "Parcel delivery",
          "children": [
            {
              "label": "First mile",
              "children": [
                {
                  "label": "Collection"
                },
                {
                  "label": "Origin handling"
                }
              ]
            },
            {
              "label": "Line haul",
              "children": [
                {
                  "label": "Hub-to-hub transport"
                }
              ]
            },
            {
              "label": "Last mile",
              "children": [
                {
                  "label": "Local sorting"
                },
                {
                  "label": "Doorstep delivery"
                }
              ]
            }
          ]
        }
      },
      {
        "kind": "text",
        "heading": "Stakeholder",
        "body": "Ask whose behaviour, incentives or constraints matter. Stakeholder lenses are useful coverage checks, but can overlap as explanations: a competitor can influence a customer."
      },
      {
        "kind": "tree",
        "heading": "Stakeholder example",
        "caption": "For a taxi launch, test rider demand, the entrant’s fleet economics, incumbent pricing and licensing. State that these are lenses, not four additive sources of profit.",
        "tree": {
          "label": "Market entry",
          "children": [
            {
              "label": "Customer",
              "children": [
                {
                  "label": "Needs and willingness to pay"
                }
              ]
            },
            {
              "label": "Company",
              "children": [
                {
                  "label": "Capabilities and economics"
                }
              ]
            },
            {
              "label": "Competitor",
              "children": [
                {
                  "label": "Likely response"
                }
              ]
            },
            {
              "label": "Regulator",
              "children": [
                {
                  "label": "Permissions and restrictions"
                }
              ]
            }
          ]
        }
      },
      {
        "kind": "text",
        "heading": "Segment",
        "body": "Divide the population using one attribute at each level: geography, product or customer type. Make boundaries explicit."
      },
      {
        "kind": "tree",
        "heading": "Segment example",
        "caption": "For a software company, locate the revenue decline geographically, then by customer type. Assign each customer a single billing geography and type.",
        "tree": {
          "label": "Sales by geography",
          "children": [
            {
              "label": "India",
              "children": [
                {
                  "label": "Consumer"
                },
                {
                  "label": "Business"
                }
              ]
            },
            {
              "label": "Rest of world",
              "children": [
                {
                  "label": "Consumer"
                },
                {
                  "label": "Business"
                }
              ]
            }
          ]
        }
      },
      {
        "kind": "text",
        "heading": "Internal versus external",
        "body": "Separate factors the organisation controls directly from conditions outside it. Define borderline cases rather than pretending the boundary is universal."
      },
      {
        "kind": "tree",
        "heading": "Internal versus external example",
        "caption": "For a retailer, poor shelf availability is internal; a new rival is external. A supplier disruption is an external trigger, while weak contingency planning is an internal response. Avoid adding both as independent effects without evidence.",
        "tree": {
          "label": "Sales decline",
          "children": [
            {
              "label": "Internal",
              "children": [
                {
                  "label": "Availability"
                },
                {
                  "label": "Sales execution"
                }
              ]
            },
            {
              "label": "External",
              "children": [
                {
                  "label": "Market demand"
                },
                {
                  "label": "Competitive pressure"
                }
              ]
            }
          ]
        }
      },
      {
        "kind": "text",
        "heading": "Short term versus long term",
        "body": "Use explicit, non-overlapping time horizons. Distinguish actions now from investments that take longer; account for ongoing effects separately."
      },
      {
        "kind": "tree",
        "heading": "Short term versus long term example",
        "caption": "A factory can change shifts immediately but cannot install a new line next week. Classify actions by earliest feasible implementation; evaluate their future benefits without double-counting.",
        "tree": {
          "label": "Capacity actions",
          "children": [
            {
              "label": "Next 0–3 months",
              "children": [
                {
                  "label": "Reschedule shifts"
                },
                {
                  "label": "Use spare equipment"
                }
              ]
            },
            {
              "label": "After month 3",
              "children": [
                {
                  "label": "Add production line"
                },
                {
                  "label": "Train new specialists"
                }
              ]
            }
          ]
        }
      },
      {
        "kind": "text",
        "heading": "Opposite pairs",
        "body": "A complementary pair can organise a problem when both sides are defined. Supply versus demand helps diagnose constraints, but the two interact and are not additive quantities."
      },
      {
        "kind": "tree",
        "heading": "Opposite pairs example",
        "caption": "If requests rise while available driver hours stay flat, waits may increase. Compare demand and supply by location and time; a city-wide average can hide local shortages.",
        "tree": {
          "label": "Ride-hailing waits",
          "children": [
            {
              "label": "Supply",
              "children": [
                {
                  "label": "Available driver hours"
                },
                {
                  "label": "Driver location"
                }
              ]
            },
            {
              "label": "Demand",
              "children": [
                {
                  "label": "Ride requests"
                },
                {
                  "label": "Request location"
                }
              ]
            }
          ]
        }
      },
      {
        "kind": "example",
        "title": "Pick a split for falling parcel margin",
        "prompt": "A parcel company’s margin per parcel is falling. Where would you start?",
        "tree": {
          "label": "Margin per parcel",
          "children": [
            {
              "label": "Revenue per parcel",
              "children": [
                {
                  "label": "Price"
                },
                {
                  "label": "Service mix"
                }
              ]
            },
            {
              "label": "Cost per parcel",
              "children": [
                {
                  "label": "First mile"
                },
                {
                  "label": "Line haul"
                },
                {
                  "label": "Last mile"
                }
              ]
            }
          ]
        },
        "note": "Start with maths to distinguish revenue from cost, then process to locate a cost change. A tree can use different split types at different levels; each sibling set needs its own consistent logic."
      },
      {
        "kind": "example",
        "title": "Pick a split for a queue",
        "prompt": "A clinic’s waiting time has risen.",
        "tree": {
          "label": "Waiting time",
          "children": [
            {
              "label": "Demand",
              "children": [
                {
                  "label": "Arrivals by hour"
                }
              ]
            },
            {
              "label": "Effective capacity",
              "children": [
                {
                  "label": "Staffed hours"
                },
                {
                  "label": "Patients per staffed hour"
                }
              ]
            }
          ]
        },
        "note": "Supply and demand is more useful here than a memorised revenue tree. Compare arrivals with capacity in matching time intervals. Only after locating the bottleneck should you map the patient process."
      },
      {
        "kind": "tip",
        "body": "Choose the first split because it helps answer the client’s question, not because it is familiar."
      },
      {
        "kind": "tip",
        "body": "Label the operation: add categories, multiply drivers, subtract costs, or compare supply with demand."
      }
    ],
    "quiz": [
      {
        "q": "Which split best locates a parcel delay?",
        "options": [
          "Price and units",
          "First mile / line haul / last mile",
          "Customer age",
          "Profit and revenue"
        ],
        "answer": 1,
        "explanation": "Process stages locate where delay accumulates if hand-offs are defined.",
        "wrongWhy": ["Price and units explain revenue rather than where a parcel is delayed.", "", "Customer age does not identify the process stage causing a parcel delay.", "Profit and revenue are financial measures rather than stages of parcel delivery."]
      },
      {
        "q": "What makes a time split usable?",
        "options": [
          "Calling it now and later",
          "Using overlapping years",
          "Leaving a month unassigned",
          "Defining explicit non-overlapping horizons"
        ],
        "answer": 3,
        "explanation": "Boundaries prevent actions being counted in both horizons or in neither.",
        "wrongWhy": ["The labels now and later leave the boundary between periods undefined.", "Overlapping years can count the same action in more than one period.", "An unassigned month leaves a gap in the time covered.", ""]
      },
      {
        "q": "Are stakeholder lenses always a strict MECE partition?",
        "options": [
          "No; stakeholders can influence one another",
          "Yes; always add their effects",
          "Only with four branches",
          "Only in retail"
        ],
        "answer": 0,
        "explanation": "They help coverage, but effects can overlap. Explain the lens and avoid double-counting.",
        "wrongWhy": ["", "Stakeholder effects can overlap, so adding them can double-count the same impact.", "Having four branches does not prevent overlap between stakeholder effects.", "The potential for stakeholder effects to overlap is not specific to retail."]
      }
    ]
  },
  {
    "id": "l4",
    "number": 4,
    "title": "Issue trees that guide analysis",
    "summary": "Distinguish why from how, test hypotheses and stop at a useful level of detail.",
    "minutes": 22,
    "sections": [
      {
        "kind": "text",
        "heading": "Diagnostic versus solution trees",
        "body": "A diagnostic tree asks why an outcome changed. A solution tree asks how to improve it. Diagnose before choosing a remedy: falling profit does not automatically justify layoffs. They can share an equation, but the labels should distinguish observed drivers from possible actions."
      },
      {
        "kind": "tree",
        "heading": "Why did profit fall?",
        "caption": "Start with the changed outcome, not a preferred solution.",
        "tree": {
          "label": "Profit fell",
          "children": [
            {
              "label": "Revenue fell",
              "children": [
                {
                  "label": "Units fell",
                  "status": "driver",
                  "note": "Prioritise if price is stable."
                },
                {
                  "label": "Realised price fell"
                }
              ]
            },
            {
              "label": "Cost rose",
              "children": [
                {
                  "label": "Fixed cost rose"
                },
                {
                  "label": "Cost per unit rose"
                }
              ]
            }
          ]
        }
      },
      {
        "kind": "tree",
        "heading": "How could profit improve?",
        "caption": "These are candidate actions, not proven recommendations.",
        "tree": {
          "label": "Improve profit",
          "children": [
            {
              "label": "Increase revenue",
              "children": [
                {
                  "label": "Improve retention"
                },
                {
                  "label": "Raise realised price"
                }
              ]
            },
            {
              "label": "Reduce cost",
              "children": [
                {
                  "label": "Reduce material waste"
                },
                {
                  "label": "Improve staff scheduling"
                }
              ]
            }
          ]
        }
      },
      {
        "kind": "text",
        "heading": "Hypothesis-driven, not answer-driven",
        "body": "A hypothesis is a provisional explanation with a test. State what evidence would support or contradict it. Prioritise a likely, material branch, but retain alternatives. A coloured driver node means “test first”, not “proven true”."
      },
      {
        "kind": "tree",
        "heading": "Test a hypothesis",
        "caption": "Hypothesis: conversion, rather than traffic, caused the decline.",
        "tree": {
          "label": "Online sales fell",
          "children": [
            {
              "label": "Traffic",
              "note": "Compare sessions with prior period."
            },
            {
              "label": "Conversion",
              "children": [
                {
                  "label": "Checkout completion",
                  "status": "driver",
                  "note": "Test by device and release date."
                },
                {
                  "label": "Earlier funnel steps",
                  "note": "Check if drop starts before checkout."
                }
              ]
            },
            {
              "label": "Order value",
              "note": "Stable value would weaken a mix explanation."
            }
          ]
        }
      },
      {
        "kind": "text",
        "heading": "Levels of abstraction",
        "body": "Children should explain or divide their parent at a comparable level. “Revenue” and “broken checkout button” should not be siblings: one is an outcome category and the other a specific mechanism. Move from broad drivers to measurable subdrivers, then to testable causes."
      },
      {
        "kind": "text",
        "heading": "How deep should you go?",
        "body": "Usually two or three levels below the root are enough for the initial structure. Stop when a leaf supports a specific data request or decision. Expand only the priority branch as evidence arrives. A deeper tree is not better if you cannot explain what you would test."
      },
      {
        "kind": "example",
        "title": "Find the likely driver",
        "prompt": "An online shop’s orders fell 20%; sessions are flat.",
        "tree": {
          "label": "Orders fell",
          "children": [
            {
              "label": "Sessions",
              "note": "Reported flat; check source consistency."
            },
            {
              "label": "Conversion",
              "children": [
                {
                  "label": "Mobile checkout",
                  "status": "driver",
                  "note": "Compare before and after release."
                },
                {
                  "label": "Other conversion steps",
                  "note": "Keep an alternative explanation."
                }
              ]
            }
          ]
        },
        "note": "Orders = sessions × conversion, so conversion fell 20% relative if the measures are consistent. That does not prove a checkout fault. Ask for conversion by device and funnel stage; a flat mobile checkout rate would weaken the hypothesis."
      },
      {
        "kind": "example",
        "title": "Turn diagnosis into action",
        "prompt": "A café has established that unsold sandwiches drive higher waste.",
        "tree": {
          "label": "Reduce sandwich waste",
          "children": [
            {
              "label": "Match production to demand",
              "children": [
                {
                  "label": "Smaller batches",
                  "status": "driver",
                  "note": "Pilot at quiet times."
                },
                {
                  "label": "Improve daily forecasts"
                }
              ]
            },
            {
              "label": "Recover unsold value",
              "children": [
                {
                  "label": "Late-day markdowns"
                },
                {
                  "label": "Pre-order collection"
                }
              ]
            }
          ]
        },
        "note": "Now a solution tree is justified. Compare waste savings with extra labour and markdown cannibalisation. Pilot smaller batches and track both waste and stock-outs; less waste is not a win if profitable demand is lost."
      },
      {
        "kind": "tip",
        "body": "For each leaf, finish the sentence: “I would ask for … to test whether …”."
      },
      {
        "kind": "tip",
        "body": "Update the tree after evidence arrives. Do not continue investigating a branch just because you drew it first."
      }
    ],
    "quiz": [
      {
        "q": "What is a diagnostic question?",
        "options": [
          "How can we raise prices?",
          "Why did profit fall?",
          "Which pilot should we launch?",
          "How should we train staff?"
        ],
        "answer": 1,
        "explanation": "A diagnostic tree explains a problem; a solution tree organises potential actions.",
        "wrongWhy": ["Asking how to raise prices seeks an action rather than the cause of a problem.", "", "Choosing a pilot is a solution decision rather than an investigation of causes.", "Asking how to train staff concerns implementation rather than diagnosing a problem."]
      },
      {
        "q": "When should you stop expanding an initial branch?",
        "options": [
          "After exactly five levels",
          "When the page is full",
          "When a leaf supports a specific test or decision",
          "Only when every possible cause is listed"
        ],
        "answer": 2,
        "explanation": "Useful depth is determined by the analysis needed, not by visual complexity.",
        "wrongWhy": ["A fixed five-level rule ignores whether the branch already supports a useful test.", "Page space does not determine whether a branch is analytically useful.", "", "Listing every possible cause adds detail beyond what is needed for a specific test or decision."]
      },
      {
        "q": "What would weaken a checkout-fault hypothesis?",
        "options": [
          "A new release occurred",
          "Customers complained",
          "Mobile traffic increased",
          "Checkout completion stayed unchanged"
        ],
        "answer": 3,
        "explanation": "Stable checkout completion contradicts the proposed mechanism; investigate other conversion steps.",
        "wrongWhy": ["A new release could support a checkout-fault hypothesis rather than contradict it.", "Customer complaints could support a checkout problem rather than weaken it.", "Increased mobile traffic does not show whether checkout completion deteriorated.", ""]
      }
    ]
  },
  {
    "id": "l5",
    "number": 5,
    "title": "Common mistakes and how to repair them",
    "summary": "Recognise six structural errors and replace them with testable, consistent branches.",
    "minutes": 22,
    "sections": [
      {
        "kind": "text",
        "heading": "Repair the logic before polishing the diagram",
        "body": "An attractive tree can still be wrong. Check sibling boundaries, missing scope, comparable levels and a clear link to the outcome. Ghost nodes below show what was absent; they are teaching annotations, not branches present in the original proposal."
      },
      {
        "kind": "beforeAfter",
        "heading": "Overlap",
        "mistake": "One sale fits two siblings.",
        "before": {
          "label": "Revenue",
          "children": [
            {
              "label": "Online",
              "status": "overlap"
            },
            {
              "label": "Repeat customers",
              "status": "overlap"
            }
          ]
        },
        "after": {
          "label": "Revenue",
          "children": [
            {
              "label": "Online",
              "status": "good"
            },
            {
              "label": "Offline",
              "status": "good"
            }
          ]
        },
        "explanation": "Use channel consistently, assigning each sale to its order-placement channel. Repeat status can be a second-level split within each channel."
      },
      {
        "kind": "beforeAfter",
        "heading": "Gap",
        "mistake": "The branches leave part of the scope out.",
        "before": {
          "label": "Customer ages",
          "children": [
            {
              "label": "Under 18"
            },
            {
              "label": "18–34"
            },
            {
              "label": "35+",
              "status": "missing",
              "note": "Ghost: omitted from original split."
            }
          ]
        },
        "after": {
          "label": "Customer ages",
          "children": [
            {
              "label": "Under 18",
              "status": "good"
            },
            {
              "label": "18–34",
              "status": "good"
            },
            {
              "label": "35+",
              "status": "good"
            }
          ]
        },
        "explanation": "Add the missing band. This assumes known ages; include unknown ages if the dataset contains them."
      },
      {
        "kind": "beforeAfter",
        "heading": "Mixed levels",
        "mistake": "A detailed mechanism sits beside its parent category.",
        "before": {
          "label": "Profit decline",
          "children": [
            {
              "label": "Revenue",
              "status": "mixed"
            },
            {
              "label": "Rider pay",
              "status": "mixed"
            },
            {
              "label": "Other costs",
              "status": "missing",
              "note": "Ghost: costs beyond rider pay omitted."
            }
          ]
        },
        "after": {
          "label": "Profit decline",
          "children": [
            {
              "label": "Revenue",
              "status": "good"
            },
            {
              "label": "Cost",
              "children": [
                {
                  "label": "Rider pay",
                  "status": "good"
                },
                {
                  "label": "Other costs",
                  "status": "good"
                }
              ],
              "status": "good"
            }
          ]
        },
        "explanation": "Revenue and cost are peers. Rider pay belongs under cost, with remaining costs represented."
      },
      {
        "kind": "beforeAfter",
        "heading": "Branch not a driver",
        "mistake": "A descriptive metric is treated as a cause.",
        "before": {
          "label": "Profit decline",
          "children": [
            {
              "label": "Logo colour",
              "status": "mixed",
              "note": "No demonstrated profit mechanism."
            },
            {
              "label": "Revenue and cost",
              "status": "missing",
              "note": "Ghost: direct drivers absent."
            }
          ]
        },
        "after": {
          "label": "Profit decline",
          "children": [
            {
              "label": "Revenue",
              "children": [
                {
                  "label": "Units",
                  "status": "good"
                },
                {
                  "label": "Realised price",
                  "status": "good"
                }
              ],
              "status": "good"
            },
            {
              "label": "Cost",
              "status": "good"
            }
          ]
        },
        "explanation": "Replace the unsupported branch with direct profit drivers. Branding could matter through conversion or price, but needs a causal link and evidence."
      },
      {
        "kind": "beforeAfter",
        "heading": "Restating the problem",
        "mistake": "A branch says the same thing as its parent.",
        "before": {
          "label": "Low profit",
          "children": [
            {
              "label": "Poor profitability",
              "status": "mixed"
            },
            {
              "label": "Underlying drivers",
              "status": "missing",
              "note": "Ghost: no explanation supplied."
            }
          ]
        },
        "after": {
          "label": "Low profit",
          "children": [
            {
              "label": "Revenue",
              "children": [
                {
                  "label": "Price",
                  "status": "good"
                },
                {
                  "label": "Units",
                  "status": "good"
                }
              ],
              "status": "good"
            },
            {
              "label": "Cost",
              "children": [
                {
                  "label": "Fixed",
                  "status": "good"
                },
                {
                  "label": "Variable",
                  "status": "good"
                }
              ],
              "status": "good"
            }
          ]
        },
        "explanation": "A synonym does not help decide what to test. Use measurable drivers and clarify whether profit is low versus last year, budget or a target."
      },
      {
        "kind": "beforeAfter",
        "heading": "Generic framework without tailoring",
        "mistake": "A memorised checklist ignores the actual objective.",
        "before": {
          "label": "Delivery loss per order",
          "children": [
            {
              "label": "Market attractiveness",
              "status": "mixed"
            },
            {
              "label": "Company strengths",
              "status": "mixed"
            },
            {
              "label": "Order economics",
              "status": "missing",
              "note": "Ghost: unit economics omitted."
            }
          ]
        },
        "after": {
          "label": "Delivery loss per order",
          "children": [
            {
              "label": "Income per order",
              "children": [
                {
                  "label": "Basket gross profit",
                  "status": "good"
                },
                {
                  "label": "Fees and ads",
                  "status": "good"
                }
              ],
              "status": "good"
            },
            {
              "label": "Cost per order",
              "children": [
                {
                  "label": "Rider cost",
                  "status": "good"
                },
                {
                  "label": "Store and other costs",
                  "status": "good"
                }
              ],
              "status": "good"
            }
          ]
        },
        "explanation": "For loss per order, begin with income and cost on the same unit basis. Market context may explain demand later; it does not replace the economics."
      },
      {
        "kind": "example",
        "title": "Repair a subscription tree",
        "prompt": "A candidate splits subscriber losses into cancellations and unhappy customers.",
        "tree": {
          "label": "Subscriber movement",
          "children": [
            {
              "label": "Opening subscribers"
            },
            {
              "label": "New subscriptions"
            },
            {
              "label": "Reactivations"
            },
            {
              "label": "Cancellations"
            }
          ]
        },
        "note": "Unhappy customers can cancel, so the proposed causes overlap. First reconcile closing subscribers = opening + new + reactivated − cancelled. Then investigate reasons for cancellations, separating recorded reasons or explicitly allowing multiple responses."
      },
      {
        "kind": "example",
        "title": "Repair a factory cost tree",
        "prompt": "A candidate lists labour, overtime and materials as parallel costs.",
        "tree": {
          "label": "Factory costs",
          "children": [
            {
              "label": "Labour",
              "children": [
                {
                  "label": "Regular pay"
                },
                {
                  "label": "Overtime pay"
                }
              ]
            },
            {
              "label": "Non-labour",
              "children": [
                {
                  "label": "Materials"
                },
                {
                  "label": "Other factory costs"
                }
              ]
            }
          ]
        },
        "note": "Overtime is part of labour, so adding it again double-counts. Nest it below labour and include other factory costs. Use the same accounting period and ensure benefits or agency labour have a defined home."
      },
      {
        "kind": "tip",
        "body": "Read each sibling list aloud: “These branches divide the parent by …”. If you cannot finish the sentence, review the split."
      },
      {
        "kind": "tip",
        "body": "An “other” branch prevents a gap but does not explain it. Expand it when it is large or plausibly important."
      }
    ],
    "quiz": [
      {
        "q": "Why is labour / overtime / materials a bad additive split?",
        "options": [
          "It has three branches",
          "Overtime overlaps labour",
          "Materials are always fixed",
          "It lacks a competitor branch"
        ],
        "answer": 1,
        "explanation": "Overtime is a component of labour and would be counted twice.",
        "wrongWhy": ["Three branches can form a valid split if they are non-overlapping and complete.", "", "Materials can vary with production volume, so they are not always fixed.", "A competitor branch is not required in a breakdown of internal costs."]
      },
      {
        "q": "What does a ghost node marked missing represent?",
        "options": [
          "A proven driver",
          "An irrelevant idea",
          "A branch absent from the original tree",
          "A recommended action"
        ],
        "answer": 2,
        "explanation": "It makes a completeness gap visible without pretending it was in the original structure.",
        "wrongWhy": ["A missing marker indicates an omitted branch, not evidence that it drives the outcome.", "A missing branch signals a coverage gap rather than an idea judged irrelevant.", "", "The marker identifies a structural omission rather than prescribing an action."]
      },
      {
        "q": "Which repair best addresses mixed levels?",
        "options": [
          "Put rider pay beneath cost",
          "Rename revenue as sales",
          "Add more unrelated metrics",
          "Delete all detailed branches"
        ],
        "answer": 0,
        "explanation": "Moving the specific cost beneath its parent restores comparable sibling levels.",
        "wrongWhy": ["", "Renaming revenue as sales changes the label without correcting the hierarchy.", "Adding unrelated metrics introduces more inconsistency rather than aligning branch levels.", "Deleting all detail discards useful analysis instead of placing it beneath the appropriate parent."]
      }
    ]
  },
  {
    "id": "l6",
    "number": 6,
    "title": "From framework to tailored structure",
    "summary": "Adapt a profitability tree to Indian quick-commerce unit economics, then transfer the method to a gym and software.",
    "minutes": 28,
    "sections": [
      {
        "kind": "text",
        "heading": "Anchor the structure in the decision",
        "body": "The client is an Indian quick-commerce operator promising grocery delivery in about ten minutes. It is losing money per order. Clarify the city, period and whether “loss” means contribution loss or fully allocated operating loss. The right tree uses the client’s economics, not just industry vocabulary."
      },
      {
        "kind": "morph",
        "heading": "From profitability to quick-commerce economics",
        "steps": [
          {
            "caption": "1. Start with the accounting identity.",
            "tree": {
              "label": "Profit",
              "children": [
                {
                  "label": "Revenue"
                },
                {
                  "label": "Cost"
                }
              ]
            }
          },
          {
            "caption": "2. Match the objective: rupees per order. Separate contribution from fully allocated profit.",
            "tree": {
              "label": "Profit per order",
              "children": [
                {
                  "label": "Income per order",
                  "children": [
                    {
                      "label": "Basket gross profit"
                    },
                    {
                      "label": "Fees and other income"
                    }
                  ]
                },
                {
                  "label": "Cost per order",
                  "children": [
                    {
                      "label": "Variable fulfilment"
                    },
                    {
                      "label": "Allocated fixed cost"
                    }
                  ]
                }
              ]
            }
          },
          {
            "caption": "3. Replace generic labels with quick-commerce economics. Gross profit is not the full basket value.",
            "tree": {
              "label": "Profit per order",
              "children": [
                {
                  "label": "Income per order",
                  "children": [
                    {
                      "label": "AOV × gross margin %"
                    },
                    {
                      "label": "Delivery fee"
                    },
                    {
                      "label": "Ad income per order"
                    }
                  ]
                },
                {
                  "label": "Cost per order",
                  "children": [
                    {
                      "label": "Rider cost per order"
                    },
                    {
                      "label": "Store cost per order"
                    },
                    {
                      "label": "Wastage and discounts"
                    }
                  ]
                }
              ]
            }
          },
          {
            "caption": "4. Expose the operating drivers. Keep every item in exactly one accounting location.",
            "tree": {
              "label": "Profit per order",
              "children": [
                {
                  "label": "Income per order",
                  "children": [
                    {
                      "label": "AOV × gross margin %"
                    },
                    {
                      "label": "Delivery fee"
                    },
                    {
                      "label": "Ad income per order"
                    }
                  ]
                },
                {
                  "label": "Cost per order",
                  "children": [
                    {
                      "label": "Rider cost per order"
                    },
                    {
                      "label": "Rent ÷ store orders"
                    },
                    {
                      "label": "Wastage per order"
                    },
                    {
                      "label": "Platform-funded discounts"
                    },
                    {
                      "label": "Other costs per order"
                    }
                  ]
                }
              ]
            }
          },
          {
            "caption": "5. Prioritise tests: compare stores and time slots before proposing growth.",
            "tree": {
              "label": "Profit per order",
              "children": [
                {
                  "label": "Income per order",
                  "children": [
                    {
                      "label": "AOV × gross margin %",
                      "note": "Check category mix and product cost."
                    },
                    {
                      "label": "Delivery fee"
                    },
                    {
                      "label": "Ad income per order"
                    }
                  ]
                },
                {
                  "label": "Cost per order",
                  "children": [
                    {
                      "label": "Rider cost per order",
                      "status": "driver",
                      "note": "Test drops per paid rider hour."
                    },
                    {
                      "label": "Rent ÷ store orders",
                      "status": "driver",
                      "note": "Test dark-store utilisation."
                    },
                    {
                      "label": "Wastage per order"
                    },
                    {
                      "label": "Platform-funded discounts"
                    },
                    {
                      "label": "Other costs per order",
                      "note": "Include picking, packaging and overhead."
                    }
                  ]
                }
              ]
            }
          }
        ]
      },
      {
        "kind": "text",
        "heading": "Set accounting rules before calculating",
        "body": "Here AOV is merchandise value before platform-funded discounts, excluding delivery fees and taxes. Basket gross profit equals AOV less merchandise purchase cost, with wastage excluded from that purchase-cost measure. Show platform-funded discounts and wastage once on the cost side. If the client already nets either from revenue or gross margin, do not subtract it again. Allocate ad income over the same orders and period. The gross-margin convention assumes a retailer model; a marketplace may earn commission instead."
      },
      {
        "kind": "text",
        "heading": "Utilisation is a driver, not another cost",
        "body": "Dark-store rent per order equals period rent divided by period orders. Low utilisation raises this allocated amount; do not add a separate “utilisation cost”. Rider cost per order can be decomposed into paid rider cost per hour divided by completed orders per paid hour. Check whether denser routes, batching and staffing changes are compatible with the ten-minute promise."
      },
      {
        "kind": "example",
        "title": "Quick-commerce: calculate and choose a test",
        "prompt": "AOV is ₹500 and merchandise gross margin is 20%. Delivery fee is ₹10 and allocated ad income is ₹5 per order. What explains the loss?",
        "tree": {
          "label": "Profit per order",
          "children": [
            {
              "label": "Income: ₹115",
              "children": [
                {
                  "label": "Basket gross profit: ₹100"
                },
                {
                  "label": "Fee + ads: ₹15"
                }
              ]
            },
            {
              "label": "Costs: ₹125",
              "children": [
                {
                  "label": "Rider: ₹45; rent: ₹20"
                },
                {
                  "label": "Waste: ₹10; discounts: ₹25"
                },
                {
                  "label": "Other costs: ₹25"
                }
              ]
            }
          ]
        },
        "note": "Income is ₹500 × 20% + ₹10 + ₹5 = ₹115; costs total ₹125, so loss is ₹10 per order. If store orders rise 25% with rent unchanged, rent per order falls from ₹20 to ₹16, saving only ₹4. That alone leaves a ₹6 loss, even assuming every other per-order item stays constant. Test rider productivity and discount effectiveness as well; growth could require extra capacity."
      },
      {
        "kind": "example",
        "title": "Tailor the same identity to a gym",
        "prompt": "A gym has falling monthly profit. How should the generic tree change?",
        "tree": {
          "label": "Monthly gym profit",
          "children": [
            {
              "label": "Revenue",
              "children": [
                {
                  "label": "Active members × net fee"
                },
                {
                  "label": "Classes and other income"
                }
              ]
            },
            {
              "label": "Costs",
              "children": [
                {
                  "label": "Rent and salaried staff"
                },
                {
                  "label": "Usage-linked costs"
                }
              ]
            }
          ]
        },
        "note": "Translate volume into active paying members, not footfall. With 800 members paying £40 and £3,000 other revenue, total revenue is £35,000. At £38,000 cost the gym loses £3,000. If members fell but fees stayed stable, investigate acquisition and cancellations before cutting classes that may support retention."
      },
      {
        "kind": "example",
        "title": "Tailor the same identity to software",
        "prompt": "A subscription software company’s operating profit is falling.",
        "tree": {
          "label": "Monthly operating profit",
          "children": [
            {
              "label": "Revenue",
              "children": [
                {
                  "label": "Paid accounts × net monthly fee"
                },
                {
                  "label": "Usage and service revenue"
                }
              ]
            },
            {
              "label": "Costs",
              "children": [
                {
                  "label": "Cloud and support"
                },
                {
                  "label": "Sales, product and overhead"
                }
              ]
            }
          ]
        },
        "note": "Use recognised monthly revenue, not annual cash collected. With 2,000 accounts at £50 plus £10,000 usage revenue, monthly revenue is £110,000. Costs of £120,000 imply a £10,000 loss. If cloud cost rose £15,000 while other lines were flat, prioritise usage and cloud cost per unit. Do not substitute customer acquisition cost or lifetime value for this period-profit reconciliation."
      },
      {
        "kind": "tip",
        "body": "Tailoring means replacing generic drivers with measurable operating drivers while preserving the underlying equation."
      },
      {
        "kind": "tip",
        "body": "Before recommending higher volume, distinguish positive incremental contribution from average profit after fixed-cost allocation. Scaling negative contribution can increase total losses."
      }
    ],
    "quiz": [
      {
        "q": "How should dark-store utilisation enter this tree?",
        "options": [
          "As extra revenue",
          "As an additional cost beside rent",
          "Through rent per order and other capacity drivers",
          "As a substitute for gross margin"
        ],
        "answer": 2,
        "explanation": "Utilisation affects fixed-cost allocation. Adding it as a separate expense would double-count.",
        "wrongWhy": ["Utilisation is a capacity measure, not an additional stream of revenue.", "Adding utilisation as a cost beside rent would double-count its effect on fixed-cost allocation.", "", "Utilisation measures capacity use and cannot replace the income and cost information in gross margin."]
      },
      {
        "q": "Income is ₹115 and cost is ₹125 per order. What is the result?",
        "options": [
          "₹10 loss per order",
          "₹10 profit per order",
          "₹240 profit per order",
          "Cannot calculate without market size"
        ],
        "answer": 0,
        "explanation": "Profit per order is income minus cost: ₹115 − ₹125 = −₹10.",
        "wrongWhy": ["", "Costs exceed income by ₹10, so the result is a loss rather than a profit.", "₹240 adds income and cost instead of subtracting cost from income.", "Income and cost per order are sufficient to calculate profit per order without market size."]
      },
      {
        "q": "What must you check before subtracting discounts?",
        "options": [
          "Whether the tree has four branches",
          "Whether competitors use discounts",
          "Whether orders are delivered at night",
          "Whether discounts are already netted from revenue"
        ],
        "answer": 3,
        "explanation": "A discount included in net revenue must not be deducted again as a separate cost.",
        "wrongWhy": ["The number of branches does not determine whether discounts have already been deducted.", "Competitors’ discount policies do not reveal how discounts are treated in this revenue figure.", "Delivery time does not establish whether revenue is already net of discounts.", ""]
      }
    ]
  }
];
