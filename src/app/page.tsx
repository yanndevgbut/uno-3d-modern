'use client';

import React, { useState } from 'react';
import { MainMenu } from '@/components/menu/MainMenu';
import { GameTable } from '@/components/table/GameTable';
import { HowToPlayModal } from '@/components/menu/HowToPlayModal';
import { SettingsModal } from '@/components/menu/SettingsModal';
import { AboutModal } from '@/components/menu/AboutModal';
import { MultiplayerLobby } from '@/components/menu/MultiplayerLobby';
import { useSinglePlayerGame } from '@/hooks/useSinglePlayerGame';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { useSound } from '@/hooks/useSound';
import type { Difficulty } from '@/game/ai';

type AppView = 'menu' | 'single-game' | 'multiplayer';

export default function HomePage() {
  const [view, setView] = useState<AppView>('menu');

  // Modals state
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Sound system
  const { enabled: soundEnabled, toggleSound, playSound } = useSound();

  // Single player config state
  const [gameSetup, setGameSetup] = useState<{
    playerName: string;
    playerAvatar: string;
    botCount: 1 | 2 | 3;
    difficulty: Difficulty;
    targetScore: number;
  }>({
    playerName: 'Pemain 1',
    playerAvatar: '😎',
    botCount: 3,
    difficulty: 'medium',
    targetScore: 200,
  });

  // Single Player Game Hook
  const sp = useSinglePlayerGame(gameSetup, playSound);

  // Multiplayer Game Hook
  const mp = useMultiplayerGame(playSound);

  const handleStartSinglePlayer = (config: typeof gameSetup) => {
    playSound('click');
    setGameSetup(config);
    setView('single-game');
    playSound('deal');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. MAIN MENU */}
      {view === 'menu' && (
        <MainMenu
          onStartSinglePlayer={handleStartSinglePlayer}
          onOpenMultiplayer={() => {
            playSound('click');
            setView('multiplayer');
          }}
          onOpenHowToPlay={() => {
            playSound('click');
            setHowToPlayOpen(true);
          }}
          onOpenSettings={() => {
            playSound('click');
            setSettingsOpen(true);
          }}
          onOpenAbout={() => {
            playSound('click');
            setAboutOpen(true);
          }}
          soundEnabled={soundEnabled}
        />
      )}

      {/* 2. SINGLE PLAYER TABLE */}
      {view === 'single-game' && (
        <GameTable
          state={sp.state}
          humanPlayerId={sp.humanPlayer.id}
          isMyTurn={sp.isHumanTurn}
          activeColor={sp.currentActiveColor}
          playableCardIds={sp.playableCardIds}
          pendingWildCard={sp.pendingWildCard}
          onPlayCard={sp.playCard}
          onSelectWildColor={sp.selectWildColor}
          onDrawCard={sp.drawCard}
          onPassTurn={sp.passTurn}
          onCallUno={sp.callUno}
          onCatchUno={sp.catchUno}
          onChallenge={sp.challenge}
          onNextRound={sp.nextRound}
          onRestartMatch={sp.restartMatch}
          onExit={() => {
            playSound('click');
            setView('menu');
          }}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {/* 3. MULTIPLAYER (LOBBY OR GAME TABLE) */}
      {view === 'multiplayer' && (
        <>
          {mp.status === 'playing' && mp.gameState ? (
            <GameTable
              state={mp.gameState}
              humanPlayerId={mp.myPlayerId}
              isMyTurn={mp.isMyTurn}
              activeColor={mp.currentActiveColor}
              playableCardIds={mp.playableCardIds}
              pendingWildCard={mp.pendingWildCard}
              onPlayCard={mp.playCard}
              onSelectWildColor={mp.selectWildColor}
              onDrawCard={mp.drawCard}
              onPassTurn={mp.passTurn}
              onCallUno={mp.callUno}
              onCatchUno={mp.catchUno}
              onChallenge={mp.challenge}
              onNextRound={mp.nextRound}
              onRestartMatch={mp.restartMatch}
              onExit={() => {
                playSound('click');
                mp.leaveRoom();
                setView('menu');
              }}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          ) : (
            <MultiplayerLobby
              status={mp.status}
              roomCode={mp.roomCode}
              lobbyPlayers={mp.lobbyPlayers}
              isHost={mp.isHost}
              errorMessage={mp.errorMessage}
              onBack={() => {
                playSound('click');
                mp.leaveRoom();
                setView('menu');
              }}
              onJoinRoom={mp.joinRoom}
              onCreateRoom={mp.createRoom}
              onStartGame={mp.startGame}
              onLeaveRoom={mp.leaveRoom}
            />
          )}
        </>
      )}

      {/* Global Modals */}
      <HowToPlayModal
        open={howToPlayOpen}
        onClose={() => setHowToPlayOpen(false)}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />
      <AboutModal
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />
    </div>
  );
}
