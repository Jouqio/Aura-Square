import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ComboToastProps {
  comboKey:   string;   // changes to re-trigger
  comboLabel: string;
}

export function ComboToast({ comboKey, comboLabel }: ComboToastProps): React.JSX.Element {
  return (
    <AnimatePresence mode="wait">
      {comboLabel && (
        <motion.div
          key={comboKey}
          className="combo-toast"
          initial={{ opacity: 0, scale: 0.4, y: 0 }}
          animate={{ opacity: 1, scale: 1.1, y: -10 }}
          exit={{   opacity: 0, scale: 0.9,  y: -40 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        >
          {comboLabel}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
