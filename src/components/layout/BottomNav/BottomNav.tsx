// BottomNav.tsx — V3 (i18n-aware)
import React from 'react';
import { NavLink }  from 'react-router-dom';
import { motion }   from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ROUTES }   from '../../../router/routes';
import { useAchievementStore, selectUnlockedCount } from '../../../store/achievementStore';
import { useDailyStore, getTodayString }             from '../../../store/dailyStore';
import { ACHIEVEMENTS }                               from '../../../constants/achievement.constants';

export function BottomNav(): React.JSX.Element {
  const { t }      = useTranslation();
  const unlocked   = useAchievementStore(selectUnlockedCount);
  const total      = ACHIEVEMENTS.length;
  const today      = getTodayString();
  const dailyDone  = useDailyStore((s) => !!s.getCompletion(today));

  const NAV = [
    { to: ROUTES.HOME,         label: t('nav.home',         { defaultValue: 'Beranda' }),    Icon: HomeIco     },
    { to: ROUTES.DAILY,        label: t('nav.daily',        { defaultValue: 'Harian' }),     Icon: CalendarIco },
    { to: ROUTES.ACHIEVEMENTS, label: t('nav.achievements', { defaultValue: 'Pencapaian' }), Icon: TrophyIco   },
    { to: ROUTES.LEADERBOARD,  label: t('nav.leaderboard',  { defaultValue: 'Klasemen' }),   Icon: ChartIco    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto
      bg-surface-100/95 backdrop-blur-md border-t border-surface-300/60
      flex items-stretch justify-around h-16">
      {NAV.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} end={to === ROUTES.HOME} className="flex-1">
          {({ isActive }) => (
            <motion.div whileTap={{ scale: 0.85 }}
              className="flex flex-col items-center justify-center
                gap-0.5 h-full cursor-pointer">
              <div className="relative">
                <Icon active={isActive}/>
                {to === ROUTES.DAILY && (
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5
                    rounded-full border border-surface-100 flex items-center
                    justify-center text-[7px] font-black
                    ${dailyDone ? 'bg-green-500' : 'bg-orange-500'}`}>
                    {dailyDone ? '✓' : ''}
                  </span>
                )}
                {to === ROUTES.ACHIEVEMENTS && unlocked < total && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full
                    bg-aura-500 border border-surface-100"/>
                )}
                {isActive && (
                  <motion.div layoutId="nav-dot"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2
                      w-1 h-1 rounded-full bg-aura-500"
                    transition={{ type:'spring', stiffness:500, damping:30 }}/>
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide
                transition-colors
                ${isActive ? 'text-aura-400' : 'text-white/35'}`}>
                {label}
              </span>
            </motion.div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

const C = (a: boolean) => a ? 'rgb(139 115 255)' : 'rgba(255,255,255,0.35)';
const W = (a: boolean) => a ? 2 : 1.75;

function HomeIco({ active: a }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={C(a)} strokeWidth={W(a)} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>;
}
function CalendarIco({ active: a }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={C(a)} strokeWidth={W(a)} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
    {a && <path d="M8 14l3 3 5-5" strokeWidth="2"/>}
  </svg>;
}
function TrophyIco({ active: a }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={C(a)} strokeWidth={W(a)} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>;
}
function ChartIco({ active: a }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={C(a)} strokeWidth={W(a)} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
  </svg>;
}
