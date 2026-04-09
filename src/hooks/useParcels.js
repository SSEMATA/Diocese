import { useState, useCallback } from 'react'
import landData from '../data/land.js'

const STORAGE_KEY = 'fp_diocese_parcels'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return landData.parcels
}

function save(parcels) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parcels)) } catch {}
}

export function useParcels() {
  const [parcels, setParcels] = useState(load)

  const updateParcel = useCallback((updated) => {
    setParcels(prev => {
      const next = prev.map(p => p.id === updated.id ? { ...p, ...updated } : p)
      save(next)
      return next
    })
  }, [])

  return { parcels, updateParcel }
}
