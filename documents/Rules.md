# RULES.md
# Technical & General Guidelines: Pokémon VGC Beginner Analyzer

## 1. Technology Stack Definition
* **Core Framework:** Next.js 14+ (App Router). 
  * *CRITICAL CONSTRAINT:* Must be configured for Static Site Generation (SSG). `output: 'export'` must be set in `next.config.mjs`. We are deploying to static edge networks (e.g., GitHub Pages, Vercel Static) to maintain $0 server costs. **Do not use Next.js API routes or Server Actions.**
* **UI Library:** React 18+.
* **Language:** TypeScript 5+ (Strict mode enabled).
* **Styling:** Tailwind CSS.
* **State Management:** Zustand (preferred for lightweight, global roster state) or React Context API. Avoid Redux to minimize bundle size.
* **Data Fetching & Caching:** TanStack Query (React Query) configured with a LocalStorage/IndexedDB persister to aggressive cache PokeAPI data and respect their rate limits.
* **Data Visualization:** Recharts (lightweight, React-native) for the Speed Tier Visualizer.
* **Icons:** Lucide React or similar lightweight SVG icon library.

## 2. Technical Preferences
### Architecture & Organization
* **Folder Structure:** * `src/app/`: Next.js routing (only static pages).
  * `src/components/`: Reusable UI components.
  * `src/features/`: Feature-sliced modules (e.g., `features/team-builder`, `features/synergy-matrix`).
  * `src/lib/`: Utility functions, math logic, and PokeAPI fetchers.
  * `src/types/`: TypeScript interface definitions.
* **Naming Conventions:**
  * Components and Interfaces: `PascalCase` (e.g., `SynergyMatrix.tsx`, `PokemonStats`).
  * Variables, Functions, Hooks: `camelCase` (e.g., `calculateSynergy`, `useTeamRoster`).
  * File/Folder names: `kebab-case` (e.g., `type-effectiveness.ts`).

### Data Handling & API Interactions
* **PokeAPI Usage:** Never query PokeAPI sequentially in a tight loop. Fetch data in parallel using `Promise.all` or batching. 
* **Data Transformation:** Do not store raw PokeAPI responses in the application state. Map the massive PokeAPI JSON objects into lean, custom TypeScript interfaces (e.g., extracting only name, typing, base stats, and legal moves) immediately upon fetching.

### Performance & Security
* **Lazy Loading:** Dynamically import heavy charting libraries (like Recharts) using Next.js `next/dynamic` to keep the initial load fast.
* **Input Debouncing:** Debounce the Pokémon search bar to prevent unnecessary state re-renders or API calls while the user is typing.
* **Security:** As a purely client-side static app, standard XSS protections in React apply. When handling Showdown Import text (F-TB-04), strictly sanitize and validate the regex parsed data before injecting it into the state to prevent script injection.

## 3. Development Standards
* **TypeScript Rigor:** Explicit typing is mandatory. Use of `any` is strictly prohibited. Create a comprehensive `TypeEffectiveness` matrix in TypeScript rather than fetching it dynamically.
* **Testing Requirements:**
  * **Unit Tests (Jest):** Mandatory for all math and logic functions in `src/lib/` (e.g., Type synergy calculators, speed tier math, stat calculators). These must be perfectly accurate according to Pokémon game mechanics.
  * **Component Tests (React Testing Library):** Focus on the Team Builder dropdown interactions and ensure dependent dropdowns (Moves/Items) clear correctly when a Pokémon is changed.
* **Accessibility (WCAG AA):**
  * All dropdowns and modal menus must be fully keyboard navigable.
  * Provide descriptive `alt` text for all Pokémon sprites and type icons.
  * Ensure high contrast for text overlaid on colored type badges.
* **Responsive Design:** * Mobile-first approach using Tailwind's `sm:`, `md:`, `lg:` prefixes. 
  * The Synergy Matrix must horizontally scroll on mobile devices rather than breaking the layout.

## 4. Implementation Priorities (Phased Approach)
* **Phase 1 (Infrastructure & Data):** Project initialization, Next.js static export configuration, PokeAPI caching layer, and defining core TypeScript interfaces.
* **Phase 2 (Must Have - Roster Setup):** 6-Slot UI (F-TB-01) and dependent attribute dropdowns (F-TB-02).
* **Phase 3 (Must Have - The Math Engine):** Automated Type Synergy Matrix (F-AV-01), Damage Category Checker (F-AV-02), and Major Weakness Alerts (F-AV-03). *This is the core value proposition.*
* **Phase 4 (Should Have - Enhancements):** Speed Tier Visualizer (F-AV-04), Hardcoded Templates (F-TB-03), and Showdown Import/Export (F-TB-04).

## 5. General AI Assistance Guidelines
* **No Placeholders:** Write complete, implementation-ready code. Do not leave `// TODO: implement logic here` comments. If a function is requested, write the complete algorithmic logic.
* **Strict Requirement Adherence:** Do not invent features outside the `FEATURES.md` scope. Specifically, do not attempt to integrate AI/LLM analysis or backend databases.
* **Handling Ambiguity:** If a specific Pokémon mechanic is unclear (e.g., "How does the Tera Type affect the Synergy Matrix?"), pause and explicitly ask for clarification before writing the code, as VGC rules are highly specific.
* **Clean Code:** Adhere to DRY (Don't Repeat Yourself) principles. Extract repeated Tailwind class strings into reusable UI components (e.g., `<TypeBadge type="Fire" />`).