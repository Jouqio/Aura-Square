// ============================================================
// backup.service.ts
// Aura Square — Data Backup & Restore
// Owner: Syauqi Nuzul Abdi
// ============================================================
// Since Aura Square is zero-login and offline-first, ALL progress
// (score history, achievements, daily/weekly streaks, missions,
// player profile, XP, UI preferences) lives ONLY in this browser's
// localStorage. Clearing browser data, switching devices, or
// reinstalling as a PWA on a new device permanently loses it —
// there is no server-side account to fall back to.
//
// This service lets the player export everything into one JSON
// file they control, and import it back later (same device, after
// a browser reset, or on a different device entirely).

/** Every Zustand-persisted localStorage key used across the app.
 *  Keep this in sync with each store's `persist({ name: ... })` —
 *  see the grep-audit in the corresponding dev session for the
 *  authoritative list. Missing a key here means it silently isn't
 *  backed up, so any NEW persisted store must be added here too. */
const BACKUP_KEYS = [
  'aura-game-v1',
  'aura-stats-v1',
  'aura-achievements-v1',
  'aura-daily-v1',
  'aura-weekly-v1',
  'aura-missions-v1',
  'aura-player-v1',
  'aura-ui-prefs',
] as const;

const BACKUP_FORMAT_VERSION = 1;

export interface BackupFile {
  app:              'aura-square';
  formatVersion:    number;
  appVersion:       string;
  exportedAt:       string; // ISO timestamp
  data:             Record<string, string>; // localStorage key -> raw JSON string
}

/** Reads a light summary (best score, level, etc.) from the raw
 *  backup data, purely for display in the confirmation UI before
 *  the player commits to importing — never used for the actual
 *  restore logic itself. */
export interface BackupSummary {
  bestScore:    number | null;
  totalGames:   number | null;
  playerName:   string | null;
  exportedAt:   string | null;
}

/**
 * Collects every known Aura Square localStorage key into a single
 * downloadable JSON blob and triggers a browser download.
 */
export function exportBackup(appVersion: string): void {
  const data: Record<string, string> = {};

  for (const key of BACKUP_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }

  const backup: BackupFile = {
    app:           'aura-square',
    formatVersion: BACKUP_FORMAT_VERSION,
    appVersion,
    exportedAt:    new Date().toISOString(),
    data,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);

  const a = document.createElement('a');
  a.href = url;
  a.download = `aura-square-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Validates that a parsed JSON object actually looks like an Aura
 *  Square backup file before we attempt anything with it. */
export function isValidBackup(obj: unknown): obj is BackupFile {
  if (typeof obj !== 'object' || obj === null) return false;
  const b = obj as Partial<BackupFile>;
  return b.app === 'aura-square'
    && typeof b.formatVersion === 'number'
    && typeof b.data === 'object' && b.data !== null;
}

/** Extracts a small human-readable summary from a backup file, for
 *  the "you're about to restore this data" confirmation screen. */
export function summarizeBackup(backup: BackupFile): BackupSummary {
  let bestScore  : number | null = null;
  let totalGames : number | null = null;
  let playerName : string | null = null;

  try {
    const stats = backup.data['aura-stats-v1'];
    if (stats) {
      const parsed = JSON.parse(stats);
      bestScore  = parsed?.state?.bestScore  ?? null;
      totalGames = parsed?.state?.totalGames ?? null;
    }
  } catch { /* malformed — leave as null, don't block the flow */ }

  try {
    const player = backup.data['aura-player-v1'];
    if (player) {
      const parsed = JSON.parse(player);
      playerName = parsed?.state?.displayName ?? null;
    }
  } catch { /* malformed — leave as null */ }

  return {
    bestScore, totalGames, playerName,
    exportedAt: backup.exportedAt ?? null,
  };
}

/**
 * Parses a File (from an <input type="file"> or drag-drop) as a
 * BackupFile. Throws a descriptive Error if the file isn't valid
 * JSON or doesn't look like an Aura Square backup.
 */
export async function parseBackupFile(file: File): Promise<BackupFile> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('File bukan JSON yang valid.');
  }
  if (!isValidBackup(parsed)) {
    throw new Error('File ini bukan file backup Aura Square yang valid.');
  }
  return parsed;
}

/**
 * Writes every key from a validated backup back into localStorage,
 * REPLACING current values for any key present in the backup.
 * Keys not present in the backup are left untouched (so an older
 * backup missing a newer feature's key won't wipe that feature's
 * current progress).
 *
 * Caller is responsible for reloading the page afterward — Zustand
 * stores have already hydrated from the OLD localStorage values at
 * app startup, so an in-place reload is the simplest way to make
 * every store re-read the newly-restored data consistently.
 */
export function restoreBackup(backup: BackupFile): void {
  for (const key of BACKUP_KEYS) {
    const value = backup.data[key];
    if (value !== undefined) {
      localStorage.setItem(key, value);
    }
  }
}
