<div align="center">

<img src="screenshots/splash.png" width="220" alt="Aura Square" />

# 🟣 Aura Square

### *"Isi. Sapu. Menang."*

**Owner:** Syauqi Nuzul Abdi | **Versi:** 3.0.0 | **Mode:** Zero Login · Offline-First · PWA

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![No Login](https://img.shields.io/badge/Login-Not%20Required-4DCC7A)](/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8)](https://web.dev/pwa)
[![Tests](https://img.shields.io/badge/Tests-114%2F114%20passing-brightgreen)](/)
[![i18n](https://img.shields.io/badge/i18n-ID%20%2F%20EN-blue)](/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)](https://aura-square.vercel.app)
[![License](https://img.shields.io/badge/License-Custom%20(Permission%20Required)-orange)](./LICENSE)

Game puzzle block premium — mainkan langsung di browser, tanpa akun, tanpa server. Semua progress tersimpan di perangkatmu sendiri.

<br/>

[Main Sekarang](https://aura-square.vercel.app) •
[Cuplikan Layar](#-cuplikan-layar) •
[Fitur](#-fitur-utama) •
[Instalasi](#-cara-jalankan) •
[Struktur](#-struktur-proyek) •
[Storage](#-data-storage-semua-lokal-tanpa-server) •
[Testing](#-testing--kualitas) •
[Native Build](#-membungkus-ke-native-capacitor)

</div>

---

## Cuplikan Layar

<div align="center">

<table>
<tr>
<td align="center" width="25%">
<img src="screenshots/home.png" width="100%" alt="Beranda" /><br/>
<sub><b>Beranda</b></sub>
</td>
<td align="center" width="25%">
<img src="screenshots/gameplay.png" width="100%" alt="Gameplay" /><br/>
<sub><b>Gameplay</b></sub>
</td>
<td align="center" width="25%">
<img src="screenshots/daily.png" width="100%" alt="Tantangan Harian" /><br/>
<sub><b>Tantangan Harian</b></sub>
</td>
<td align="center" width="25%">
<img src="screenshots/achievements.png" width="100%" alt="Pencapaian" /><br/>
<sub><b>Pencapaian</b></sub>
</td>
</tr>
<tr>
<td align="center" width="25%">
<img src="screenshots/statistics.png" width="100%" alt="Statistik" /><br/>
<sub><b>Statistik</b></sub>
</td>
<td align="center" width="25%">
<img src="screenshots/leaderboard.png" width="100%" alt="Klasemen" /><br/>
<sub><b>Klasemen</b></sub>
</td>
<td align="center" width="25%">
<img src="screenshots/settings.png" width="100%" alt="Pengaturan" /><br/>
<sub><b>Pengaturan</b></sub>
</td>
<td align="center" width="25%">
<img src="screenshots/splash.png" width="100%" alt="Layar Mulai" /><br/>
<sub><b>Layar Mulai</b></sub>
</td>
</tr>
</table>

</div>

---

<br/>

## Tentang

Aura Square adalah game puzzle block 8×8 — drag & drop piece, sapu baris, kejar skor tertinggi. Dibangun sebagai Progressive Web App yang sepenuhnya *offline-first*: tanpa login, tanpa server wajib, semua progres tersimpan di perangkatmu sendiri.

🔗 **Coba sekarang:** [aura-square.vercel.app](https://aura-square.vercel.app)

<br/>

## Mulai

### 🌐 Main langsung (tanpa install)

Buka **[aura-square.vercel.app](https://aura-square.vercel.app)** — langsung main dari browser, bisa juga di-install sebagai PWA ke home screen HP/desktop kamu.

### Jalankan secara lokal

```bash
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
- 🎨 **5 tema visual**, avatar, dukungan Bahasa Indonesia & English
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

## Deployment

Aura Square di-deploy sebagai **Progressive Web App (PWA)** melalui **Vercel**, dengan continuous deployment — setiap push ke branch `main` otomatis ter-deploy ulang.

- 🌐 **Live:** [aura-square.vercel.app](https://aura-square.vercel.app)
- ⚙️ **Platform:** Vercel
- 🔁 **CI/CD:** Auto-deploy dari GitHub (`main` branch)

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

## Lisensi

Project ini bersifat **source-available**, bukan open-source sepenuhnya. Kamu bebas **melihat dan mempelajari** kode-nya untuk referensi/edukasi. Namun, untuk **menggunakan, memodifikasi, atau mendistribusikan ulang** (termasuk untuk tujuan komersial), wajib mendapat **izin tertulis** dari pemilik terlebih dahulu.

 Selengkapnya: lihat file [`LICENSE`](./LICENSE)
 Untuk meminta izin, hubungi: [github.com/Jouqio](https://github.com/Jouqio)

<br/>

---

<div align="center">

Dibuat oleh **Syauqi Nuzul Abdi**
[![GitHub](https://img.shields.io/badge/GitHub-Jouqio-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/Jouqio)

<br/>

*Aura Square — Game puzzle block premium, installable, offline-first, tanpa login.*

**[Main Sekarang di aura-square.vercel.app](https://aura-square.vercel.app)**

</div>
