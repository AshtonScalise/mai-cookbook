import type { Ingredient } from '../lib/schema'
import { MASS_UNITS, type MassUnit } from '../lib/units'

type Props = {
  ingredients: Ingredient[]
  basisIndex: number
  onBasisChange: (i: number) => void
  amount: string
  onAmountChange: (v: string) => void
  unit: MassUnit
  onUnitChange: (u: MassUnit) => void
  factor: number
  onReset: () => void
}

export function ScalePanel(p: Props) {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 space-y-3">
      <div className="text-xs uppercase tracking-wide text-amber-400">I have…</div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          className="w-28 text-lg font-semibold"
          value={p.amount}
          onChange={(e) => p.onAmountChange(e.target.value)}
          autoFocus
        />
        <select value={p.unit} onChange={(e) => p.onUnitChange(e.target.value as MassUnit)}>
          {(Object.keys(MASS_UNITS) as MassUnit[]).map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <span className="text-stone-400">of</span>
        <select value={p.basisIndex} onChange={(e) => p.onBasisChange(Number(e.target.value))}>
          {p.ingredients.map((ing, i) => (
            <option key={i} value={i}>
              {ing.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-stone-400">
          scale <span className="text-stone-200 tabular-nums">×{p.factor.toFixed(2)}</span>
        </span>
        <button className="btn btn-ghost" onClick={p.onReset}>
          Reset
        </button>
      </div>
    </div>
  )
}
