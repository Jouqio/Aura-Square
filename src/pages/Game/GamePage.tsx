// ============================================================
// GamePage.tsx — Phase 5/6 (daily mode via URL params)
// Owner: Syauqi Nuzul Abdi
// ============================================================

import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence }  from 'framer-motion';

import { TileGrid }           from '../../components/game/TileGrid/TileGrid';
import { PieceBoard }         from '../../components/game/PieceBoard/PieceBoard';
import { GameHUD }            from '../../components/game/GameHUD/GameHUD';
import { WelcomeScreen }      from '../../components/game/overlays/WelcomeScreen';
import { PauseModal }         from '../../components/game/overlays/PauseModal';
import { GameOverModal }      from '../../components/game/overlays/GameOverModal';
import { ComboToast }         from '../../components/game/effects/ComboToast';
import { ScorePopLayer }      from '../../components/game/effects/ScorePop';
import { ShockwaveLayer }     from '../../components/game/effects/ShockwaveLayer';
import { AchievementToast }   from '../../components/game/effects/AchievementToast';
import { MissionToast }       from '../../components/game/effects/MissionToast';

import { useGame }            from '../../hooks/useGame';
import { useDragDrop }        from '../../hooks/useDragDrop';
import { useAchievements }    from '../../hooks/useAchievements';
import { useAudio }           from '../../hooks/useAudio';
import { TileGridModel }      from '../../engine/TileGridModel';

import {
  useGameStore,
  selectLastPlaced,
  selectLastCleared,
  selectComboKey,
  selectComboLabel,
} from '../../store/gameStore';
import { useStatsStore }    from '../../store/statsStore';
import { useDailyStore }    from '../../store/dailyStore';
import {
  usePlayerStore, xpFromGameScore, xpFromDailyRank,
} from '../../store/playerStore';
import { calcRank } from '../../store/dailyStore';
import { useWeeklyStore, calcWeeklyRank, xpFromWeeklyRank } from '../../store/weeklyStore';
import { useMissionStore } from '../../store/missionStore';
import { CalendarIcon } from '../../components/ui/icons/GameIcons';
import { useParticleCanvas } from '../../hooks/useParticleCanvas';
import { GRID_SIZE, TILE_COLORS, MAX_HINTS_PER_GAME } from '../../constants/game.constants';
import { PieceModel }        from '../../engine/PieceModel';
import { findHintForTray, type HintResult } from '../../engine/ScoreEngine';
import { ROUTES }           from '../../router/routes';

export default function GamePage(): React.JSX.Element {
  const navigate              = useNavigate();
  const [searchParams]        = useSearchParams();

  const isDailyMode  = searchParams.get('mode') === 'daily';
  const isWeeklyMode = searchParams.get('mode') === 'weekly';
  const isSeededMode = isDailyMode || isWeeklyMode;
  const seededSeed   = isSeededMode
    ? parseInt(searchParams.get('seed') ?? '0', 10)
    : undefined;
  const dailyDate   = searchParams.get('date') ?? '';
  const weeklyWeek  = searchParams.get('week') ?? '';

  const {
    grid, pieces, score, bestScore, status, hasSavedGame,
    startGame, resumeGame, pauseGame, unpauseGame,
    placePiece, canPieceFitAnywhere,
  } = useGame();

  const lastPlaced  = useGameStore(selectLastPlaced);
  const lastCleared = useGameStore(selectLastCleared);
  const comboKey    = useGameStore(selectComboKey);
  const comboLabel  = useGameStore(selectComboLabel);

  const gridElRef    = useRef<HTMLDivElement>(null);
  const gridModelRef = useRef<TileGridModel>(new TileGridModel());
  useEffect(() => { gridModelRef.current.loadDataFrom(grid); }, [grid]);

  const { drag, ghostMap, startDrag } = useDragDrop({
    pieces, gridRef: gridModelRef, gridElRef,
    onPlace: placePiece, enabled: status === 'playing',
  });

  // Memoized: canPieceFitAnywhere does an exhaustive board scan
  // per piece — without this, that scan reran on every single
  // GamePage re-render (toasts, score pops, etc.), not just when
  // the board or tray actually changed.
  const deadSlots = useMemo(
    () => pieces.map((p) => !!p && !canPieceFitAnywhere(p)),
    [pieces, grid, canPieceFitAnywhere],
  );

  const prevScoreRef = useRef(score);
  const pushPop      = useGameStore((s) => s.pushScorePop);
  useEffect(() => {
    const delta = score - prevScoreRef.current;
    prevScoreRef.current = score;
    if (delta <= 0 || !gridElRef.current) return;
    const rect = gridElRef.current.getBoundingClientRect();
    pushPop({
      id: `${Date.now()}-${Math.random()}`, value: delta,
      x: rect.left + rect.width / 2 - 24,
      y: rect.top  + rect.height / 2 - 40,
      combo: lastCleared.length > 0,
    });
  }, [score, lastCleared, pushPop]);

  const addRecord           = useStatsStore((s) => s.addRecord);
  const addDailyCompletion  = useDailyStore((s) => s.addCompletion);
  const addWeeklyCompletion = useWeeklyStore((s) => s.addCompletion);
  const addXp                = usePlayerStore((s) => s.addXp);
  const recordMissionGame    = useMissionStore((s) => s.recordGame);
  const sessionStart        = useRef(Date.now());
  const sessionStreakRef    = useRef(0);
  const reportSessionStreak = useStatsStore((s) => s.reportSessionStreak);
  const averageScore        = useStatsStore((s) => s.averageScore());

  // Report the final session streak whenever this page is left
  // (navigating Home, or closing the game), so "best session
  // streak ever" stays accurate without needing the player to
  // explicitly end anything.
  useEffect(() => {
    return () => { reportSessionStreak(sessionStreakRef.current); };
  }, [reportSessionStreak]);
  const piecesPlaced        = useRef(0);
  const linesCleared        = useRef(0);
  const maxComboInGame      = useRef(0);
  const { checkAfterGame, pendingToast, clearToast } = useAchievements();
  const [missionToast, setMissionToast] = useState<{
    completed: import('../../store/missionStore').MissionProgress[];
    bonus:     boolean;
  } | null>(null);
  const audio = useAudio();
  const { canvasRef: particleCanvasRef, burst } = useParticleCanvas();

  // ── Hint / Help feature ───────────────────────────────────
  const [hintsRemaining, setHintsRemaining] = useState(MAX_HINTS_PER_GAME);
  const [activeHint, setActiveHint] = useState<HintResult | null>(null);

  const handleHint = useCallback(() => {
    if (hintsRemaining <= 0 || activeHint || status !== 'playing') return;

    const trayPieces = pieces
      .map((p, slotIndex) => (p ? { slotIndex, piece: (() => {
        const m = new PieceModel(); m.loadDataFrom(p); return m;
      })() } : null))
      .filter((x): x is { slotIndex: number; piece: PieceModel } => x !== null);

    const found = findHintForTray(gridModelRef.current, trayPieces);
    if (!found) return; // defensive — game-over detection should prevent reaching this

    setActiveHint(found);
    setHintsRemaining((n) => n - 1);
    audio.click();
  }, [hintsRemaining, activeHint, status, pieces, audio]);

  // Auto-clear the hint highlight after a few seconds so it doesn't
  // linger forever if the player doesn't act on it right away.
  useEffect(() => {
    if (!activeHint) return;
    const timer = setTimeout(() => setActiveHint(null), 4000);
    return () => clearTimeout(timer);
  }, [activeHint]);

  // Clear the hint the instant the board actually changes (the
  // player placed a piece — with or without using the suggestion),
  // since a stale hint would no longer describe a valid move.
  useEffect(() => {
    if (lastPlaced.length > 0) setActiveHint(null);
  }, [lastPlaced]);

  const hintCells = useMemo(() => {
    if (!activeHint) return undefined;
    return new Set(activeHint.cells.map(([r, c]) => `${r}-${c}`));
  }, [activeHint]);

  useEffect(() => {
    if (status === 'playing') {
      sessionStart.current   = Date.now();
      piecesPlaced.current   = 0;
      linesCleared.current   = 0;
      maxComboInGame.current = 0;
    }
  }, [status]);

  useEffect(() => {
    if (lastPlaced.length > 0) piecesPlaced.current++;
  }, [lastPlaced]);

  useEffect(() => {
    if (lastCleared.length > 0) {
      linesCleared.current   += lastCleared.length;
      maxComboInGame.current  = Math.max(maxComboInGame.current, lastCleared.length);

      // Particle burst + shockwave ring at each cleared row/column's
      // screen position.
      const gridEl = gridElRef.current;
      if (gridEl) {
        const rect = gridEl.getBoundingClientRect();
        const cell = rect.width / GRID_SIZE;
        const colors = Object.values(TILE_COLORS);
        const pushShockwave = useGameStore.getState().pushShockwave;
        for (const seq of lastCleared) {
          const x = seq.type === 'line'
            ? rect.left + rect.width / 2
            : rect.left + seq.index * cell + cell / 2;
          const y = seq.type === 'line'
            ? rect.top + seq.index * cell + cell / 2
            : rect.top + rect.height / 2;
          burst(x, y, {
            colors,
            count:  lastCleared.length >= 2 ? 22 : 14, // bigger burst on combos
            spread: 5,
          });
          pushShockwave({
            id: `${Date.now()}-${Math.random()}`,
            x, y,
            axis: seq.type === 'line' ? 'row' : 'col',
            intensity: lastCleared.length,
          });
        }
      }
    }
  }, [lastCleared, burst]);

  const gameOverHandledRef  = useRef(false);

  useEffect(() => {
    if (status !== 'game_over' || score === 0) {
      // Reset the guard once we leave the game_over state
      // (e.g. user starts a new game), so next game over can fire again.
      if (status !== 'game_over') gameOverHandledRef.current = false;
      return;
    }

    // Guard: only run this side-effect ONCE per actual game-over event.
    // Without this, calling addRecord/checkAfterGame updates Zustand
    // stores, which gives addRecord/checkAfterGame new function
    // references on re-render, which would re-trigger this effect via
    // its dependency array — an infinite loop ("Maximum update depth
    // exceeded"). The guard breaks that cycle regardless of how many
    // times the callback references change.
    if (gameOverHandledRef.current) return;
    gameOverHandledRef.current = true;
    sessionStreakRef.current += 1;

    const duration = Date.now() - sessionStart.current;

    addRecord({
      score, date: Date.now(),
      piecesPlaced: piecesPlaced.current,
      linesCleared: linesCleared.current,
      duration,
    });

    // XP: base award for any completed game, scaled by score.
    addXp(xpFromGameScore(score));

    // Daily Mission Board — record this game's results against
    // today's 3 missions, award XP for any that just completed.
    const missionResult = recordMissionGame({
      score,
      linesCleared: linesCleared.current,
      piecesPlaced: piecesPlaced.current,
      maxCombo:     maxComboInGame.current,
    });
    if (missionResult.xpEarned > 0) addXp(missionResult.xpEarned);
    if (missionResult.newlyCompleted.length > 0) {
      setMissionToast({
        completed: missionResult.newlyCompleted,
        bonus:     missionResult.allJustCompleted,
      });
    }

    if (isDailyMode && dailyDate) {
      addDailyCompletion(dailyDate, score);
      // XP: extra bonus for completing the daily challenge,
      // scaled by the rank tier reached this run.
      addXp(xpFromDailyRank(calcRank(score)));
    }

    if (isWeeklyMode && weeklyWeek) {
      addWeeklyCompletion(weeklyWeek, score);
      // XP: bigger bonus for the (rarer) weekly challenge.
      addXp(xpFromWeeklyRank(calcWeeklyRank(score)));
    }

    checkAfterGame({
      score,
      comboInGame:  maxComboInGame.current,
      sessionMs:    duration,
      linesCleared: linesCleared.current,
    });

    // Sound feedback — new best gets a celebratory fanfare,
    // otherwise a neutral descending "game over" tone.
    if (score > 0 && score >= bestScore) {
      audio.newBest();
    } else {
      audio.gameOver();
    }
  }, [status, score, bestScore, addRecord, addDailyCompletion, addXp,
      recordMissionGame, checkAfterGame, isDailyMode, dailyDate,
      isWeeklyMode, weeklyWeek, addWeeklyCompletion, audio]);

  useEffect(() => {
    if (pendingToast) {
      audio.achievement();
      // Burst from roughly where the achievement toast appears
      // (top-center of the screen).
      burst(window.innerWidth / 2, 120, {
        colors: ['#F5C842', '#fde68a', '#a78bfa'],
        count:  20,
        spread: 6,
        gravity: 0.08,
      });
    }
  }, [pendingToast, audio, burst]);

  const showWelcome  = status === 'idle' || status === 'welcome';
  const showPause    = status === 'paused';
  const showGameOver = status === 'game_over';
  const [prevBest, setPrevBest] = useState(bestScore);
  useEffect(() => { if (status === 'game_over') setPrevBest(bestScore); }, [status, bestScore]);
  const isNewBest = score > 0 && score === bestScore && bestScore >= prevBest;

  const resetHints = useCallback(() => {
    setHintsRemaining(MAX_HINTS_PER_GAME);
    setActiveHint(null);
  }, []);
  const handleNewGame   = useCallback(() => { resetHints(); startGame(seededSeed); },  [startGame, seededSeed, resetHints]);
  const handleResume    = useCallback(() => resumeGame(),           [resumeGame]);
  const handlePause     = useCallback(() => pauseGame(),            [pauseGame]);
  const handleUnpause   = useCallback(() => unpauseGame(),          [unpauseGame]);
  const handleQuit      = useCallback(() =>
    navigate(isSeededMode ? ROUTES.DAILY : ROUTES.HOME), [navigate, isSeededMode]);
  const handlePlayAgain = useCallback(() => { resetHints(); startGame(seededSeed); },  [startGame, seededSeed, resetHints]);

  useEffect(() => {
    if (isSeededMode && status === 'idle') {
      startGame(seededSeed);
    }
  }, [isSeededMode, status, startGame, seededSeed]);

  return (
    <div className="game-page">
      {isSeededMode && (
        <div className="daily-mode-badge">
          <CalendarIcon size={13}/>
          {isWeeklyMode ? 'Tantangan Mingguan' : 'Tantangan Harian'}
        </div>
      )}

      <GameHUD score={score} best={bestScore} onPause={handlePause}
        onHint={handleHint} hintsRemaining={hintsRemaining}
        canHint={hintsRemaining > 0 && !activeHint && status === 'playing'}/>

      <div className="game-canvas">
        <TileGrid ref={gridElRef} grid={grid} ghostMap={ghostMap}
          lastPlacedCells={lastPlaced} lastClearedSeqs={lastCleared}
          hintCells={hintCells}/>
      </div>

      <div className="game-tray">
        <PieceBoard pieces={pieces} drag={drag}
          deadSlots={deadSlots} onDragStart={startDrag}
          hintSlotIndex={activeHint?.slotIndex}/>
      </div>

      <ComboToast comboKey={comboKey} comboLabel={comboLabel}/>
      <ScorePopLayer/>
      <ShockwaveLayer/>
      <canvas ref={particleCanvasRef} className="particle-canvas" aria-hidden="true"/>
      <AchievementToast unlock={pendingToast} onClose={clearToast}/>
      <MissionToast data={missionToast} onClose={() => setMissionToast(null)}/>

      <AnimatePresence>
        {showWelcome && !isSeededMode && (
          <WelcomeScreen hasSavedGame={hasSavedGame} bestScore={bestScore}
            onNewGame={handleNewGame} onResume={handleResume}/>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPause && (
          <PauseModal score={score} onResume={handleUnpause} onQuit={handleQuit}/>
        )}
      </AnimatePresence>

      <GameOverModal show={showGameOver} score={score} bestScore={bestScore}
        averageScore={averageScore}
        isNewBest={isNewBest} onPlayAgain={handlePlayAgain} onHome={handleQuit}/>
    </div>
  );
}
