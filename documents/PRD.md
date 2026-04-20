# PRD.md
# Product Requirements Document: Pokémon VGC Beginner Analyzer

## 1. Overview
The Pokémon VGC Beginner Analyzer is a streamlined, web-based team planner designed specifically for players new to competitive Pokémon (Generation 9 & *Pokémon Champions*). Instead of relying on AI, the tool uses deterministic game data and statistical analysis to evaluate user-built teams. It translates complex VGC concepts—like type synergy, speed tiers, and damage categories—into easily digestible visual feedback, helping beginners build balanced teams without getting overwhelmed by spreadsheets.

## 2. Goals and Objectives
* **User Goal:** Learn the fundamentals of competitive team building (type coverage, physical/special balance, speed control) through clear, automated statistical feedback.
* **Business Goal:** Launch a highly reliable, zero-maintenance tool that acts as a stepping stone for casual players entering the competitive scene.
* **Technical Goal:** Build a fast, lightweight, purely client-side static web application with no server-side compute or API token costs.

## 3. Scope & Prioritization (MoSCoW)
**Must Have (Critical Path for MVP):**
* PokeAPI integration for Gen 9 / *Champions* static data.
* Minimalist Team Builder UI (6 Pokémon slots, moves, items, abilities, Tera Types).
* Automated Type Synergy Matrix (calculating team-wide weaknesses and resistances).
* Damage Category Checker (flagging if a team is entirely Physical or Special).
* "Major Weakness" Alerts (e.g., alerting the user if 3+ Pokémon share a single type weakness).

**Should Have:**
* Speed Tier Visualizer (a simple graph plotting the user's team speeds against 5-10 common meta threats).
* 3-5 hardcoded meta-archetype templates for beginners to study.
* Import/Export functionality using standard Pokémon Showdown text formatting.

**Could Have:**
* Simple preset EV spreads (e.g., "Fast Attacker", "Bulky Support") that auto-calculate final stats.
* Highlighted priority moves and speed-control moves (like Tailwind or Trick Room).

**Won't Have (Out of Scope for MVP):**
* AI/LLM integration.
* Live scraping of tournament usage stats.
* User accounts or cloud database storage.
* Granular EV/IV slider manipulation (keep it to presets to avoid overwhelming beginners).

## 4. User Personas
* **The VGC Curious Beginner:** A casual player who wants to try Ranked Battles but feels overwhelmed. They don't know what a "Speed Tier" is yet and need the tool to point out glaring flaws (like having a team entirely weak to Ground-types).
* **The Casual Drafter:** A player conceptualizing teams who wants a quick, visual "sanity check" to ensure their type synergy is mathematically sound before breeding/training in-game.

## 5. Functional Requirements (User Stories)
* **Team Building:** As a user, I want to search and select Pokémon, items, and moves from dropdowns, so I can accurately input my team.
* **Type Synergy Checking:** As a beginner, I want the tool to automatically count how many of my Pokémon resist or are weak to specific types, so I can fix glaring holes in my defense.
* **Stat Balancing:** As a user, I want to see a summary of my team's physical vs. special attackers, so I don't accidentally get walled by a single defensive Pokémon.
* **Speed Visualization:** As a beginner, I want to see my team's speed stats compared to common meta Pokémon, so I know if I will attack first or second.

## 6. Non-Functional Requirements
* **Browser Compatibility:** Must run smoothly on all modern mobile and desktop browsers (no WebGPU required since we dropped the local AI).
* **Performance:** UI interactions and stat recalculations must occur instantly (< 50ms) upon changing a Pokémon or Tera Type.
* **Infrastructure:** Deployed as a static Single Page Application (SPA) on free edge networks (e.g., Vercel, GitHub Pages).

## 7. User Journeys
**Journey: The Stat-Driven Sanity Check**
1. User lands on the homepage and selects a "Standard Balance" template.
2. The user swaps out one of the template Pokémon for their favorite, Charizard.
3. The UI instantly updates the "Team Analytics" dashboard below the builder.
4. The user sees a red alert box: *"Warning: 3 Pokémon are now weak to Rock-type attacks."*
5. The Speed Tier visualizer shifts, showing Charizard's speed relative to the rest of the team.
6. The user adjusts Charizard's Tera Type to Grass, and the red alert box instantly disappears as the type synergy recalculates.

## 8. Success Metrics
* **Adoption:** > 500 unique teams analyzed in the first month post-launch.
* **Engagement:** Average session length of > 3 minutes (indicating users are tweaking teams and reading the stat feedback).
* **Performance:** Zero server costs and 100% uptime (achieved via static hosting).

## 9. Timeline (MVP Estimate: 3-4 Weeks)
* **Week 1:** Setup SPA repo, PokeAPI caching, and basic Team Builder UI.
* **Week 2:** Build the math logic for the Type Synergy Matrix and Major Weakness Alerts.
* **Week 3:** Implement the Speed Tier Visualizer, Damage Category Checker, and Showdown Import/Export.
* **Week 4:** UI polish, mobile responsiveness testing, and MVP launch.

## 10. Open Questions/Assumptions
* *Assumption:* We can accurately identify physical vs. special attackers based on their selected movepools or base stats without needing complex manual tagging.
* *Open Question:* Which specific "Meta Threats" should we hardcode into the Speed Tier visualizer for beginners to compare their teams against?