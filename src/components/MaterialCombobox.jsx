import { useEffect, useMemo, useRef, useState } from 'react'

// Text input with a filterable material list; free text is allowed.
function MaterialCombobox({ value, options, onChange, onSelect, onBlur, placeholder, disabled, inputFocus }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [])

  const filteredOptions = useMemo(() => {
    const keyword = value.trim().toLowerCase()
    if (!keyword) return options
    return options.filter((item) => item.toLowerCase().includes(keyword))
  }, [value, options])

  const handleSelect = (item) => {
    setIsOpen(false)
    onSelect(item)
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${inputFocus}`}
        disabled={disabled}
        autoComplete="off"
        required
      />
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Buka senarai material"
        disabled={disabled}
      >
        <svg
          className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="max-h-56 overflow-y-auto p-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  // Keep focus in the input so onBlur doesn't fire for the half-typed text.
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(item)}
                  className="mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 last:mb-0"
                >
                  {item}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-slate-500">Tiada padanan. Anda boleh taip material baharu.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MaterialCombobox
