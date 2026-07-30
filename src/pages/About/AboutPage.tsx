// ============================================================
// AboutPage.tsx — V3 (accurate version/feature content, full i18n)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React from 'react';
import { motion }         from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PageWrapper }    from '../../components/layout/PageWrapper/PageWrapper';
import { ACHIEVEMENTS }   from '../../constants/achievement.constants';
import { APP_VERSION }    from '../../constants/app.constants';
import { CheckIcon }      from '../../components/ui/icons/MiscIcons';

const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const item    = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function AboutPage(): React.JSX.Element {
  const { t } = useTranslation();

  const features = [
    t('about.feature_zero_login',  { defaultValue: 'Tanpa login, langsung main' }),
    t('about.feature_offline',     { defaultValue: 'Offline-first — bisa di-install seperti aplikasi' }),
    t('about.feature_daily',       { defaultValue: 'Tantangan Harian & Mingguan' }),
    t('about.feature_achievements',{
      defaultValue: `${ACHIEVEMENTS.length} Pencapaian di 7 kategori`,
      count: ACHIEVEMENTS.length,
    }),
    t('about.feature_missions',    { defaultValue: 'Misi Harian dengan reward XP' }),
    t('about.feature_progression', { defaultValue: 'Sistem Level, Rank, Title & Badge' }),
    t('about.feature_themes',      { defaultValue: '4 tema visual: Dark, Light, Green, Celestial Aura' }),
    t('about.feature_a11y',        { defaultValue: 'Dukungan kurangi animasi & getaran' }),
  ];

  return (
    <PageWrapper>
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="flex flex-col gap-6">

        {/* Logo + version */}
        <motion.div variants={item} className="flex flex-col items-center gap-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aura-500
            to-aura-700 flex items-center justify-center shadow-aura">
            <span className="text-white text-3xl font-black">A</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">AURA SQUARE</h1>
            <p className="text-xs text-aura-300 mt-0.5">
              {t('about.tagline', { defaultValue: 'Isi. Sapu. Menang.' })}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold
            bg-surface-300 border border-surface-400 text-white/50">
            {t('about.version_label', { defaultValue: `Versi ${APP_VERSION}`, version: APP_VERSION })}
          </span>
        </motion.div>

        {/* Description */}
        <motion.div variants={item}
          className="rounded-2xl bg-surface-200 border border-surface-400 p-4">
          <p className="text-sm text-white/70 leading-relaxed text-center">
            {t('about.description', {
              defaultValue: 'Aura Square adalah game puzzle block premium, offline-first, dan tanpa login. Mainkan langsung — semua data tersimpan lokal di perangkatmu.',
            })}
          </p>
        </motion.div>

        {/* Feature list */}
        <motion.div variants={item}>
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-1 mb-2">
            {t('about.features_title', { defaultValue: 'Fitur' })}
          </p>
          <div className="rounded-2xl bg-surface-200 border border-surface-400
            overflow-hidden divide-y divide-surface-400">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <CheckIcon size={14} className="text-aura-400 flex-shrink-0"/>
                <span className="text-sm text-white/70">{f}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div variants={item}
          className="rounded-2xl bg-surface-200 border border-surface-400 p-4">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">
            {t('about.privacy_title', { defaultValue: 'Privasi' })}
          </p>
          <p className="text-xs text-white/50 leading-relaxed">
            {t('about.privacy_desc', {
              defaultValue: 'Aura Square tidak mengumpulkan data pribadi apapun. Semua statistik, pencapaian, dan preferensi tersimpan hanya di localStorage perangkatmu.',
            })}
          </p>
        </motion.div>

        {/* Credits */}
        <motion.div variants={item} className="text-center pb-2">
          <p className="text-xs text-white/30">
            {t('about.engine_credit', { defaultValue: 'Engine permainan terinspirasi dari' })}{' '}
            <a href="https://github.com/ryanbalieiro/fill-the-square" target="_blank" rel="noreferrer"
              className="text-aura-400 hover:text-aura-300 transition-colors">
              fill-the-square
            </a>
          </p>
          <p className="text-xs text-white/20 mt-1">
            {t('about.made_by', { defaultValue: 'Dibuat oleh' })} Syauqi Nuzul Abdi · {t('about.license', { defaultValue: 'Lisensi MIT' })}
          </p>
        </motion.div>

      </motion.div>
    </PageWrapper>
  );
}
