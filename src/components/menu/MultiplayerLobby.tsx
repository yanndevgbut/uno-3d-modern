'use client';

import React, { useState } from 'react';
import { IconArrowLeft, IconUsers, IconPlay, IconRotate, IconClose } from '@/components/ui/icons';
import type { LobbyPlayer } from '@/hooks/useMultiplayerGame';

interface MultiplayerLobbyProps {
  status: 'idle' | 'in-lobby' | 'playing';
  roomCode: string;
  lobbyPlayers: LobbyPlayer[];
  isHost: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onJoinRoom: (code: string, name: string, avatar: string) => void;
  onCreateRoom: (name: string, avatar: string) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

const AVATARS = ['😎', '🤠', '🦊', '🐱', '🦁', '🚀', '👑', '🧙‍♂️'];

export function MultiplayerLobby({
  status,
  roomCode,
  lobbyPlayers,
  isHost,
  errorMessage,
  onBack,
  onJoinRoom,
  onCreateRoom,
  onStartGame,
  onLeaveRoom,
}: MultiplayerLobbyProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('Pemain Online');
  const [avatar, setAvatar] = useState('😎');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    onCreateRoom(name.trim() || 'Pemain', avatar);
  };

  const handleJoin = () => {
    if (!inputCode.trim()) return;
    onJoinRoom(inputCode.trim().toUpperCase(), name.trim() || 'Pemain', avatar);
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ROOM WAITING LOBBY
  if (status === 'in-lobby') {
    return (
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950 scene-3d">
        <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-xl font-black italic tracking-wide text-white uppercase drop-shadow">
              RUANG TUNGGU
            </h2>
            <button
              onClick={onLeaveRoom}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20"
            >
              Keluar
            </button>
          </div>

          {/* Invitation Code Display */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              KODE UNDANGAN ROOM
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-amber-400 drop-shadow">
                {roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                {copied ? 'Tersalin! ✓' : 'Salin'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Bagikan kode ini kepada teman Anda untuk bergabung.
            </p>
          </div>

          {/* Player List */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
              <span>Pemain Tergabung ({lobbyPlayers.length}/4)</span>
              {lobbyPlayers.length < 2 && (
                <span className="text-amber-400 text-[10px]">Minimal 2 pemain</span>
              )}
            </div>

            <div className="space-y-2">
              {lobbyPlayers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.avatar}</span>
                    <span className="text-sm font-bold text-white truncate max-w-[160px]">
                      {p.name}
                    </span>
                  </div>
                  {p.isHost && (
                    <span className="text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold">
              {errorMessage}
            </div>
          )}

          {/* Host Start Game button */}
          <div className="pt-2">
            {isHost ? (
              <button
                onClick={onStartGame}
                disabled={lobbyPlayers.length < 2}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:hover:scale-100 text-slate-950 font-black text-sm uppercase shadow-neon-green transition-transform active:scale-95"
              >
                {lobbyPlayers.length < 2 ? 'Menunggu Pemain Lain...' : 'Mulai Permainan ➔'}
              </button>
            ) : (
              <div className="py-3 text-xs text-slate-400 font-medium animate-pulse">
                Menunggu Host memulai permainan...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // CREATE / JOIN FORM
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950 scene-3d">
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <IconArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-black italic tracking-wide text-white uppercase drop-shadow">
              MULTIPLAYER LOBBY
            </h2>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setTab('create')}
            className={`py-2 rounded-xl text-xs font-black uppercase transition-all ${
              tab === 'create'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Buat Room
          </button>
          <button
            onClick={() => setTab('join')}
            className={`py-2 rounded-xl text-xs font-black uppercase transition-all ${
              tab === 'join'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gabung Room
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        {/* Profile Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Nama Pemain</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={15}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:border-sky-400 focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Pilih Avatar</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => setAvatar(av)}
                  className={`h-10 rounded-xl text-lg flex items-center justify-center border transition-all ${
                    avatar === av
                      ? 'border-sky-400 bg-sky-400/20 scale-105'
                      : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {tab === 'join' && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Kode Room (4 Karakter)</label>
              <input
                type="text"
                placeholder="mis. AB12"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-black text-center text-lg tracking-widest focus:border-sky-400 focus:outline-none uppercase"
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {tab === 'create' ? (
            <button
              onClick={handleCreate}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm uppercase shadow-neon-blue transition-transform active:scale-95"
            >
              Buat Room Baru ➔
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={!inputCode.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-sm uppercase shadow-neon-green transition-transform active:scale-95"
            >
              Masuk Room ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
