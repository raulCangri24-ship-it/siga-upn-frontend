import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

function Modal({ open, onClose, title, children, width = '480px' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'var(--modal-overlay)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              width, maxWidth: '100%',
              maxHeight: '90vh', overflowY: 'auto',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {title && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px 0',
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div style={{ padding: '20px 24px 24px' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
