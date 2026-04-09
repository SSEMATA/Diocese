import { useState, useEffect } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import './ThemeSwitcher.css'

export function ThemeSwitcher({ collapsed }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('theme') === 'dark'
  })

  const applyTheme = (dark) => {
    const root = document.documentElement
    if (dark) {
      root.dataset.theme = 'black'
      root.classList.add('theme-dark')
    } else {
      root.dataset.theme = 'default'
      root.classList.remove('theme-dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  useEffect(() => { applyTheme(isDark) }, [isDark])

  const toggle = () => setIsDark(d => !d)

  return (
    <button
      type="button"
      className={`theme-toggle ${collapsed ? 'theme-toggle-collapsed' : ''}`}
      onClick={toggle}
      title={isDark ? 'Switch to light' : 'Switch to dark'}
    >
      <span className="theme-toggle-icon">
        {isDark ? <FiSun /> : <FiMoon />}
      </span>
      {!collapsed && (
        <span className="theme-toggle-label">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  )
}

export default ThemeSwitcher
