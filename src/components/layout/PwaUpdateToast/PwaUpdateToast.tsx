// ============================================================
// PwaUpdateToast.tsx
// Aura Square — "New version available" / "Ready offline" toast
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePwaUpdate } from '../../../hooks/usePwaUpdate';
import { DownloadIcon, CheckIcon } from '../../ui/icons/MiscIcons';

export function PwaUpdateToast(): React.JSX.Element {
  const { t } = useTranslation();
  const {
    needRefresh, offlineReady,
    applyUpdate, dismissUpdate, dismissOfflineReady,
  } = usePwaUpdate();

  // "New version" takes priority — if somehow both are true at
  // once, the update prompt is more actionable/important.
  const mode: 'update' | 'offline' | null =
    needRefresh ? 'update' : offlineReady ? 'offline' : null;

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="pwa-update-toast"
        >
          <div className="pwa-update-toast__icon">
            {mode === 'update'
              ? <DownloadIcon size={18}/>
              : <CheckIcon size={18}/>}
          </div>
          <div className="pwa-update-toast__body">
            <p className="pwa-update-toast__title">
              {mode === 'update'
                ? t('common.pwa_update_title', { defaultValue: 'Versi baru tersedia' })
                : t('common.pwa_offline_title', { defaultValue: 'Siap dipakai offline' })}
            </p>
            <p className="pwa-update-toast__desc">
              {mode === 'update'
                ? t('common.pwa_update_desc', { defaultValue: 'Muat ulang untuk memperbarui.' })
                : t('common.pwa_offline_desc', { defaultValue: 'Aura Square kini bisa dimainkan tanpa internet.' })}
            </p>
          </div>
          {mode === 'update' ? (
            <div className="pwa-update-toast__actions">
              <button onClick={applyUpdate} className="pwa-update-toast__btn pwa-update-toast__btn--primary">
                {t('common.refresh', { defaultValue: 'Muat Ulang' })}
              </button>
              <button onClick={dismissUpdate} className="pwa-update-toast__btn">
                {t('common.later', { defaultValue: 'Nanti' })}
              </button>
            </div>
          ) : (
            <button onClick={dismissOfflineReady} className="pwa-update-toast__btn">
              {t('common.ok', { defaultValue: 'Oke' })}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
