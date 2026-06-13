import { useRef, useEffect, useState } from 'react'

const GLOW_COLORS = {
  blue:   '59, 130, 246',
  purple: '139, 92, 246',
  green:  '16, 185, 129',
  red:    '239, 68, 68',
  orange: '245, 158, 11',
}

let _uid = 0

function GlowCard({ children, glowColor = 'blue', width, height, style = {}, onClick }) {
  const cardRef = useRef(null)
  const [id] = useState(() => `gc${++_uid}`)
  const rgb = GLOW_COLORS[glowColor] || GLOW_COLORS.blue

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const onMove = (e) => {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - r.left}px`)
      card.style.setProperty('--my', `${e.clientY - r.top}px`)
    }

    card.addEventListener('mousemove', onMove)
    return () => card.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <style>{`
        .${id} {
          --mx: 50%;
          --my: 50%;
          position: relative;
          overflow: hidden;
          background: var(--bg-surface, #fff);
          border-radius: 16px;
          border: 1px solid var(--border, #e5e7eb);
          box-shadow: var(--card-shadow, 0 2px 8px rgba(0,0,0,0.05));
          cursor: pointer;
          transition: box-shadow 0.25s ease;
          box-sizing: border-box;
        }
        .${id}:hover {
          box-shadow: 0 12px 32px rgba(0,0,0,0.18);
        }
        .${id}::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            circle 200px at var(--mx) var(--my),
            rgba(${rgb}, 0.12) 0%,
            transparent 65%
          );
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .${id}:hover::before {
          opacity: 1;
        }
        .${id}::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 1px solid rgba(${rgb}, 0);
          pointer-events: none;
          z-index: 0;
          transition: border-color 0.3s ease;
        }
        .${id}:hover::after {
          border-color: rgba(${rgb}, 0.4);
        }
        .${id} > * {
          position: relative;
          z-index: 1;
        }
      `}</style>
      <div
        ref={cardRef}
        className={id}
        onClick={onClick}
        style={{ width, height, ...style }}
      >
        {children}
      </div>
    </>
  )
}

export default GlowCard
