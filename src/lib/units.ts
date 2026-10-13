export const G_PER_LB = 453.592
export const G_PER_OZ = 28.3495

export type MassUnit = 'g' | 'kg' | 'oz' | 'lb'
export const MASS_UNITS: Record<MassUnit, number> = { g: 1, kg: 1000, oz: G_PER_OZ, lb: G_PER_LB }

export function toGrams(amount: number, unit: MassUnit): number {
  return amount * MASS_UNITS[unit]
}

/** grams per teaspoon, keyed by substring of the ingredient name. Longest match wins. */
const DENSITIES: Array<[string, number]> = [
  // salts
  ['diamond crystal', 2.8], ['kosher salt', 2.8], ['morton', 4.8], ['table salt', 6], ['sea salt', 5], ['salt', 6],
  ['msg', 4.5], ['curing salt', 5.5], ['prague powder', 5.5],
  // sugars
  ['brown sugar', 4.5], ['powdered sugar', 2.5], ['confectioners', 2.5], ['sugar', 4.2],
  ['honey', 7], ['maple syrup', 6.5], ['molasses', 6.8], ['corn syrup', 6.8], ['agave', 6.5],
  // flours & starches
  ['bread flour', 2.6], ['all-purpose flour', 2.6], ['all purpose flour', 2.6], ['cake flour', 2.3], ['flour', 2.6],
  ['cornstarch', 2.5], ['corn starch', 2.5], ['potato starch', 2.7], ['cocoa', 2.5], ['espresso powder', 1.8],
  // leaveners
  ['baking powder', 4], ['baking soda', 4.6], ['instant yeast', 3.1], ['active dry yeast', 3.1], ['yeast', 3.1],
  // ground spices
  ['black pepper', 2.3], ['white pepper', 2.4], ['pepper', 2.3],
  ['garlic powder', 3.1], ['onion powder', 2.4], ['smoked paprika', 2.3], ['paprika', 2.3],
  ['cumin', 2.1], ['coriander', 1.8], ['cayenne', 1.8], ['chili powder', 2.6], ['chile powder', 2.6],
  ['chili flake', 1.8], ['red pepper flake', 1.8], ['gochugaru', 1.8], ['cinnamon', 2.6], ['nutmeg', 2.2],
  ['turmeric', 3], ['ground ginger', 1.8], ['oregano', 1], ['thyme', 0.9], ['rosemary', 1.2], ['basil', 0.7],
  ['mustard powder', 1.8], ['curry powder', 2], ['five spice', 2.3], ['garam masala', 2.2], ['allspice', 1.9],
  ['cloves', 2.2], ['cardamom', 1.9], ['fennel', 2], ['celery seed', 2.2], ['sumac', 2.1], ["za'atar", 1.5],
  // fats
  ['sesame oil', 4.5], ['olive oil', 4.5], ['vegetable oil', 4.5], ['oil', 4.5], ['butter', 4.7], ['ghee', 4.3],
  ['lard', 4.3], ['tallow', 4.3], ['shortening', 4.2],
  // liquids & sauces
  ['soy sauce', 5.3], ['tamari', 5.3], ['fish sauce', 5.8], ['oyster sauce', 6], ['worcestershire', 5.5],
  ['hoisin', 6], ['mirin', 5], ['rice vinegar', 5], ['vinegar', 5], ['lemon juice', 5], ['lime juice', 5],
  ['vanilla', 4.2], ['extract', 4.2], ['water', 4.9], ['milk', 5], ['buttermilk', 5], ['cream', 4.9],
  ['stock', 4.9], ['broth', 4.9], ['wine', 4.9], ['sake', 4.9], ['beer', 4.9],
  ['ketchup', 5.7], ['mustard', 5.2], ['mayo', 4.6], ['mayonnaise', 4.6], ['sriracha', 5.5], ['gochujang', 6],
  ['miso', 5.5], ['tomato paste', 5.5], ['tahini', 5], ['peanut butter', 5.3],
  // aromatics
  ['minced garlic', 4.7], ['garlic', 4.7], ['grated ginger', 4.5], ['ginger', 4.5],
]

/** Best-guess grams per teaspoon from the ingredient name, or undefined if unknown. */
export function guessGPerTsp(name: string): number | undefined {
  const n = name.toLowerCase()
  let best: [string, number] | undefined
  for (const entry of DENSITIES) {
    if (n.includes(entry[0]) && (!best || entry[0].length > best[0].length)) best = entry
  }
  return best?.[1]
}

function trimZeros(s: string): string {
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s
}

export function formatGrams(g: number): string {
  let v: number
  if (g >= 100) v = Math.round(g)
  else if (g >= 10) v = Math.round(g * 2) / 2
  else v = Math.round(g * 10) / 10
  return `${trimZeros(v.toFixed(1))} g`
}

/** Pounds, shown only at or above half a pound. */
export function formatPounds(g: number): string | null {
  if (g < G_PER_LB / 2) return null
  const lb = g / G_PER_LB
  return `${trimZeros(lb >= 10 ? lb.toFixed(1) : lb.toFixed(2))} lb`
}

const EIGHTHS = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞']

/** Pretty fraction for a value that is already a multiple of 1/8. */
function fraction(x: number): string {
  const whole = Math.floor(x + 1e-9)
  const eighths = Math.round((x - whole) * 8)
  if (eighths === 8) return String(whole + 1)
  if (whole === 0) return eighths === 0 ? '0' : EIGHTHS[eighths]
  return eighths === 0 ? String(whole) : `${whole}${EIGHTHS[eighths]}`
}

/** Past a quarter cup (12 tsp) spoons stop being useful. */
export const MAX_SPOON_TSP = 12

/** tsp / tbsp for small amounts, or null when the amount is large or the density is unknown. */
export function formatSpoons(g: number, gPerTsp?: number): string | null {
  if (!gPerTsp || g <= 0) return null
  const tsp = g / gPerTsp
  if (tsp > MAX_SPOON_TSP) return null
  const tspRounded = Math.round(tsp * 8) / 8
  if (tspRounded < 3) {
    if (tspRounded === 0) return 'pinch'
    return `${fraction(tspRounded)} tsp`
  }
  let tbsp = Math.floor(tsp / 3)
  let rem = Math.round((tsp - tbsp * 3) * 4) / 4
  if (rem >= 3) {
    tbsp += 1
    rem = 0
  }
  if (rem === 0) return `${tbsp} tbsp`
  if (rem === 1.5) return `${tbsp}½ tbsp`
  return `${tbsp} tbsp + ${fraction(rem)} tsp`
}
