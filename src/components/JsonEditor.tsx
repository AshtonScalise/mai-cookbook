type Props = {
  value: string
  onChange: (v: string) => void
  errors: string[]
  onFormat: () => void
}

export function JsonEditor({ value, onChange, errors, onFormat }: Props) {
  return (
    <div className="space-y-2">
      <textarea
        className="w-full min-h-[28rem] font-mono text-xs leading-relaxed"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex items-start justify-between gap-4">
        <ul className="text-sm text-red-300 space-y-1">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
        <button type="button" className="btn btn-ghost shrink-0" onClick={onFormat}>
          Format
        </button>
      </div>
    </div>
  )
}
