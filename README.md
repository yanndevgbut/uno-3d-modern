# UNO 3D Modern - Minigame Web

Minigame kartu UNO dengan desain 3D modern, interaktif, responsif, dan ringan menggunakan Next.js, React, TypeScript, Tailwind CSS, dan Socket.IO.

## Fitur Utama

1. **Menu Utama Lengkap**:
   - **Main Lawan Bot**: Kustomisasi nama, avatar, jumlah lawan bot (1 - 3), dan tingkat kesulitan (Mudah, Sedang, Sulit).
   - **Multiplayer Online**: Buat room atau gabung dengan kode 4 karakter, sistem host, dan proteksi anti-cheat (kartu tangan pemain lain di-mask di server).
   - **Aturan Permainan**: Panduan lengkap aturan resmi UNO, efek kartu aksi, dan penalti UNO.
   - **Pengaturan**: Toggle efek suara dan Mode Performa Ringan (mengoptimalkan rendering untuk HP kentang/Android).
   - **Tentang**: Informasi teknis dan versi minigame.

2. **Aturan Permainan Resmi UNO**:
   - Kartu angka (0 - 9) untuk 4 warna (Merah, Biru, Hijau, Kuning).
   - Kartu Aksi: Skip (⊘), Reverse (⇄), Draw Two (+2), Wild, dan Wild Draw Four (+4).
   - Aturan Challenge untuk kartu Wild Draw Four (+4).
   - Sistem Panggil UNO! dan Tangkap UNO! (penalti 2 kartu jika lupa memanggil).
   - Arah putaran dinamis (searah / berlawanan jarum jam).
   - Reshuffle otomatis draw pile saat tumpukan kartu habis.
   - Sistem akumulasi skor per ronde hingga match target 200 poin.

3. **Desain 3D Modern & Ringan**:
   - Menggunakan **Pure CSS 3D Transforms** (`rotateY`, `translateZ`, `perspective`) untuk rendering ketebalan kartu dan meja tanpa beban WebGL / Three.js yang berat.
   - Performa 60fps dengan animasi yang hanya memanfaatkan `transform` dan `opacity`.
   - Efek suara sintetis menggunakan **WebAudio API** (0 file audio eksternal, 0 overhead memori).
   - Tampilan responsif dengan arc card fan yang nyaman untuk layar sentuh HP dan Desktop.

## Cara Menjalankan

### Mode Pengembangan (Dev / Server)
```bash
# Jalankan server Next.js + Socket.IO realtime
npm run dev
# Buka di browser: http://localhost:3000
```

### Build & Jalankan Mode Produksi
```bash
npm run build
npm start
```

### Menjalankan Unit Tests Engine
```bash
node --test src/game/engine.test.ts
```

## Struktur Proyek

```
minigames/
├── src/
│   ├── app/                    # Next.js App Router (page.tsx, layout.tsx, globals.css)
│   ├── components/
│   │   ├── card/               # UnoCard (CSS 3D front/back/depth), ColorPickerModal
│   │   ├── menu/               # MainMenu, MultiplayerLobby, SettingsModal, HowToPlayModal, AboutModal
│   │   ├── player/             # PlayerSeat, PlayerHand (3D arc fan)
│   │   ├── table/              # GameTable, CardPiles, RoundOverModal
│   │   └── ui/                 # SVG Icons
│   ├── game/                   # Logika murni game tanpa ketergantungan UI
│   │   ├── types.ts            # Card, Player, GameState, GameAction, GameEvent
│   │   ├── deck.ts             # 108 kartu UNO dan shuffling
│   │   ├── engine.ts           # Pure Reducer validasi aturan permainan
│   │   ├── ai.ts               # Bot AI dengan 3 tingkat kesulitan
│   │   └── engine.test.ts      # Automated unit tests
│   └── hooks/
│       ├── useSinglePlayerGame.ts  # State management vs Bot AI
│       ├── useMultiplayerGame.ts   # State management realtime Socket.IO
│       └── useSound.ts             # Sintesis WebAudio efek suara
├── server.mjs                  # Server Node.js terintegrasi Next.js + Socket.IO
├── tailwind.config.js
├── next.config.mjs
└── package.json
```
