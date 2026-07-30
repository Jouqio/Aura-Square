<div align="center">

<img src="resources/icon.png" width="90" alt="Aura Square" />

# Aura Square

**Isi. Sapu. Menang.**

Game puzzle block premium — tanpa akun, tanpa server, 100% offline.

<br/>

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-114%20passing-4DCC7A?style=for-the-badge)

</div>

<br/>

## Tentang

Aura Square adalah game puzzle block 8×8 — drag & drop piece, sapu baris, kejar skor tertinggi. Dibangun sebagai Progressive Web App yang sepenuhnya *offline-first*: tanpa login, tanpa server wajib, semua progres tersimpan di perangkatmu sendiri.

<br/>

## Mulai

```bash
cd aura-square
npm install
npm run dev
```

Buka `http://localhost:5173` dan langsung main.

```bash
npm run build     # build production + PWA
npm run test      # 114 unit test
npm run ci        # typecheck + lint + test
```

<br/>

## Fitur

- 🎮 **Board 8×8** dengan drag-and-drop, combo, particle effect, dan hint gratis
- 🗓️ **Tantangan Harian & Mingguan**, 32 achievement, level & rank system
- 📊 **Statistik lengkap** — grafik skor, streak, riwayat 50 game terakhir
- 🎨 **3 tema visual**, avatar, dukungan Bahasa Indonesia & English
- 📱 **PWA installable**, jalan penuh offline, backup/restore progres ke JSON
- 🎵 **Audio tersintesis** — efek suara & musik ambient tanpa file eksternal

<br/>

## Struktur Singkat

```
src/
├── engine/      → logika game murni (114 test)
├── store/       → 8 Zustand store, persisted ke localStorage
├── services/    → audio, backup, share card, firestore (opsional)
├── hooks/       → drag-drop, achievement, PWA update, dsb.
├── pages/       → Home, Game, Daily, Achievements, Profile, dst.
└── i18n/        → id.json / en.json (428 key, 100% sinkron)
```

<br/>

## Data & Privasi

Semua progres tersimpan lokal di `localStorage` perangkatmu — tidak ada akun, tidak ada tracking. Ingin backup? Buka **Pengaturan → Data** untuk ekspor/impor progres sebagai file JSON.

Klasemen online bersifat opsional dan hanya aktif jika `.env.local` dikonfigurasi dengan Firebase project sendiri.

<br/>

## Build ke Native

Project sudah siap dibungkus ke iOS/Android via Capacitor:

```bash
npm run build
npx cap add ios android
npm run cap:sync
npm run cap:open:ios      # atau cap:open:android
```

<br/>

---

<div align="center">

Dibuat oleh **Syauqi Nuzul Abdi**
[![GitHub](https://img.shields.io/badge/GitHub-Jouqio-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Jouqio)

*Engine terinspirasi dari [fill-the-square](https://github.com/ryanbalieiro/fill-the-square)*

</div>
