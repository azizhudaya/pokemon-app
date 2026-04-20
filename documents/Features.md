# FEATURES.md
# Feature List: Pokémon VGC Beginner Analyzer

## 1. Summary of Features
**By Priority (MoSCoW):**
* **Must Have:** 5 Features
* **Should Have:** 3 Features
* **Could Have:** 2 Features
* **Won't Have:** 4 Features

**By Category:**
* **[DI] Data & Infrastructure:** 1 Feature
* **[TB] Team Builder:** 5 Features
* **[AV] Analytics & Visualization:** 5 Features
* **[OS] Out of Scope:** 4 Features

---

## 2. Detailed Feature Breakdown

### Category: Data & Infrastructure [DI]

**F-DI-01: PokeAPI Integration & Caching**
* **Description:** Fetch and locally cache static Pokémon data (Gen 9 & Champions), including base stats, types, abilities, and movepools.
* **Persona:** System (Invisible to user)
* **Priority:** Must Have
* **Acceptance Criteria:**
  * Application successfully fetches required endpoints on initialization.
  * Data is stored in browser `IndexedDB` or `localStorage` to prevent repeated API calls.
  * The app functions seamlessly on page refresh without re-downloading the entire dataset.
* **Technical Considerations:** PokeAPI rate limits; requires an efficient initial load/caching strategy so the user isn't waiting minutes for data.
* **Edge Cases:** Handling updates or newly released Pokémon mid-cache cycle.
* **Complexity:** Medium

### Category: Team Builder [TB]

**F-TB-01: 6-Slot Roster Management**
* **Description:** UI allowing users to add, remove, and reorder up to 6 Pokémon.
* **Persona:** VGC Curious Beginner, Casual Drafter
* **Priority:** Must Have
* **Acceptance Criteria:**
  * User can search for a Pokémon by name.
  * Roster enforces a strict maximum of 6 slots.
  * Users can clear a slot or clear the entire team.
* **Technical Considerations:** Fast, responsive UI state management (e.g., React/Vue context).
* **Edge Cases:** Handling Regional Forms (e.g., Alolan Ninetales vs. Kantonian Ninetales) and distinct forms (e.g., Ogerpon masks).
* **Complexity:** Low

**F-TB-02: Attribute Selectors (Moves, Item, Ability, Tera Type)**
* **Description:** Dependent dropdowns for each Pokémon to select their specific competitive attributes.
* **Persona:** VGC Curious Beginner, Casual Drafter
* **Priority:** Must Have
* **Acceptance Criteria:**
  * Move list strictly filters to the selected Pokémon's legal movepool.
  * Enforces exactly 1 Item, 1 Ability, 1 Tera Type, and up to 4 Moves.
* **Technical Considerations:** Dependent state updates; selecting a new Pokémon must reset the attribute fields.
* **Edge Cases:** Pokémon with only one ability (no dropdown needed) or locked items (e.g., Ogerpon).
* **Complexity:** Medium

**F-TB-03: Hardcoded Team Templates**
* **Description:** A modal/menu to instantly load 3-5 pre-configured meta teams (e.g., Standard Rain, Trick Room).
* **Persona:** VGC Curious Beginner
* **Priority:** Should Have
* **Acceptance Criteria:**
  * Clicking a template instantly populates all 6 slots and their attributes.
  * Shows a confirmation warning if overwriting an existing unsaved team.
* **Technical Considerations:** Stored locally as hardcoded JSON objects.
* **Edge Cases:** None significant.
* **Complexity:** Low

**F-TB-04: Showdown Import/Export**
* **Description:** Text area to paste or copy standard Pokémon Showdown text formatting to load or share teams.
* **Persona:** Casual Drafter
* **Priority:** Should Have
* **Acceptance Criteria:**
  * User can paste a valid Showdown text string to populate the builder.
  * User can copy their current team to clipboard in Showdown format.
* **Technical Considerations:** Requires robust regex (Regular Expressions) to parse the highly specific, sometimes varied Showdown text format.
* **Edge Cases:** Unrecognized nicknames, foreign language text, or custom/illegal moves in the pasted text.
* **Complexity:** High

**F-TB-05: Preset EV Spreads**
* **Description:** Simple toggle to apply default stat profiles (e.g., "Fast Attacker", "Bulky Support") without manual sliders.
* **Persona:** VGC Curious Beginner
* **Priority:** Could Have
* **Acceptance Criteria:**
  * Selecting a preset auto-calculates the final visible stats for that Pokémon.
* **Technical Considerations:** Requires integrating the standard Pokémon stat calculation formula into the frontend.
* **Edge Cases:** Stat calculation rounding errors.
* **Complexity:** Low

### Category: Analytics & Visualization [AV]

**F-AV-01: Automated Type Synergy Matrix**
* **Description:** A visual grid showing the team's combined type weaknesses and resistances.
* **Persona:** VGC Curious Beginner, Casual Drafter
* **Priority:** Must Have
* **Acceptance Criteria:**
  * UI instantly updates when a Pokémon or its Tera Type changes.
  * Clearly highlights how many Pokémon resist a type vs. how many are weak to it.
* **Technical Considerations:** Matrix math requiring cross-referencing dual-types with the standard Gen 9 type chart.
* **Edge Cases:** Abilities that alter type matchups (e.g., Levitate giving Ground immunity, Flash Fire giving Fire immunity).
* **Complexity:** High

**F-AV-02: Damage Category Checker**
* **Description:** An indicator summarizing the ratio of Physical vs. Special offensive moves across the team.
* **Persona:** VGC Curious Beginner
* **Priority:** Must Have
* **Acceptance Criteria:**
  * Scans all selected moves and categorizes them (Physical, Special, Status).
  * Displays a warning if a team is drastically skewed (e.g., 100% Physical).
* **Technical Considerations:** Move data must include the damage category attribute.
* **Edge Cases:** Moves that use non-standard damage calculations (e.g., Body Press using Defense, Foul Play using target's Attack).
* **Complexity:** Medium

**F-AV-03: Major Weakness Alerts**
* **Description:** Prominent red flags that appear if the team violates core defensive principles.
* **Persona:** VGC Curious Beginner
* **Priority:** Must Have
* **Acceptance Criteria:**
  * Triggers UI alert if 3 or more Pokémon share a single type weakness.
  * Alert disappears immediately when the weakness is resolved (e.g., by changing a Tera Type).
* **Technical Considerations:** Event listener tied to the output of F-AV-01.
* **Edge Cases:** None significant.
* **Complexity:** Low

**F-AV-04: Speed Tier Visualizer**
* **Description:** A visual graph plotting the team's speed stats against 5-10 hardcoded, common meta threats.
* **Persona:** VGC Curious Beginner
* **Priority:** Should Have
* **Acceptance Criteria:**
  * Renders a clean 1D axis or bar chart ranking speeds from highest to lowest.
  * Differentiates user's Pokémon from the benchmark meta Pokémon visually.
* **Technical Considerations:** Use a lightweight charting library (e.g., Recharts or Chart.js).
* **Edge Cases:** Speed-modifying items (Choice Scarf), abilities (Swift Swim in Rain), or moves (Tailwind). (MVP may only calculate base/raw speed to save complexity).
* **Complexity:** Medium

**F-AV-05: Move Priority & Speed Control Highlighting**
* **Description:** Visual badges (icons) next to moves that dictate turn order (Priority moves, Tailwind, Trick Room).
* **Persona:** VGC Curious Beginner
* **Priority:** Could Have
* **Acceptance Criteria:**
  * Moves with priority > 0 or < 0 get a specific badge.
  * Field effect moves (Tailwind, Trick Room, Icy Wind) get a "Speed Control" badge.
* **Technical Considerations:** Requires mapping a custom list of specific move IDs to the badge rendering logic.
* **Edge Cases:** Abilities that grant priority (e.g., Prankster giving priority to Status moves).
* **Complexity:** Medium

### Category: Out of Scope (For Future Consideration) [OS]

**F-OS-01: User Accounts & Cloud Saving**
* **Priority:** Won't Have
* **Notes:** Deferred to keep server costs at $0. LocalStorage is strictly used for MVP.

**F-OS-02: Generative AI/LLM Integration**
* **Priority:** Won't Have
* **Notes:** Removed from PRD in favor of deterministic statistical analysis to guarantee accuracy and lower technical risk.

**F-OS-03: Live Meta Scraping**
* **Priority:** Won't Have
* **Notes:** Out of scope. Usage stats will be approximated via hardcoded benchmarks in V1.

**F-OS-04: Granular EV/IV Sliders**
* **Priority:** Won't Have
* **Notes:** Sliders are too complex for the target beginner persona. Presets (F-TB-05) will be used instead.