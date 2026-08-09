import { motion } from 'framer-motion';

export default function Card({ title, icon, children, className = '', accent = false, actions }) {
  return (
    <motion.div
      className={`glass-card ${accent ? 'glass-card-accent' : ''} ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {(title || actions) && (
        <div className="card-header">
          {title && (
            <div className="card-title">
              {icon && <span className="icon">{icon}</span>}
              <span>{title}</span>
            </div>
          )}
          {actions && <div className="flex items-center gap-sm">{actions}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
