import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { translations, Language } from './locales/i18n.js';
import { ClientGameState, ExecutivePower, VoteChoice } from '../../server/src/engine/types.js';
import { sound } from './audio/SoundEffects.js';
import { BoardTracks } from './components/BoardTracks.js';
import { SeatingTable } from './components/SeatingTable.js';
import { RoleRevealCard } from './components/RoleRevealCard.js';
import { VotingModal } from './components/VotingModal.js';
import { LegislativeModal } from './components/LegislativeModal.js';
import { ExecutivePowerModal } from './components/ExecutivePowerModal.js';
import { VictoryScreen } from './components/VictoryScreen.js';
import { GovernmentPlacards } from './components/GovernmentPlacards.js';
import { PassAndPlayGame } from './components/PassAndPlayGame.js';
import {
  Landmark,
  FolderLock,
  Volume2,
  VolumeX,
  Copy,
  BookOpen,
  AlertCircle,
  UserPlus,
  LogIn,
  Smartphone,
} from 'lucide-react';

export const App: React.FC = () => {
  // Locale & Audio preferences
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('sh_lang') as Language) || 'fa';
  });
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  // App Navigation & Session
  const [roomCode, setRoomCode] = useState<string>(() => {
    // Check URL query parameters (e.g. ?room=ABCD5)
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || localStorage.getItem('sh_room_code') || '';
  });
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('sh_player_name') || '';
  });
  const [sessionToken, setSessionToken] = useState<string>(() => {
    return localStorage.getItem('sh_session_token') || '';
  });
  const [playerId, setPlayerId] = useState<string>(() => {
    return localStorage.getItem('sh_player_id') || '';
  });

  // Game Real-Time State
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [nominatedTargetId, setNominatedTargetId] = useState<string | null>(null);
  const [isPassAndPlayMode, setIsPassAndPlayMode] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const t = translations[lang];
  const isFa = lang === 'fa';

  const toggleLanguage = () => {
    const nextLang = lang === 'fa' ? 'en' : 'fa';
    setLang(nextLang);
    localStorage.setItem('sh_lang', nextLang);
  };

  const toggleSound = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  // Socket Connection Management
  useEffect(() => {
    // In dev, connect to current host:3001 or window.location.origin
    const serverUrl = window.location.port === '5173'
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : window.location.origin;

    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Auto-reconnect to room if session is stored
      if (roomCode && sessionToken) {
        socket.emit('join-room', { roomCode, sessionToken });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('state-update', (updatedState: ClientGameState) => {
      setGameState(updatedState);
      setErrorMessage(null);
    });

    socket.on('error-msg', (data: { message: string }) => {
      setErrorMessage(data.message);
      sound.playAlert();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync session to URL & localStorage
  const saveSession = (code: string, pId: string, token: string, name: string) => {
    setRoomCode(code);
    setPlayerId(pId);
    setSessionToken(token);
    setPlayerName(name);

    localStorage.setItem('sh_room_code', code);
    localStorage.setItem('sh_player_id', pId);
    localStorage.setItem('sh_session_token', token);
    localStorage.setItem('sh_player_name', name);

    // Update browser URL query param cleanly without reloading
    const newUrl = `${window.location.pathname}?room=${code}`;
    window.history.replaceState(null, '', newUrl);

    // Join room over socket
    if (socketRef.current) {
      socketRef.current.emit('join-room', { roomCode: code, sessionToken: token });
    }
  };

  // Room Actions
  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setErrorMessage(isFa ? 'لطفاً نام خود را وارد کنید' : 'Please enter your name');
      return;
    }

    try {
      sound.playStampThump();
      const serverUrl = window.location.port === '5173'
        ? `${window.location.protocol}//${window.location.hostname}:3001`
        : window.location.origin;

      const res = await fetch(`${serverUrl}/api/room/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: playerName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      saveSession(data.roomCode, data.playerId, data.sessionToken, playerName.trim());
    } catch (err: any) {
      setErrorMessage(err.message);
      sound.playAlert();
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !playerName.trim()) {
      setErrorMessage(isFa ? 'کد اتاق و نام خود را وارد کنید' : 'Enter room code and your name');
      return;
    }

    try {
      sound.playStampThump();
      const serverUrl = window.location.port === '5173'
        ? `${window.location.protocol}//${window.location.hostname}:3001`
        : window.location.origin;

      const res = await fetch(`${serverUrl}/api/room/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: roomCode.trim().toUpperCase(),
          playerName: playerName.trim(),
          sessionToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      saveSession(data.roomCode, data.playerId, data.sessionToken, playerName.trim());
    } catch (err: any) {
      setErrorMessage(err.message);
      sound.playAlert();
    }
  };

  const emitAction = (action: any) => {
    if (socketRef.current && roomCode && sessionToken) {
      socketRef.current.emit('action', { roomCode, sessionToken, action });
    }
  };

  const handleStartGame = () => {
    sound.playGavel();
    emitAction({ type: 'START_GAME' });
  };

  const handleAddBot = () => {
    sound.playCardFlip();
    if (socketRef.current && roomCode && sessionToken) {
      socketRef.current.emit('add-bot', { roomCode, sessionToken });
    }
  };

  const handleFinishRoleReveal = () => {
    sound.playStampThump();
    if (socketRef.current && roomCode) {
      socketRef.current.emit('finish-role-reveal', { roomCode });
    }
  };

  const handleCopyLink = () => {
    sound.playStampThump();
    const link = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(link);
    alert(t.linkCopied);
  };

  const handleExitRoom = () => {
    localStorage.removeItem('sh_room_code');
    localStorage.removeItem('sh_session_token');
    localStorage.removeItem('sh_player_id');
    setGameState(null);
    setRoomCode('');
    setSessionToken('');
    setPlayerId('');
    window.history.replaceState(null, '', window.location.pathname);
  };

  const publicState = gameState?.publicState;
  const myPlayer = gameState?.myPlayer;
  const hostPlayer = publicState?.players.find((p) => p.isHost);
  const isHost = (myPlayer?.isHost ?? false) || (publicState?.players.find((p) => p.id === playerId)?.isHost ?? false);
  const phase = publicState?.phase;

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#101419] text-stone-200 font-sans selection:bg-amber-600 selection:text-white flex flex-col justify-between ${
        isFa ? 'font-vazir' : 'font-sans'
      }`}
    >
      {/* --- TOP BAR --- */}
      <header className="w-full bg-[#161b22]/90 border-b border-stone-800 px-4 py-2.5 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-600/60 flex items-center justify-center text-lg shadow">
            <Landmark className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h1 className="font-serif font-black text-sm sm:text-base text-amber-100 tracking-wide">
              {t.gameTitle}
            </h1>
            {publicState && (
              <span className="text-[10px] font-mono text-amber-500/80">
                {t.roomCode}: {publicState.roomId}
              </span>
            )}
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Secret Dossier Peek Button (Active in game) */}
          {myPlayer && phase && phase !== 'LOBBY' && (
            <button
              onClick={() => setShowDossierModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-950/70 border border-amber-600/60 text-amber-200 text-xs font-serif font-bold hover:bg-amber-900 transition-all active:scale-95 flex items-center gap-1.5 shadow"
            >
              <FolderLock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.roleCard}</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 text-xs hover:bg-stone-800 transition-all shadow"
            title={t.soundToggle}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-mono font-bold text-amber-400 hover:bg-stone-800 transition-all shadow"
          >
            {lang === 'fa' ? 'EN' : 'فا'}
          </button>

          {/* Connection status indicator */}
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 animate-pulse'
            }`}
            title={isConnected ? t.connected : t.reconnecting}
          />
        </div>
      </header>

      {/* --- ERROR TOAST NOTIFICATION --- */}
      {errorMessage && (
        <div className="mx-auto my-2 max-w-md px-4 py-2.5 bg-red-950/90 border border-red-500/80 text-red-200 text-xs rounded-2xl flex items-center justify-between shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="px-2 py-0.5 text-stone-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* --- MAIN VIEW CONTENT --- */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 flex flex-col justify-start items-center">
        {/* PASS & PLAY OFFLINE MODE */}
        {isPassAndPlayMode && (
          <PassAndPlayGame
            onExit={() => setIsPassAndPlayMode(false)}
            lang={lang}
          />
        )}

        {/* SCREEN 1: WELCOME & ROOM ENTRY */}
        {!isPassAndPlayMode && !gameState && (
          <div className="w-full max-w-md mx-auto my-auto p-6 sm:p-8 rounded-3xl bg-[#181d24]/95 border-2 border-stone-800 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center text-center animate-fadeIn">
            {/* Historical Seal */}
            <div className="w-20 h-20 rounded-full border-2 border-amber-600/60 bg-gradient-to-b from-amber-950/50 to-stone-950 flex items-center justify-center shadow-inner mb-4">
              <Landmark className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-amber-100 tracking-wider">
              {t.gameTitle}
            </h2>
            <p className="text-xs sm:text-sm font-serif text-stone-400 mt-1 mb-6">
              {t.subTitle}
            </p>

            {/* Inputs */}
            <div className="w-full flex flex-col gap-3 text-start">
              <div>
                <label className="text-xs font-serif text-stone-300 mb-1 block">
                  {t.yourName}
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={t.enterYourName}
                  maxLength={18}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 placeholder:text-stone-600 text-sm focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-serif text-stone-300 mb-1 block">
                  {t.roomCode}
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder={t.enterRoomCode}
                  maxLength={5}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-amber-200 font-mono tracking-widest text-center text-base uppercase placeholder:text-stone-600 focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleJoinRoom}
                className="flex-1 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.joinRoom}</span>
              </button>
              <button
                onClick={handleCreateRoom}
                className="flex-1 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 font-serif font-bold text-sm uppercase tracking-wider shadow active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.createRoom}</span>
              </button>
            </div>

            {/* Pass & Play Offline Mode Button */}
            <div className="w-full mt-4 pt-4 border-t border-stone-800">
              <button
                onClick={() => {
                  sound.playStampThump();
                  setIsPassAndPlayMode(true);
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#946c33] via-[#c49b5a] to-[#946c33] hover:from-[#a67a3a] hover:to-[#a67a3a] text-[#1c100a] font-serif font-black text-xs uppercase tracking-wider shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 border border-[#e6c687]/40 ring-2 ring-[#c49b5a]/30"
              >
                <Smartphone className="w-4 h-4" />
                <span>
                  {isFa ? 'بازی دورهمی با یک گوشی (Pass & Play)' : 'Play with 1 Phone (Pass & Play)'}
                </span>
              </button>
            </div>

            {/* Rules Button */}
            <button
              onClick={() => setShowHowToPlay(true)}
              className="mt-6 text-xs text-amber-400/80 hover:text-amber-300 underline font-serif flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.howToPlay}</span>
            </button>
          </div>
        )}

        {/* SCREEN 2: LOBBY */}
        {publicState && phase === 'LOBBY' && (
          <div className="w-full max-w-lg mx-auto p-4 sm:p-6 rounded-3xl bg-[#181d24]/95 border-2 border-stone-800 shadow-2xl flex flex-col items-center animate-fadeIn">
            <div className="text-center mb-4">
              <div className="text-[11px] font-mono uppercase tracking-widest text-amber-500 mb-1">
                {isFa ? 'اتاق انتظار بازی' : 'GAME LOBBY'}
              </div>
              <div
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-stone-900 border-2 border-dashed border-amber-600/70 cursor-pointer hover:bg-stone-850 active:scale-95 transition-all shadow-lg"
                title={t.copyLink}
              >
                <span className="font-mono text-2xl font-black text-amber-300 tracking-widest">
                  {publicState.roomId}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-amber-600/20 text-amber-400 px-2.5 py-1 rounded-lg font-sans border border-amber-600/40">
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copyLink}</span>
                </span>
              </div>
            </div>

            {/* Seating Order List */}
            <div className="w-full my-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-xs font-serif font-bold text-stone-300">
                  {t.playersInLobby} ({publicState.players.length}/10)
                </span>
                <span className="text-[11px] font-mono text-amber-400">
                  {publicState.players.length < 5 ? t.waitingForPlayers : '✅ Ready'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {publicState.players.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-serif"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-400 font-mono flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-stone-200">{p.name}</span>
                      {p.id === playerId && (
                        <span className="text-[9px] bg-amber-600 text-stone-950 font-bold px-1 rounded">
                          {isFa ? 'شما' : 'You'}
                        </span>
                      )}
                    </div>
                    {p.isHost && (
                      <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700/60 px-1.5 py-0.2 rounded font-mono">
                        {t.host}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Host Controls */}
            {isHost ? (
              <div className="w-full flex flex-col gap-3 mt-4">
                {publicState.players.length < 5 ? (
                  <div className="w-full p-3 rounded-xl bg-amber-950/40 border border-amber-600/50 text-center text-xs text-amber-200 font-serif leading-relaxed">
                    ⚠️ {isFa
                      ? `برای شروع بازی حداقل ۵ بازیکن نیاز است (هم‌اکنون ${publicState.players.length} نفر حاضرند). لینک دعوت را به دوستان بفرستید یا با دکمه زیر ربات آزمایشی اضافه کنید:`
                      : `At least 5 players required to start (currently ${publicState.players.length} in lobby). Share the invite link or add test bots below:`}
                  </div>
                ) : (
                  <div className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-center text-xs text-emerald-300 font-serif font-bold">
                    ✅ {isFa
                      ? `تعداد بازیکنان تکمیل است (${publicState.players.length} نفر). می‌توانید بازی را شروع کنید!`
                      : `Room is ready with ${publicState.players.length} players. You can now start the game!`}
                  </div>
                )}

                <button
                  disabled={publicState.players.length < 5 || publicState.players.length > 10}
                  onClick={handleStartGame}
                  className={`w-full py-3.5 rounded-xl font-serif font-black text-sm uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 ${
                    publicState.players.length >= 5 && publicState.players.length <= 10
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 active:scale-98 ring-4 ring-amber-500/30'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  }`}
                >
                  <span>👑</span>
                  <span>{t.startGame} ({publicState.players.length} از ۵-۱۰ نفر)</span>
                </button>

                {publicState.players.length < 10 && (
                  <button
                    onClick={handleAddBot}
                    className="w-full py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-amber-300 text-xs font-serif border border-amber-700/50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow"
                  >
                    <span>🤖</span>
                    <span>{t.addBot} (پر کردن سریع صندلی)</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs font-serif text-center mt-3">
                <div className="text-amber-300 font-bold mb-1">
                  👑 {isFa ? `میزبان بازی: ${hostPlayer?.name || 'میزبان'}` : `Game Host: ${hostPlayer?.name || 'Host'}`}
                </div>
                <div className="text-stone-400">
                  {publicState.players.length >= 5
                    ? isFa
                      ? 'تعداد بازیکنان کافی است. در انتظار فشردن دکمه «شروع بازی» توسط میزبان...'
                      : 'Lobby is ready. Waiting for the host to click Start Game...'
                    : isFa
                    ? `در انتظار تکمیل ظرفیت توسط میزبان (${publicState.players.length} از ۵ نفر)...`
                    : `Waiting for lobby to reach 5 players (${publicState.players.length}/5)...`}
                </div>
              </div>
            )}

            <button
              onClick={handleExitRoom}
              className="mt-6 text-xs text-stone-500 hover:text-stone-300 font-serif"
            >
              ← {t.exitToMenu}
            </button>
          </div>
        )}

        {/* SCREEN 3: ROLE REVEAL STAGE */}
        {publicState && phase === 'ROLE_REVEAL' && myPlayer && (
          <RoleRevealCard
            player={myPlayer}
            lang={lang}
            canAdvance={isHost}
            onAcknowledge={handleFinishRoleReveal}
          />
        )}

        {/* SCREEN 4: ACTIVE PLAYING BOARD & ACTIONS */}
        {publicState && phase !== 'LOBBY' && phase !== 'ROLE_REVEAL' && (
          <div className="w-full flex flex-col gap-4 animate-fadeIn">
            {/* Government Placards */}
            <GovernmentPlacards
              presidentName={
                publicState.players.find((p) => p.id === publicState.presidentId)?.name || null
              }
              chancellorName={
                publicState.players.find(
                  (p) => p.id === (publicState.chancellorId || publicState.nominatedChancellorId)
                )?.name || null
              }
              isNominated={phase === 'ELECTION_NOMINATION' || phase === 'ELECTION_VOTING'}
              termLimitInfo={{
                lastPresidentName: publicState.lastElectedPresidentId
                  ? publicState.players.find((p) => p.id === publicState.lastElectedPresidentId)?.name
                  : null,
                lastChancellorName: publicState.lastElectedChancellorId
                  ? publicState.players.find((p) => p.id === publicState.lastElectedChancellorId)?.name
                  : null,
              }}
              lang={lang}
            />

            {/* Top Boards */}
            <BoardTracks
              liberalPoliciesEnacted={publicState.liberalPoliciesEnacted}
              fascistPoliciesEnacted={publicState.fascistPoliciesEnacted}
              failedElectionCount={publicState.failedElectionCount}
              playerCount={publicState.players.length}
              lang={lang}
            />

            {/* Table Seats */}
            <SeatingTable
              players={publicState.players}
              seatingOrder={publicState.seatingOrder}
              presidentId={publicState.presidentId}
              chancellorId={publicState.chancellorId}
              nominatedChancellorId={publicState.nominatedChancellorId}
              lastElectedPresidentId={publicState.lastElectedPresidentId}
              lastElectedChancellorId={publicState.lastElectedChancellorId}
              myPlayerId={playerId}
              lang={lang}
              selectedPlayerId={nominatedTargetId}
              onSelectPlayer={(id) => setNominatedTargetId(id)}
              isSelectable={(id) => {
                // If in nomination phase and I am president
                if (phase === 'ELECTION_NOMINATION' && publicState.presidentId === playerId) {
                  return (
                    id !== playerId &&
                    id !== publicState.lastElectedChancellorId &&
                    (publicState.players.filter((p) => p.isAlive).length <= 5 ||
                      id !== publicState.lastElectedPresidentId)
                  );
                }
                return false;
              }}
            />

            {/* ACTIVE ACTION SECTION ACCORDING TO CURRENT PHASE */}

            {/* 1. NOMINATION PHASE */}
            {phase === 'ELECTION_NOMINATION' && (
              <div className="w-full p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col items-center text-center">
                <div className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-1">
                  {t.nominationPhase}
                </div>
                {publicState.presidentId === playerId ? (
                  <div className="w-full max-w-md flex flex-col items-center">
                    <h3 className="font-serif font-black text-amber-100 text-base mb-2">
                      {t.nominatePrompt}
                    </h3>
                    <div className="w-full flex gap-2 justify-center my-2">
                      <select
                        value={nominatedTargetId || ''}
                        onChange={(e) => setNominatedTargetId(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-stone-950 border border-amber-600/60 text-stone-100 text-sm focus:outline-none"
                      >
                        <option value="">{isFa ? '-- انتخاب صدراعظم --' : '-- Choose Chancellor --'}</option>
                        {publicState.players
                          .filter(
                            (p) =>
                              p.isAlive &&
                              p.id !== playerId &&
                              p.id !== publicState.lastElectedChancellorId &&
                              (publicState.players.filter((pl) => pl.isAlive).length <= 5 ||
                                p.id !== publicState.lastElectedPresidentId)
                          )
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </select>

                      <button
                        disabled={!nominatedTargetId}
                        onClick={() => {
                          if (nominatedTargetId) {
                            sound.playStampThump();
                            emitAction({
                              type: 'NOMINATE_CHANCELLOR',
                              chancellorId: nominatedTargetId,
                            });
                            setNominatedTargetId(null);
                          }
                        }}
                        className={`px-5 py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider transition-all ${
                          nominatedTargetId
                            ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-lg active:scale-95'
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        {t.nominateButton}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm font-serif text-stone-300">
                    🎩{' '}
                    {isFa
                      ? `رئیس‌جمهور (${publicState.players.find((p) => p.id === publicState.presidentId)?.name}) در حال انتخاب صدراعظم است...`
                      : `President (${publicState.players.find((p) => p.id === publicState.presidentId)?.name}) is nominating a Chancellor...`}
                  </div>
                )}
              </div>
            )}

            {/* 2. VOTING PHASE */}
            {phase === 'ELECTION_VOTING' && (
              <VotingModal
                presidentName={
                  publicState.players.find((p) => p.id === publicState.presidentId)?.name || 'President'
                }
                chancellorName={
                  publicState.players.find((p) => p.id === publicState.nominatedChancellorId)?.name || 'Chancellor'
                }
                hasVoted={publicState.votedPlayerIds.includes(playerId)}
                onCastVote={(vote: VoteChoice) => emitAction({ type: 'CAST_VOTE', vote })}
                lastElection={publicState.lastElection}
                phase={phase}
                votedPlayerCount={publicState.votedPlayerIds.length}
                totalLivingPlayers={publicState.players.filter((p) => p.isAlive).length}
                players={publicState.players}
                lang={lang}
              />
            )}

            {/* 3. LEGISLATIVE SESSION */}
            {(phase === 'LEGISLATIVE_PRESIDENT' ||
              phase === 'LEGISLATIVE_CHANCELLOR' ||
              phase === 'LEGISLATIVE_VETO_OFFERED') && (
              <LegislativeModal
                phase={phase}
                isPresident={publicState.presidentId === playerId}
                isChancellor={publicState.chancellorId === playerId}
                drawnPolicies={gameState.drawnPolicies}
                vetoUnlocked={publicState.vetoUnlocked}
                onPresidentDiscard={(cardIndex) =>
                  emitAction({ type: 'PRESIDENT_DISCARD', cardIndex })
                }
                onChancellorDiscard={(cardIndex) =>
                  emitAction({ type: 'CHANCELLOR_DISCARD', cardIndex })
                }
                onRequestVeto={() => emitAction({ type: 'REQUEST_VETO' })}
                onRespondVeto={(agree) => emitAction({ type: 'RESPOND_VETO', agree })}
                lang={lang}
              />
            )}

            {/* 4. EXECUTIVE POWER PHASE */}
            {phase === 'EXECUTIVE_POWER' && publicState.pendingExecutivePower && (
              <ExecutivePowerModal
                power={publicState.pendingExecutivePower}
                isPresident={publicState.presidentId === playerId}
                presidentName={
                  publicState.players.find((p) => p.id === publicState.presidentId)?.name || 'President'
                }
                players={publicState.players}
                currentPresidentId={publicState.presidentId!}
                policyPeekCards={gameState.policyPeekCards}
                investigatedLoyalty={gameState.investigatedLoyalty}
                onExecutePower={(power: ExecutivePower, targetId?: string) =>
                  emitAction({ type: 'USE_EXECUTIVE_POWER', power, targetId })
                }
                lang={lang}
              />
            )}

            {/* LATEST LOGS TICKER */}
            {publicState.logs && publicState.logs.length > 0 && (
              <div className="w-full p-3 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs font-mono text-stone-400">
                <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                  <span>📜</span>
                  <span className="uppercase tracking-widest text-[10px]">
                    {isFa ? 'وقایع‌نگاری مجلس' : 'Reichstag Dispatch'}
                  </span>
                </div>
                <div className="text-stone-300 font-serif line-clamp-2">
                  {publicState.logs[publicState.logs.length - 1].message}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 5: VICTORY SCREEN */}
        {publicState && phase === 'GAME_OVER' && publicState.winner && (
          <VictoryScreen
            winner={publicState.winner}
            winReason={publicState.winReason}
            players={publicState.players}
            isHost={isHost}
            onPlayAgain={() => emitAction({ type: 'RESTART_GAME' })}
            onExit={handleExitRoom}
            lang={lang}
          />
        )}
      </main>

      {/* --- FLOATING DOSSIER PEEK MODAL --- */}
      {showDossierModal && myPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-900 border-2 border-amber-900 rounded-3xl p-6 relative">
            <button
              onClick={() => setShowDossierModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <RoleRevealCard
              player={myPlayer}
              lang={lang}
              canAdvance={false}
              onAcknowledge={() => setShowDossierModal(false)}
            />
          </div>
        </div>
      )}

      {/* --- HOW TO PLAY MODAL --- */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-stone-900 border border-stone-700 rounded-3xl p-6 text-stone-200">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3 mb-4">
              <h3 className="font-serif font-black text-xl text-amber-200">
                {t.howToPlay}
              </h3>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="text-stone-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>
            <div className="text-xs sm:text-sm font-serif space-y-3 leading-relaxed text-stone-300">
              <p>
                <strong>{isFa ? 'هدف لیبرال‌ها:' : 'Liberal Goal:'}</strong>{' '}
                {isFa
                  ? 'تصویب ۵ قانون لیبرال یا شناسایی و اعدام هیتلر.'
                  : 'Enact 5 Liberal policies or assassinate Hitler.'}
              </p>
              <p>
                <strong>{isFa ? 'هدف فاشیست‌ها:' : 'Fascist Goal:'}</strong>{' '}
                {isFa
                  ? 'تصویب ۶ قانون فاشیست یا انتخاب هیتلر به عنوان صدراعظم پس از تصویب حداقل ۳ قانون فاشیستی.'
                  : 'Enact 6 Fascist policies or elect Hitler Chancellor after 3 Fascist policies are enacted.'}
              </p>
              <p>
                <strong>{isFa ? 'مراحل هر دور:' : 'Round Structure:'}</strong>{' '}
                {isFa
                  ? '۱) رئیس‌جمهور یک صدراعظم نامزد می‌کند. ۲) همه رأی Ja یا Nein می‌دهند. ۳) در صورت رأی اعتماد، رئیس‌جمهور ۳ کارت کشیده و یکی را می‌سوزاند. ۴) صدراعظم از ۲ کارت باقیمانده، یکی را تصویب می‌کند.'
                  : '1) President nominates a Chancellor. 2) Everyone votes Ja or Nein. 3) If elected, President draws 3 policies and discards 1. 4) Chancellor enacts 1 of the remaining 2.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="w-full text-center py-2 text-[10px] font-mono text-stone-600 border-t border-stone-900">
        Secret Hitler Digital Edition — Official Rules 1932 — PWA Ready
      </footer>
    </div>
  );
};
