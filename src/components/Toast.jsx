import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

let toastTimeout = null;
let setGlobalToast = null;

export function showToast(message, duration = 2500) {
  if (setGlobalToast) {
    setGlobalToast({ message, visible: true });
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      setGlobalToast(prev => ({ ...prev, visible: false }));
    }, duration);
  }
}

export default function Toast() {
  const [state, setState] = useState({ message: '', visible: false });

  useEffect(() => {
    setGlobalToast = setState;
    return () => { setGlobalToast = null; };
  }, []);

  return createPortal(
    <AnimatePresence>
      {state.visible && (
        <motion.div
          className="toast-container"
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.25 }}
        >
          <div className="toast">{state.message}</div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
