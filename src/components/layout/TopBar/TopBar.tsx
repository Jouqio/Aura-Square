// TopBar.tsx — V3 (i18n-aware)
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion }   from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ROUTES }   from '../../../router/routes';
import { usePlayerStore, selectAvatarEmoji } from '../../../store/playerStore';

export function TopBar(): React.JSX.Element {
  const { t }       = useTranslation();
  const navigate    = useNavigate();
  const location    = useLocation();
  const avatarEmoji = usePlayerStore(selectAvatarEmoji);
  const isHome      = location.pathname === ROUTES.HOME;

  const PAGE_TITLES: Record<string, string> = {
    [ROUTES.HOME]:         '',
    [ROUTES.DAILY]:        t('nav.daily',        { defaultValue: 'Tantangan Harian' }),
    [ROUTES.ACHIEVEMENTS]: t('nav.achievements', { defaultValue: 'Pencapaian' }),
    [ROUTES.LEADERBOARD]:  t('nav.leaderboard',  { defaultValue: 'Klasemen' }),
    [ROUTES.STATISTICS]:   t('nav.statistics',   { defaultValue: 'Statistik' }),
    [ROUTES.PROFILE]:      t('nav.profile',      { defaultValue: 'Profil' }),
    [ROUTES.SETTINGS]:     t('nav.settings',     { defaultValue: 'Pengaturan' }),
    [ROUTES.ABOUT]:        t('common.about',     { defaultValue: 'Tentang' }),
  };
  const title = PAGE_TITLES[location.pathname] ?? '';

  return (
    <header className="sticky top-0 z-40 h-14 w-full flex items-center
      gap-3 px-4 bg-surface-50/90 backdrop-blur-md
      border-b border-surface-300/50">

      <div className="flex items-center gap-3 flex-1 min-w-0">
        {!isHome ? (
          <motion.button whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              text-white/50 hover:text-white hover:bg-surface-300 transition-colors"
            aria-label={t('common.back', { defaultValue: 'Kembali' })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </motion.button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-aura-500
              to-aura-700 flex items-center justify-center">
              <span className="text-white text-xs font-black">A</span>
            </div>
            <span className="font-black text-lg text-white tracking-tight
              hidden sm:block">AURA</span>
          </div>
        )}
        {title && (
          <h1 className="font-bold text-base text-white truncate">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isHome && (
          <motion.button whileTap={{ scale: 0.92 }}
            onClick={() => navigate(ROUTES.GAME)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
              bg-aura-600 hover:bg-aura-500 text-white text-xs font-bold
              transition-colors">
            <span>▶</span><span>{t('common.play_short', { defaultValue: 'Main' })}</span>
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(ROUTES.PROFILE)}
          className="w-9 h-9 rounded-xl bg-surface-200 border border-surface-400
            hover:border-aura-600 transition-colors flex items-center
            justify-center text-xl"
          aria-label={t('nav.profile', { defaultValue: 'Profil' })}>
          {avatarEmoji}
        </motion.button>
      </div>
    </header>
  );
}
