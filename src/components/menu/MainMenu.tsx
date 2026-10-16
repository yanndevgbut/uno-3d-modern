'use client';

import React, { useState } from 'react';
import {
  IconPlay,
  IconUsers,
  IconHelp,
  IconSettings,
  IconInfo,
  IconBot,
} from '@/components/ui/icons';
import type { Difficulty } from '@/game/ai';

interface MainMenuProps {
  onStartSinglePlayer: (config: {
    playerName: string;
    playerAvatar: string;
    botCount: 1 | 2 | 3;
    difficulty: Difficulty;
    targetScore: number;
  }) => void;
  onOpenMultiplayer: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  soundEnabled: boolean;
}

const AVATARS = ['😎', '🤠', '🦊', '🐱', '🦁', '🚀', '👑', '🧙‍♂️'];

export function MainMenu({
  onStartSinglePlayer,
  onOpenMultiplayer,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenAbout,
}: MainMenuProps) {
  const [mode, setMode] = useState<'menu' | 'setup-single'>('menu');
  const [playerName, setPlayerName] = useState('Pemain 1');
  const [avatar, setAvatar] = useState('😎');
  const [botCount, setBotCount] = useState<1 | 2 | 3>(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const handleStartGame = () => {
    onStartSinglePlayer({
      playerName: playerName.trim() || 'Pemain',
      playerAvatar: avatar,
      botCount,
      difficulty,
      targetScore: 200,
    });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-950 scene-3d">
      {/* 3D Floating Decorative Cards in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 sm:opacity-40">
        <div className="absolute -top-12 -left-12 w-32 h-48 rounded-2xl bg-gradient-to-br from-red-600 to-rose-800 rotate-12 shadow-2xl animate-pulse" />
        <div className="absolute top-1/4 -right-16 w-36 h-52 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 -rotate-15 shadow-2xl" />
        <div className="absolute -bottom-16 left-1/4 w-36 h-52 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 rotate-45 shadow-2xl" />
        <div className="absolute bottom-1/3 -left-16 w-32 h-48 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 -rotate-12 shadow-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-6 sm:space-y-8 animate-in fade-in duration-300">
        {/* LOGO */}
        <div className="space-y-1">
          <div className="inline-block relative px-8 py-3 rounded-3xl bg-gradient-to-tr from-red-600 via-yellow-500 to-blue-600 p-[3px] shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <div className="px-6 py-2 rounded-[22px] bg-slate-950">
              <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter bg-gradient-to-r from-red-500 via-yellow-400 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                UNO 3D
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-400 uppercase pt-2">
            Minigame Kartu Modern &amp; Cepat
          </p>
        </div>

        {mode === 'menu' ? (
          /* PRIMARY MENU BUTTONS */
          <div className="w-full space-y-3.5 pt-2">
            <button
              onClick={() => setMode('setup-single')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-neon-green transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconPlay size={24} />
              <span>MAIN LAWAN BOT</span>
            </button>

            <button
              onClick={onOpenMultiplayer}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-neon-blue transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconUsers size={24} />
              <span>MULTIPLAYER ONLINE</span>
            </button>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <button
                onClick={onOpenHowToPlay}
                className="py-3 px-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 transition-all hover:border-slate-500 active:scale-95"
              >
                <IconHelp size={20} className="text-sky-400" />
                <span>Aturan</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="py-3 px-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 transition-all hover:border-slate-500 active:scale-95"
              >
                <IconSettings size={20} className="text-amber-400" />
                <span>Pengaturan</span>
              </button>

              <button
                onClick={onOpenAbout}
                className="py-3 px-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 transition-all hover:border-slate-500 active:scale-95"
              >
                <IconInfo size={20} className="text-purple-400" />
                <span>Tentang</span>
              </button>
            </div>
          </div>
        ) : (
          /* SINGLE PLAYER CONFIGURATION SCREEN */
          <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl text-left space-y-5 animate-in slide-in-from-bottom-4 duration-200">
            <h2 className="text-lg font-black text-white italic tracking-wide uppercase">
              PENGATURAN PERMAINAN
            </h2>

            {/* Profile input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Nama Anda</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:border-amber-400 focus:outline-none text-sm"
              />
            </div>

            {/* Avatar picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Pilih Avatar</label>
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => setAvatar(av)}
                    className={`h-11 rounded-xl text-xl flex items-center justify-center border transition-all ${
                      avatar === av
                        ? 'border-amber-400 bg-amber-400/20 scale-105'
                        : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of AI Opponents */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Jumlah Lawan Bot</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBotCount(num as 1 | 2 | 3)}
                    className={`py-2 rounded-xl text-xs font-black uppercase border transition-all ${
                      botCount === num
                        ? 'border-sky-400 bg-sky-400/20 text-sky-300'
                        : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}
                  >
                    {num} Bot ({num + 1} Pemain)
                  </button>
                ))}
              </div>
            </div>

            {/* AI Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Kesulitan Bot</label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
                  const label = d === 'easy' ? 'Mudah' : d === 'medium' ? 'Sedang' : 'Sulit';
                  const activeColor =
                    d === 'easy'
                      ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                      : d === 'medium'
                      ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                      : 'border-red-400 bg-red-400/20 text-red-300';

                  return (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`py-2 rounded-xl text-xs font-black uppercase border transition-all ${
                        difficulty === d ? activeColor : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setMode('menu')}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
              >
                Kembali
              </button>
              <button
                onClick={handleStartGame}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase shadow-neon-green transition-transform active:scale-95"
              >
                Mulai Permainan ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
