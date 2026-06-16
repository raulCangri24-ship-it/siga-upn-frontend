import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

const VARIANT_STYLES = {
  success: {
    bg: 'var(--success-bg)',
    border: 'rgba(16,185,129,0.2)',
    color: 'var(--success-text)',
    Icon: CheckCircle,
  },
  error: {
    bg: 'var(--danger-bg)',
    border: 'rgba(239,68,68,0.2)',
    color: 'var(--danger-text)',
    Icon: XCircle,
  },
  warning: {
    bg: '#fef3c7',
    border: 'rgba(146,64,14,0.2)',
    color: '#92400e',
    Icon: AlertTriangle,
  },
}

function Alert({ message, variant = 'success', onClose }) {
  const s = VARIANT_STYLES[variant] || VARIANT_STYLES.success
  const { Icon } = s
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
            background: s.bg,
            border: `1px solid ${s.border}`,
            color: s.color,
            fontSize: '13px', fontWeight: '500',
          }}
        >
          <Icon size={16} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{message}</span>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6, display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Alert
