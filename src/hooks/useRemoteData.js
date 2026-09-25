import { useCallback, useEffect, useState } from 'react'

// Runs `loader` on mount and on every reload(). `loader` must be a stable (module-level) function.
// On failure the previous data is kept and `error` is set.
export function useRemoteData(loader, initialData) {
  const [state, setState] = useState({ data: initialData, isLoading: true, error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    loader().then(
      (data) => {
        if (!cancelled) setState({ data, isLoading: false, error: null })
      },
      (error) => {
        console.error(error)
        if (!cancelled) setState((prev) => ({ ...prev, isLoading: false, error }))
      },
    )
    return () => {
      cancelled = true
    }
  }, [loader, version])

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }))
    setVersion((value) => value + 1)
  }, [])

  return { ...state, reload }
}
