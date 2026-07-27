// ============================================================
// SettingsPage.tsx — Theme System V2 (Dark/Light/Green Aura)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { useState, useRef } from 'react';
import { useTranslation }  from 'react-i18next';
import { motion }          from 'framer-motion';
import { useNavigate }     from 'react-router-dom';
import { PageWrapper }     from '../../components/layout/PageWrapper/PageWrapper';
import { useTheme }        from '../../hooks/useTheme';
import { useStatsStore }   from '../../store/statsStore';
import { useAchievementStore } from '../../store/achievementStore';
import { ROUTES }          from '../../router/routes';
import type { AppTheme, AppLocale } from '../../types/user.types';
import {
  exportBackup, parseBackupFile, restoreBackup, summarizeBackup,
  type BackupFile, type BackupSummary,
} from '../../services/backup.service';
import {
  DownloadIcon, UploadIcon, AlertTriangleIcon, PhoneInstallIcon, ShareSquareIcon,
} from '../../components/ui/icons/MiscIcons';
import { APP_VERSION } from '../../constants/app.constants';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

const listV = { show: { transition: { staggerChildren: 0.06 } } };
const rowV  = { hidden:{opacity:0,x:-10}, show:{opacity:1,x:0,transition:{duration:0.2}} };

const THEME_PRESETS: {
  value: AppTheme; labelKey: string; fallback: string; bg: string; card: string; primary: string;
}[] = [
  { value: 'dark-aura',  labelKey: 'theme.dark_aura',  fallback: 'Dark Aura',  bg: '#050816', card: '#0f172a', primary: '#8b5cf6' },
  { value: 'light-aura', labelKey: 'theme.light_aura', fallback: 'Light Aura', bg: '#f8fafc', card: '#ffffff', primary: '#7c3aed' },
  { value: 'green-aura', labelKey: 'theme.green_aura', fallback: 'Green Aura', bg: '#07120c', card: '#0d1f16', primary: '#22c55e' },
];

export default function SettingsPage(): React.JSX.Element {
  const { t, i18n }    = useTranslation();
  const navigate       = useNavigate();
  const {
    theme, locale, soundEnabled, musicEnabled, vibrationEnabled, reducedMotion,
    setTheme, setLocale, setSound, setMusic, setVibration, setReducedMotion,
  }                    = useTheme();
  const clearHistory   = useStatsStore((s)    => s.clearHistory);
  const {
    installed, canPromptInstall, isIosManualInstall, promptInstall,
  } = useInstallPrompt();
  const [installOutcome, setInstallOutcome] = useState<'dismissed' | null>(null);

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === 'dismissed') {
      setInstallOutcome('dismissed');
      setTimeout(() => setInstallOutcome(null), 3000);
    }
  };
  const [modal, setModal] = useState<'data' | 'restore' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingBackup, setPendingBackup] = useState<{ file: BackupFile; summary: BackupSummary } | null>(null);
  const [backupError, setBackupError]     = useState('');
  const [exportToast, setExportToast]     = useState(false);
  const [restoring, setRestoring]         = useState(false);

  const handleExport = () => {
    exportBackup(APP_VERSION);
    setExportToast(true);
    setTimeout(() => setExportToast(false), 2600);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    setBackupError('');
    try {
      const parsed  = await parseBackupFile(file);
      const summary = summarizeBackup(parsed);
      setPendingBackup({ file: parsed, summary });
      setModal('restore');
    } catch (err) {
      setBackupError(
        err instanceof Error && err.message
          ? err.message
          : t('settings.backup_error_read', { defaultValue: 'Gagal membaca file. Pastikan file tidak rusak.' }),
      );
    }
  };

  const handleConfirmRestore = () => {
    if (!pendingBackup) return;
    setRestoring(true);
    restoreBackup(pendingBackup.file);
    // Full reload — every Zustand store re-hydrates cleanly from the
    // freshly-written localStorage values this way, rather than
    // trying to force every single store to re-read state in place.
    setTimeout(() => window.location.reload(), 900);
  };

  const localeOpts: { value: AppLocale; label: string }[] = [
    { value: 'id', label: 'Indonesia' },
    { value: 'en', label: 'English'   },
  ];

  return (
    <PageWrapper>
      <motion.div variants={listV} initial="hidden" animate="show"
        className="flex flex-col gap-6">

        <motion.h1 variants={rowV} className="text-xl font-bold text-white">
          {t('settings.title_main', { defaultValue: 'Pengaturan' })}
        </motion.h1>

        {/* ── Install App CTA — hidden once already installed ── */}
        {!installed && (
          <motion.div variants={rowV}>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-1 mb-2">
              {t('settings.install_section', { defaultValue: 'Install Aplikasi' })}
            </p>

            {canPromptInstall ? (
              <div className="rounded-2xl bg-aura-950/50 border border-aura-800/40 p-4
                flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-aura-800/40 flex items-center
                  justify-center flex-shrink-0">
                  <PhoneInstallIcon size={20} className="text-aura-300"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">
                    {t('settings.install_title', { defaultValue: 'Pasang Aura Square' })}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                    {installOutcome === 'dismissed'
                      ? t('settings.install_dismissed', { defaultValue: 'Kamu bisa pasang lagi kapan saja dari sini.' })
                      : t('settings.install_desc', { defaultValue: 'Main lebih cepat dan mulus — pasang sebagai aplikasi di perangkatmu.' })}
                  </p>
                </div>
                <button
                  onClick={handleInstall}
                  className="flex-shrink-0 px-3 py-2 rounded-xl bg-aura-600
                    hover:bg-aura-500 text-white text-xs font-bold transition-colors"
                >
                  {t('settings.install_cta', { defaultValue: 'Pasang' })}
                </button>
              </div>
            ) : isIosManualInstall ? (
              <div className="rounded-2xl bg-surface-200 border border-surface-400 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShareSquareIcon size={16} className="text-aura-300"/>
                  <p className="text-sm font-bold text-white">
                    {t('settings.install_ios_title', { defaultValue: 'Cara pasang di iPhone/iPad' })}
                  </p>
                </div>
                <div className="flex flex-col gap-1 text-xs text-white/50 leading-relaxed">
                  <span>{t('settings.install_ios_step1', { defaultValue: '1. Tap ikon Bagikan di Safari' })}</span>
                  <span>{t('settings.install_ios_step2', { defaultValue: '2. Pilih "Tambah ke Layar Utama"' })}</span>
                  <span>{t('settings.install_ios_step3', { defaultValue: '3. Tap "Tambah" di pojok kanan atas' })}</span>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* ── Theme picker — 3 named Aura presets ────────────── */}
        <motion.div variants={rowV} className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-1">
            {t('theme.section_title', { defaultValue: 'Tema' })}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_PRESETS.map((p) => {
              const active = theme === p.value;
              return (
                <motion.button
                  key={p.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(p.value)}
                  className={`theme-swatch ${active ? 'theme-swatch--active' : ''}`}
                  style={{ background: p.bg }}
                >
                  <span className="theme-swatch__card" style={{ background: p.card }}>
                    <span className="theme-swatch__dot" style={{ background: p.primary }}/>
                  </span>
                  <span className="theme-swatch__label" style={{ color: p.primary }}>
                    {t(p.labelKey, { defaultValue: p.fallback })}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="theme-active-ring"
                      className="theme-swatch__ring"
                      style={{ borderColor: p.primary }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
          <p className="text-xs text-white/25 px-1">
            {t('theme.autosave_note', { defaultValue: 'Tema tersimpan otomatis di perangkat ini.' })}
          </p>
        </motion.div>

        <Section title={t('nav.language', { defaultValue: 'Bahasa' })}>
          <Row label={t('settings.language_app', { defaultValue: 'Bahasa Aplikasi' })}>
            <Seg options={localeOpts} value={locale}
              onChange={(v) => setLocale(v as AppLocale)} />
          </Row>
        </Section>

        <Section title={`${t('settings.sound_effects')} & ${t('settings.vibration', { defaultValue: 'Getaran' })}`}>
          <Row label={t('settings.sound_effects')}>
            <Toggle value={soundEnabled} onChange={setSound} />
          </Row>
          <Row label={t('settings.music')}>
            <Toggle value={musicEnabled} onChange={setMusic} />
          </Row>
          <Row label={t('settings.vibration', { defaultValue: 'Getaran' })}>
            <Toggle value={vibrationEnabled} onChange={setVibration} />
          </Row>
        </Section>

        <Section title={t('settings.accessibility_section', { defaultValue: 'Aksesibilitas' })}>
          <Row label={t('settings.reduced_motion', { defaultValue: 'Kurangi Animasi' })}>
            <Toggle value={reducedMotion} onChange={setReducedMotion} />
          </Row>
          <div className="px-4 py-2.5">
            <p className="text-xs text-white/35 leading-relaxed">
              {t('settings.reduced_motion_desc', { defaultValue: 'Mengurangi partikel, shockwave, dan animasi gerak besar lainnya. Otomatis aktif juga jika sistem perangkatmu sudah mengatur preferensi gerakan minim.' })}
            </p>
          </div>
        </Section>

        <Section title={t('settings.profile_section', { defaultValue: 'Profil' })}>
          <div className="px-4 py-3">
            <button
              onClick={() => navigate(ROUTES.PROFILE)}
              className="text-sm text-aura-400 hover:text-aura-300 transition-colors"
            >
              {t('settings.edit_name_avatar', { defaultValue: 'Edit nama & avatar →' })}
            </button>
          </div>
        </Section>

        <Section title={t('settings.data_section', { defaultValue: 'Data' })}>
          <div className="px-4 py-3 flex flex-col gap-2">
            <p className="text-xs text-white/40 leading-relaxed">
              {t('settings.data_note', { defaultValue: 'Semua data disimpan lokal di perangkat ini. Tidak ada server, tidak ada akun.' })}
            </p>
          </div>

          {/* Export */}
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80">
                {t('settings.backup_export', { defaultValue: 'Simpan Cadangan (Backup)' })}
              </p>
              <p className="text-xs text-white/35 mt-0.5 leading-relaxed">
                {t('settings.backup_export_desc', { defaultValue: 'Unduh semua progress, skor, dan pencapaianmu sebagai file. Simpan file ini di tempat aman.' })}
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                bg-aura-600 hover:bg-aura-500 text-white text-xs font-bold
                transition-colors flex-shrink-0"
            >
              <DownloadIcon size={14}/>
            </button>
          </div>

          {/* Import */}
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80">
                {t('settings.backup_import', { defaultValue: 'Pulihkan dari Cadangan' })}
              </p>
              <p className="text-xs text-white/35 mt-0.5 leading-relaxed">
                {t('settings.backup_import_desc', { defaultValue: 'Punya file backup? Pulihkan progress dari sana.' })}
              </p>
              {backupError && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
                  <AlertTriangleIcon size={12}/> {backupError}
                </p>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                bg-surface-300 border border-surface-400 hover:border-aura-600
                text-white/70 hover:text-white text-xs font-bold
                transition-colors flex-shrink-0"
            >
              <UploadIcon size={14}/>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileSelected}
              className="hidden"
            />
          </div>

          <div className="px-4 py-3">
            <button
              onClick={() => setModal('data')}
              className="text-sm text-red-400/70 hover:text-red-400
                transition-colors self-start"
            >
              {t('settings.clear_data', { defaultValue: 'Hapus semua data & riwayat' })}
            </button>
          </div>
        </Section>

        <motion.div variants={rowV} className="text-center text-xs text-white/20 pb-2">
          {t('settings.footer', { defaultValue: 'Aura Square v3.0 · Offline-First · MIT License' })}
        </motion.div>

      </motion.div>

      {modal === 'data' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center
          justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm bg-surface-200 border
              border-surface-400 rounded-3xl p-5"
          >
            <p className="text-sm text-white/80 text-center mb-2">
              {t('settings.clear_data_confirm', { defaultValue: 'Hapus semua data?' })}
            </p>
            <p className="text-xs text-red-400 text-center mb-5">
              {t('settings.clear_data_warning', { defaultValue: 'Riwayat, statistik, dan pencapaian akan terhapus permanen.' })}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-surface-400
                  text-sm font-medium text-white/70 hover:text-white transition-colors">
                {t('settings.cancel', { defaultValue: 'Batal' })}
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  useAchievementStore.setState({ unlocked: [], maxComboEver: 0, longestSession: 0 });
                  setModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500
                  text-sm font-bold text-white transition-colors">
                {t('settings.delete', { defaultValue: 'Hapus' })}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {modal === 'restore' && pendingBackup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center
          justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm bg-surface-200 border
              border-surface-400 rounded-3xl p-5"
          >
            {restoring ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-8 h-8 border-2 border-aura-600 border-t-transparent
                  rounded-full animate-spin"/>
                <p className="text-sm text-white/70 text-center">
                  {t('settings.backup_success', { defaultValue: 'Data berhasil dipulihkan! Memuat ulang...' })}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-white/80 text-center mb-1">
                  {t('settings.backup_confirm_title', { defaultValue: 'Pulihkan data ini?' })}
                </p>
                <p className="text-xs text-red-400 text-center mb-4">
                  {t('settings.backup_confirm_warning', { defaultValue: 'Data saat ini akan DIGANTI dengan isi file backup. Tindakan ini tidak bisa dibatalkan.' })}
                </p>

                {/* Preview */}
                <div className="rounded-2xl bg-surface-300 border border-surface-400
                  p-3 mb-4 flex flex-col gap-1.5 text-xs">
                  {pendingBackup.summary.playerName && (
                    <div className="flex justify-between">
                      <span className="text-white/40">{t('settings.backup_preview_name', { defaultValue: 'Nama pemain' })}</span>
                      <span className="text-white font-medium">{pendingBackup.summary.playerName}</span>
                    </div>
                  )}
                  {pendingBackup.summary.bestScore !== null && (
                    <div className="flex justify-between">
                      <span className="text-white/40">{t('settings.backup_preview_best', { defaultValue: 'Skor terbaik' })}</span>
                      <span className="text-white font-mono font-bold">{pendingBackup.summary.bestScore.toLocaleString()}</span>
                    </div>
                  )}
                  {pendingBackup.summary.totalGames !== null && (
                    <div className="flex justify-between">
                      <span className="text-white/40">{t('settings.backup_preview_games', { defaultValue: 'Total game' })}</span>
                      <span className="text-white font-medium">{pendingBackup.summary.totalGames}</span>
                    </div>
                  )}
                  {pendingBackup.summary.exportedAt && (
                    <div className="flex justify-between">
                      <span className="text-white/40">{t('settings.backup_preview_date', { defaultValue: 'Tanggal backup' })}</span>
                      <span className="text-white/70">
                        {new Date(pendingBackup.summary.exportedAt).toLocaleDateString(
                          i18n.language === 'en' ? 'en-US' : 'id-ID',
                          { day: '2-digit', month: 'short', year: 'numeric' },
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setModal(null); setPendingBackup(null); }}
                    className="flex-1 py-2.5 rounded-xl border border-surface-400
                      text-sm font-medium text-white/70 hover:text-white transition-colors">
                    {t('settings.cancel', { defaultValue: 'Batal' })}
                  </button>
                  <button onClick={handleConfirmRestore}
                    className="flex-1 py-2.5 rounded-xl bg-aura-600 hover:bg-aura-500
                      text-sm font-bold text-white transition-colors">
                    {t('settings.backup_restore_cta', { defaultValue: 'Ya, Pulihkan' })}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Export success toast */}
      {exportToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
            bg-surface-200 border border-aura-600/40 rounded-2xl
            px-4 py-3 flex items-center gap-2 shadow-lg"
        >
          <DownloadIcon size={14} className="text-aura-400"/>
          <span className="text-sm text-white/80">
            {t('settings.backup_exported_toast', { defaultValue: 'Backup berhasil diunduh!' })}
          </span>
        </motion.div>
      )}
    </PageWrapper>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={rowV} className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-1 mb-2">
        {title}
      </p>
      <div className="rounded-2xl bg-surface-200 border border-surface-400
        overflow-hidden divide-y divide-surface-400">
        {children}
      </div>
    </motion.div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <span className="text-sm font-medium text-white/80">{label}</span>
      {children}
    </div>
  );
}
function Seg<T extends string>({ options, value, onChange }: {
  options:{value:T;label:string}[]; value:T; onChange:(v:T)=>void;
}) {
  return (
    <div className="flex gap-1 bg-surface-300 rounded-lg p-0.5">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors
            ${value===o.value
              ? 'bg-aura-600 text-white'
              : 'text-white/40 hover:text-white/70'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
function Toggle({ value, onChange }: { value:boolean; onChange:(v:boolean)=>void }) {
  return (
    <button role="switch" aria-checked={value} onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200
        ${value ? 'bg-aura-600' : 'bg-surface-400'}`}>
      <motion.div layout transition={{ type:'spring', stiffness:700, damping:35 }}
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm
          ${value ? 'left-5' : 'left-0.5'}`}/>
    </button>
  );
}
