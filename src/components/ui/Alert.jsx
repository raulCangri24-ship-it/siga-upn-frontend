import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'

function Alert({ message, variant = 'success', onClose }) {
  const isError = variant === 'error'
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
            background: isError ? 'var(--danger-bg)' : 'var(--success-bg)',
            border: `1px solid ${isError ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
            color: isError ? 'var(--danger-text)' : 'var(--success-text)',
            fontSize: '13px', fontWeight: '500',
          }}
        >
          {isError
            ? <XCircle size={16} style={{ flexShrink: 0 }} />
            : <CheckCircle size={16} style={{ flexShrink: 0 }} />}
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
