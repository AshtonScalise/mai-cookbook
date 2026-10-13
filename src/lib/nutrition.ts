import type { Ingredient } from './schema'

/**
 * Approximate kcal per 100 g (USDA-style values, raw unless noted), keyed by substring of the
 * ingredient name. Longest match wins, so "unsalted butter" hits "butter", not "salt".
 * Used only when an ingredient has no kcal_per_100g of its own.
 */
const KCAL_PER_100G: Array<[string, number]> = [
  // meat & fish
  ['ground beef', 254], ['beef chuck', 215], ['brisket', 251], ['steak', 250], ['beef', 250],
  ['ground pork', 263], ['pork shoulder', 236], ['pork belly', 518], ['pork', 242],
  ['italian sausage', 300], ['sausage', 300], ['bacon', 417], ['pancetta', 458], ['prosciutto', 250],
  ['ground turkey', 150], ['turkey', 150], ['ground chicken', 143], ['chicken breast', 120],
  ['chicken thigh', 177], ['chicken', 165], ['lamb', 282],
  ['salmon', 208], ['tuna', 132], ['cod', 82], ['shrimp', 85],
  // dairy & eggs
  ['unsalted butter', 717], ['butter', 717], ['ghee', 900],
  ['heavy cream', 340], ['whipping cream', 340], ['sour cream', 198], ['cream cheese', 342],
  ['ice cream', 207], ['half and half', 131], ['cream', 340],
  ['buttermilk', 40], ['coconut milk', 230], ['oat milk', 48], ['almond milk', 15], ['milk', 61],
  ['greek yogurt', 97], ['yogurt', 61],
  ['parmigiano', 431], ['parmesan', 431], ['pecorino', 387], ['mozzarella', 280], ['cheddar', 403],
  ['ricotta', 174], ['feta', 264], ['cheese', 350],
  ['egg yolk', 322], ['egg white', 52], ['eggplant', 25], ['egg', 143],
  // fats
  ['olive oil', 884], ['sesame oil', 884], ['vegetable oil', 884], ['oil', 884],
  ['lard', 902], ['tallow', 902], ['shortening', 884], ['mayonnaise', 680], ['mayo', 680],
  // flours, grains, starches
  ['bread flour', 361], ['all-purpose flour', 364], ['all purpose flour', 364], ['whole wheat flour', 340],
  ['cake flour', 362], ['semolina', 360], ['flour', 364], ['cornmeal', 370], ['cornstarch', 381],
  ['corn starch', 381], ['potato starch', 333], ['panko', 395], ['breadcrumbs', 395], ['bread crumbs', 395],
  ['bread', 265], ['rice vinegar', 18], ['rice', 365], ['pasta', 371], ['spaghetti', 371], ['noodles', 371],
  ['oats', 389], ['oatmeal', 389],
  // sugars
  ['brown sugar', 380], ['powdered sugar', 389], ['sugar', 387], ['honey', 304], ['maple syrup', 260],
  ['molasses', 290], ['corn syrup', 286],
  // leaveners & baking
  ['baking soda', 0], ['baking powder', 53], ['yeast', 325], ['vanilla', 288], ['cocoa', 228],
  ['chocolate chips', 480], ['chocolate', 546],
  // produce
  ['green onion', 32], ['scallion', 32], ['onion powder', 341], ['onion', 40], ['shallot', 72],
  ['garlic powder', 331], ['garlic', 149], ['ground ginger', 335], ['ginger', 80],
  ['carrot', 41], ['celery seed', 392], ['celery', 16], ['bell pepper', 31], ['jalapeno', 29],
  ['potato', 77], ['sweet potato', 86], ['mushroom', 22], ['spinach', 23], ['zucchini', 17],
  ['tomato paste', 82], ['tomato sauce', 24], ['crushed tomatoes', 32], ['tomato', 18],
  ['lemon juice', 22], ['lime juice', 25], ['lemon', 29], ['lime', 30],
  ['parsley', 36], ['basil', 23], ['cilantro', 23], ['avocado', 160],
  // nuts & legumes
  ['peanut butter', 588], ['almond', 579], ['peanut', 567], ['walnut', 654], ['pecan', 691],
  ['tofu', 76], ['black beans', 132], ['chickpeas', 164],
  // liquids & sauces
  ['water', 0], ['ice', 0], ['chicken broth', 6], ['beef broth', 7], ['chicken stock', 6], ['beef stock', 7],
  ['broth', 6], ['stock', 6], ['wine', 83], ['beer', 43], ['sake', 134], ['mirin', 241],
  ['soy sauce', 53], ['tamari', 60], ['fish sauce', 35], ['oyster sauce', 51], ['hoisin', 220],
  ['worcestershire', 78], ['vinegar', 18], ['ketchup', 101], ['mustard powder', 508], ['mustard', 60],
  ['hot sauce', 11], ['sriracha', 93], ['gochujang', 230], ['miso', 199], ['tahini', 595],
  // seasonings
  ['salt', 0], ['msg', 0], ['black pepper', 251], ['white pepper', 296], ['red pepper flake', 318],
  ['chili flake', 318], ['cayenne', 318], ['smoked paprika', 282], ['paprika', 282], ['cumin', 375],
  ['coriander', 298], ['oregano', 265], ['thyme', 276], ['rosemary', 331], ['cinnamon', 247],
  ['nutmeg', 525], ['chili powder', 282], ['curry powder', 325], ['garam masala', 379], ['fennel', 345],
  ['pepper', 251],
]

export function guessKcalPer100g(name: string): number | undefined {
  const n = name.toLowerCase()
  let best: [string, number] | undefined
  for (const entry of KCAL_PER_100G) {
    if (n.includes(entry[0]) && (!best || entry[0].length > best[0].length)) best = entry
  }
  return best?.[1]
}

/** kcal for one ingredient at its current weight; undefined when there's no data. */
export function ingredientKcal(ing: Ingredient): { kcal: number; estimated: boolean } | undefined {
  if (ing.kcal_per_100g !== undefined) return { kcal: (ing.grams * ing.kcal_per_100g) / 100, estimated: false }
  const guess = guessKcalPer100g(ing.name)
  if (guess === undefined) return undefined
  return { kcal: (ing.grams * guess) / 100, estimated: true }
}

export type KcalSummary = { total: number; missing: string[]; estimated: boolean }

export function recipeKcal(ingredients: Ingredient[]): KcalSummary {
  let total = 0
  let estimated = false
  const missing: string[] = []
  for (const ing of ingredients) {
    const k = ingredientKcal(ing)
    if (!k) {
      if (ing.grams > 0) missing.push(ing.name)
      continue
    }
    total += k.kcal
    estimated ||= k.estimated
  }
  return { total, missing, estimated }
}

/** First number in a servings string: "4", "4 servings", "4-6 people" → 4. */
export function parseServings(servings?: string): number | undefined {
  const m = servings?.match(/\d+(\.\d+)?/)
  const n = m ? Number(m[0]) : NaN
  return n > 0 ? n : undefined
}

export function formatKcal(kcal: number): string {
  const v = kcal >= 100 ? Math.round(kcal / 10) * 10 : Math.round(kcal)
  return `${v.toLocaleString()} kcal`
}
