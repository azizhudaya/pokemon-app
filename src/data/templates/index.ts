import type { TeamTemplate, TeamSlot } from "@/types/team";

/**
 * Complete a slot with sensible defaults so template cards produce valid
 * roster state when loaded. Keeping the template file itself terse (only
 * the interesting fields per slot) keeps the templates readable.
 */
function slot(partial: Partial<TeamSlot>): TeamSlot {
  return {
    speciesId: null,
    speciesName: null,
    nickname: null,
    ability: null,
    item: null,
    teraType: null,
    moves: [null, null, null, null],
    nature: "Hardy",
    evPresetId: "custom",
    evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
    level: 50,
    ...partial,
  };
}

export const TEAM_TEMPLATES: TeamTemplate[] = [
  {
    id: "standard-balance",
    name: "Standard Balance",
    description: "A well-rounded team with pivots, an Intimidator, and spread attacks.",
    slots: [
      slot({
        speciesId: 727, speciesName: "incineroar", ability: "intimidate", item: "Safety Goggles",
        teraType: "ghost", nature: "Careful",
        moves: ["fake-out", "flare-blitz", "knock-off", "parting-shot"],
      }),
      slot({
        speciesId: 591, speciesName: "amoonguss", ability: "regenerator", item: "Rocky Helmet",
        teraType: "water", nature: "Calm",
        moves: ["spore", "rage-powder", "pollen-puff", "protect"],
      }),
      slot({
        speciesId: 1000, speciesName: "gholdengo", ability: "good-as-gold", item: "Choice Specs",
        teraType: "flying", nature: "Modest",
        moves: ["make-it-rain", "shadow-ball", "focus-blast", "trick"],
      }),
      slot({
        speciesId: 1007, speciesName: "koraidon", ability: "orichalcum-pulse", item: "Life Orb",
        teraType: "fire", nature: "Jolly",
        moves: ["collision-course", "flare-blitz", "flame-charge", "protect"],
      }),
      slot({
        speciesId: 1001, speciesName: "wo-chien", ability: "tablets-of-ruin", item: "Leftovers",
        teraType: "dark", nature: "Calm",
        moves: ["giga-drain", "foul-play", "leech-seed", "protect"],
      }),
      slot({
        speciesId: 145, speciesName: "zapdos", ability: "static", item: "Choice Scarf",
        teraType: "electric", nature: "Timid",
        moves: ["thunderbolt", "hurricane", "heat-wave", "volt-switch"],
      }),
    ],
  },
  {
    id: "rain-team",
    name: "Rain Offense",
    description: "Pelipper sets rain; Urshifu-R and Barraskewda punish through.",
    slots: [
      slot({
        speciesId: 279, speciesName: "pelipper", ability: "drizzle", item: "Focus Sash",
        teraType: "ground", nature: "Modest",
        moves: ["hurricane", "weather-ball", "tailwind", "protect"],
      }),
      slot({
        speciesId: 892, speciesName: "urshifu-rapid-strike", ability: "unseen-fist",
        item: "Mystic Water", teraType: "water", nature: "Jolly",
        moves: ["surging-strikes", "close-combat", "aqua-jet", "detect"],
      }),
      slot({
        speciesId: 889, speciesName: "barraskewda", ability: "swift-swim",
        item: "Choice Band", teraType: "water", nature: "Jolly",
        moves: ["liquidation", "close-combat", "aqua-jet", "throat-chop"],
      }),
      slot({
        speciesId: 727, speciesName: "incineroar", ability: "intimidate",
        item: "Safety Goggles", teraType: "grass", nature: "Careful",
        moves: ["fake-out", "flare-blitz", "knock-off", "parting-shot"],
      }),
      slot({
        speciesId: 591, speciesName: "amoonguss", ability: "regenerator",
        item: "Rocky Helmet", teraType: "water", nature: "Calm",
        moves: ["spore", "rage-powder", "pollen-puff", "protect"],
      }),
      slot({
        speciesId: 1000, speciesName: "gholdengo", ability: "good-as-gold",
        item: "Choice Specs", teraType: "flying", nature: "Modest",
        moves: ["make-it-rain", "shadow-ball", "focus-blast", "trick"],
      }),
    ],
  },
  {
    id: "trick-room",
    name: "Trick Room",
    description: "Invert speed with Indeedee-F, then swing with slow, hard hitters.",
    slots: [
      slot({
        speciesId: 876, speciesName: "indeedee-female", ability: "psychic-surge",
        item: "Focus Sash", teraType: "fairy", nature: "Quiet",
        moves: ["trick-room", "expanding-force", "dazzling-gleam", "helping-hand"],
      }),
      slot({
        speciesId: 516, speciesName: "iron-hands", ability: "quark-drive",
        item: "Assault Vest", teraType: "grass", nature: "Brave",
        moves: ["drain-punch", "wild-charge", "fake-out", "heavy-slam"],
      }),
      slot({
        speciesId: 849, speciesName: "ursaluna", ability: "guts",
        item: "Flame Orb", teraType: "ghost", nature: "Brave",
        moves: ["facade", "earthquake", "headlong-rush", "protect"],
      }),
      slot({
        speciesId: 143, speciesName: "snorlax", ability: "thick-fat",
        item: "Leftovers", teraType: "ghost", nature: "Sassy",
        moves: ["body-press", "high-horsepower", "belly-drum", "protect"],
      }),
      slot({
        speciesId: 727, speciesName: "incineroar", ability: "intimidate",
        item: "Safety Goggles", teraType: "ghost", nature: "Sassy",
        moves: ["fake-out", "flare-blitz", "knock-off", "parting-shot"],
      }),
      slot({
        speciesId: 591, speciesName: "amoonguss", ability: "regenerator",
        item: "Rocky Helmet", teraType: "water", nature: "Sassy",
        moves: ["spore", "rage-powder", "pollen-puff", "protect"],
      }),
    ],
  },
  {
    id: "sun-team",
    name: "Sun Offense",
    description: "Koraidon boots the sun and Chlorophyll sweepers clean up.",
    slots: [
      slot({
        speciesId: 1007, speciesName: "koraidon", ability: "orichalcum-pulse",
        item: "Life Orb", teraType: "fire", nature: "Jolly",
        moves: ["collision-course", "flare-blitz", "flame-charge", "protect"],
      }),
      slot({
        speciesId: 3, speciesName: "venusaur", ability: "chlorophyll",
        item: "Choice Specs", teraType: "grass", nature: "Modest",
        moves: ["giga-drain", "sludge-bomb", "earth-power", "sleep-powder"],
      }),
      slot({
        speciesId: 727, speciesName: "incineroar", ability: "intimidate",
        item: "Safety Goggles", teraType: "ghost", nature: "Careful",
        moves: ["fake-out", "flare-blitz", "knock-off", "parting-shot"],
      }),
      slot({
        speciesId: 591, speciesName: "amoonguss", ability: "regenerator",
        item: "Rocky Helmet", teraType: "water", nature: "Calm",
        moves: ["spore", "rage-powder", "pollen-puff", "protect"],
      }),
      slot({
        speciesId: 1000, speciesName: "gholdengo", ability: "good-as-gold",
        item: "Choice Specs", teraType: "flying", nature: "Modest",
        moves: ["make-it-rain", "shadow-ball", "focus-blast", "trick"],
      }),
      slot({
        speciesId: 289, speciesName: "garchomp", ability: "rough-skin",
        item: "Clear Amulet", teraType: "steel", nature: "Jolly",
        moves: ["earthquake", "dragon-claw", "stomping-tantrum", "protect"],
      }),
    ],
  },
  {
    id: "tailwind",
    name: "Tailwind Offense",
    description: "Whimsicott sets Tailwind, giving a fast offense free turns.",
    slots: [
      slot({
        speciesId: 547, speciesName: "whimsicott", ability: "prankster",
        item: "Covert Cloak", teraType: "grass", nature: "Timid",
        moves: ["tailwind", "moonblast", "encore", "helping-hand"],
      }),
      slot({
        speciesId: 987, speciesName: "flutter-mane", ability: "protosynthesis",
        item: "Booster Energy", teraType: "fairy", nature: "Timid",
        moves: ["moonblast", "shadow-ball", "icy-wind", "protect"],
      }),
      slot({
        speciesId: 1002, speciesName: "chien-pao", ability: "sword-of-ruin",
        item: "Focus Sash", teraType: "dark", nature: "Jolly",
        moves: ["icicle-crash", "sucker-punch", "sacred-sword", "protect"],
      }),
      slot({
        speciesId: 727, speciesName: "incineroar", ability: "intimidate",
        item: "Safety Goggles", teraType: "ghost", nature: "Careful",
        moves: ["fake-out", "flare-blitz", "knock-off", "parting-shot"],
      }),
      slot({
        speciesId: 591, speciesName: "amoonguss", ability: "regenerator",
        item: "Rocky Helmet", teraType: "water", nature: "Calm",
        moves: ["spore", "rage-powder", "pollen-puff", "protect"],
      }),
      slot({
        speciesId: 1000, speciesName: "gholdengo", ability: "good-as-gold",
        item: "Choice Specs", teraType: "flying", nature: "Modest",
        moves: ["make-it-rain", "shadow-ball", "focus-blast", "trick"],
      }),
    ],
  },
];
