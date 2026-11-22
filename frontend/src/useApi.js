import { useEffect, useState } from 'react'

/* Небольшой хук загрузки данных: loading / error / data + отмена при размонтировании. */

export function useApi(loader, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true })

  useEffect(() => {
    const controller = new AbortController()
    let alive = true
    setState((current) => ({ ...current, loading: true, error: null }))
    loader(controller.signal)
      .then((data) => {
        if (alive) setState({ data, error: null, loading: false })
      })
      .catch((error) => {
        if (!alive || error.name === 'AbortError') return
        setState({ data: null, error, loading: false })
      })
    return () => {
      alive = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
