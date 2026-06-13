import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

const CSS_DARK = `
  :root {
    --bg-app: #0C0F1D;
    --bg-surface: #141828;
    --bg-elevated: #1C2236;
    --bg-hover: rgba(255,255,255,0.04);
    --bg-input: rgba(255,255,255,0.06);
    --border: rgba(255,255,255,0.07);
    --border-input: rgba(255,255,255,0.12);
    --text-primary: #E2E8F0;
    --text-secondary: #8892A4;
    --text-muted: #4A5568;
    --accent: #F5AD27;
    --accent-blue: #4A90E2;
    --success-bg: rgba(16,185,129,0.12);
    --success-text: #34D399;
    --danger-bg: rgba(239,68,68,0.12);
    --danger-text: #F87171;
    --warning-bg: rgba(245,158,11,0.12);
    --warning-text: #FBBF24;
    --info-bg: rgba(59,130,246,0.12);
    --info-text: #93C5FD;
    --purple-bg: rgba(139,92,246,0.12);
    --purple-text: #C4B5FD;
    --table-header: rgba(255,255,255,0.03);
    --table-hover: rgba(255,255,255,0.04);
    --modal-overlay: rgba(0,0,0,0.75);
    --scrollbar-thumb: rgba(255,255,255,0.12);
    --card-shadow: 0 4px 24px rgba(0,0,0,0.4);
    --nav-shadow: 0 1px 0 rgba(255,255,255,0.04);
    --transition: 0.2s ease;
  }
`

const CSS_LIGHT = `
  :root {
    --bg-app: #F0F4F8;
    --bg-surface: #FFFFFF;
    --bg-elevated: #F7FAFC;
    --bg-hover: rgba(0,0,0,0.03);
    --bg-input: #FFFFFF;
    --border: #E2E8F0;
    --border-input: #CBD5E0;
    --text-primary: #1A202C;
    --text-secondary: #4A5568;
    --text-muted: #A0AEC0;
    --accent: #C48A1A;
    --accent-blue: #1A3F7A;
    --success-bg: #D1FAE5;
    --success-text: #065F46;
    --danger-bg: #FEE2E2;
    --danger-text: #991B1B;
    --warning-bg: #FEF3C7;
    --warning-text: #92400E;
    --info-bg: #DBEAFE;
    --info-text: #1E40AF;
    --purple-bg: #EDE9FE;
    --purple-text: #5B21B6;
    --table-header: #F7FAFC;
    --table-hover: #EBF4FF;
    --modal-overlay: rgba(0,0,0,0.45);
    --scrollbar-thumb: rgba(0,0,0,0.15);
    --card-shadow: 0 2px 12px rgba(0,0,0,0.08);
    --nav-shadow: 0 1px 0 #E2E8F0;
    --transition: 0.2s ease;
  }
`

const GLOBAL_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
    background: var(--bg-app);
    color: var(--text-primary);
    transition: background var(--transition), color var(--transition);
    overflow: hidden;
    height: 100vh;
    width: 100vw;
  }

  #root { height: 100%; width: 100%; overflow: hidden; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--border-input); }

  input, select, textarea {
    background: var(--bg-input) !important;
    border: 1px solid var(--border-input) !important;
    color: var(--text-primary) !important;
    border-radius: 8px;
    padding: 9px 12px;
    font-size: 13px;
    width: 100%;
    outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
    font-family: inherit;
  }
  input:focus, select:focus, textarea:focus {
    border-color: rgba(74,144,226,0.5) !important;
    box-shadow: 0 0 0 3px rgba(74,144,226,0.12);
  }
  input::placeholder { color: var(--text-muted); }
  select option { background: var(--bg-surface); color: var(--text-primary); }

  button { font-family: inherit; cursor: pointer; }

  a { color: var(--accent-blue); text-decoration: none; }

  @media (max-width: 768px) {
    .shell-sidebar { display: none !important; }
    .shell-main { padding: 20px 16px !important; }
    .shell-nav { padding: 0 16px !important; }
  }
`

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('siga-theme')
    return saved !== 'light'
  })

  useEffect(() => {
    const existing = document.getElementById('siga-css-vars')
    if (existing) existing.remove()
    const style = document.createElement('style')
    style.id = 'siga-css-vars'
    style.textContent = (isDark ? CSS_DARK : CSS_LIGHT) + GLOBAL_CSS
    document.head.appendChild(style)
    localStorage.setItem('siga-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(p => !p)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
