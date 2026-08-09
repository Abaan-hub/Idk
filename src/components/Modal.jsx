import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children, width = 480 }) {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content"
          style={{ maxWidth: width }}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="btn-icon sm btn-ghost" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
