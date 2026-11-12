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
import { RulesAssistantModal } from './components/RulesAssistantModal.js';
import { DeckPiles } from './components/DeckPiles.js';
import { Avatar, SectionTitle } from './components/ui.js';
import { GuideBanner } from './components/GuideBanner.js';
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
  LogOut,
  Smartphone,
  X,
  Users,
  Crown,
  Bot,
  Play,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  Hourglass,
  ScrollText,
} from 'lucide-react';

const getServerUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
};

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
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [nominatedTargetId, setNominatedTargetId] = useState<string | null>(null);
  const [isPassAndPlayMode, setIsPassAndPlayMode] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const isPassAndPlayModeRef = useRef(isPassAndPlayMode);
  isPassAndPlayModeRef.current = isPassAndPlayMode;
  const isFaRef = useRef(lang === 'fa');
  isFaRef.current = lang === 'fa';

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

  // Helper to safely reset online session & return to clean lobby
  const handleResetSession = () => {
    localStorage.removeItem('sh_room_code');
    localStorage.removeItem('sh_player_id');
    localStorage.removeItem('sh_session_token');
    setRoomCode('');
    setSessionToken('');
    setPlayerId('');
    setGameState(null);
    setErrorMessage(null);
    if (window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Socket Connection Management
  useEffect(() => {
    const serverUrl = getServerUrl();

    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Auto-reconnect to room ONLY if session is verified and matches saved room code
      if (isPassAndPlayModeRef.current) return;
      const storedRoom = localStorage.getItem('sh_room_code');
      const storedToken = localStorage.getItem('sh_session_token');
      if (storedRoom && storedToken && roomCode === storedRoom) {
        socket.emit('join-room', { roomCode: storedRoom, sessionToken: storedToken });
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
      // Offline mode must never be interrupted by online socket errors
      if (isPassAndPlayModeRef.current) return;

      const msg = data?.message || '';
      if (
        msg.includes('Invalid session or room') ||
        msg.includes('Room not found') ||
        msg.includes('Missing roomCode')
      ) {
        // Auto-wipe stale/invalid session so user is never locked in an error loop
        handleResetSession();
        setErrorMessage(
          isFaRef.current
            ? 'اتاق یا نشست شما منقضی شده است. به صفحه اصلی بازگشتید.'
            : 'Session or room expired. Returned to lobby.'
        );
      } else {
        setErrorMessage(msg);
      }
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
      const serverUrl = getServerUrl();

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
      const serverUrl = getServerUrl();

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
  const aliveCount = publicState?.players.filter((p) => p.isAlive).length ?? 0;
  const nameOf = (id?: string | null) => publicState?.players.find((p) => p.id === id)?.name || '';
  const canNominate = (id: string) =>
    !!publicState &&
    id !== playerId &&
    id !== publicState.lastElectedChancellorId &&
    (aliveCount <= 5 || id !== publicState.lastElectedPresidentId);

  const modalShell = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fadeIn';

  return (
    <div dir={isFa ? 'rtl' : 'ltr'} className="font-vazir flex min-h-screen flex-col text-slate-200">
      {/* --- TOP BAR --- */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#0a0d13]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(160deg,#ecc97c,#b8913f)',
                boxShadow: '0 8px 20px -8px rgba(217,179,106,.7), 0 1px 0 rgba(255,255,255,.4) inset',
              }}
            >
              <Landmark className="h-[18px] w-[18px] text-[#1b1407]" />
            </div>
            <div className="min-w-0 leading-tight">
              <h1 className="truncate text-[15px] font-extrabold text-white">{t.gameTitle}</h1>
              {publicState && (
                <span className="whitespace-nowrap text-[11px] font-semibold text-slate-400">
                  {t.roomCode}: <bdi dir="ltr" className="font-bold tracking-widest text-[#d9b36a]">{publicState.roomId}</bdi>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {myPlayer && phase && phase !== 'LOBBY' && (
              <button
                onClick={() => setShowDossierModal(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#d9b36a]/30 bg-[#d9b36a]/10 px-3 text-xs font-bold text-[#ecd08f] transition-all hover:bg-[#d9b36a]/20 active:scale-95"
              >
                <FolderLock className="h-4 w-4" />
                <span className="hidden sm:inline">{t.roleCard}</span>
              </button>
            )}
            <button onClick={() => setShowRulesModal(true)} className="icon-btn sm:w-auto sm:gap-1.5 sm:px-3" title={isFa ? 'راهنمای قوانین' : 'Rules Guide'} aria-label={isFa ? 'راهنمای قوانین' : 'Rules Guide'}>
              <BookOpen className="h-4 w-4" />
              <span className="hidden text-xs font-bold sm:inline">{isFa ? 'قوانین' : 'Rules'}</span>
            </button>
            <button onClick={toggleSound} className="icon-btn" title={t.soundToggle} aria-label={t.soundToggle}>
              {isMuted ? <VolumeX className="h-4 w-4 text-slate-500" /> : <Volume2 className="h-4 w-4 text-[#d9b36a]" />}
            </button>
            <button onClick={toggleLanguage} className="icon-btn text-xs font-extrabold text-[#d9b36a]" aria-label="Language">
              {lang === 'fa' ? 'EN' : 'فا'}
            </button>
            {(gameState || roomCode) && (
              <button
                onClick={handleResetSession}
                className="icon-btn hover:!border-red-500/40 hover:!text-red-400"
                title={isFa ? 'خروج به لابی اصلی' : 'Exit to Main Lobby'}
                aria-label={isFa ? 'خروج به لابی اصلی' : 'Exit to Main Lobby'}
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
            <span
              className={`mx-1 h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]' : 'animate-pulse bg-rose-500'}`}
              title={isConnected ? t.connected : t.reconnecting}
            />
          </div>
        </div>
      </header>

      {/* --- ERROR TOAST --- */}
      {errorMessage && !isPassAndPlayMode && (
        <div role="alert" className="fixed left-1/2 top-[72px] z-50 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-red-500/40 bg-[#2a1215]/95 px-4 py-3 text-sm text-red-100 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="rounded-lg p-1 text-red-200/70 hover:bg-white/10 hover:text-white" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* --- MAIN --- */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-3 py-5 sm:px-6 sm:py-8">
        {isPassAndPlayMode && <PassAndPlayGame onExit={() => setIsPassAndPlayMode(false)} lang={lang} />}

        {/* SCREEN 1: WELCOME */}
        {!isPassAndPlayMode && !gameState && (
          <div className="my-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            {/* Brand / pitch */}
            <section className="animate-fadeIn text-center lg:text-start">
              <span className="chip mb-5 border-[#d9b36a]/30 bg-[#d9b36a]/10 text-[#ecd08f]">
                <Sparkles className="h-3.5 w-3.5" />
                {isFa ? '۵ تا ۱۰ بازیکن · آنلاین و حضوری' : '5–10 players · online & in person'}
              </span>
              <h2 className="text-4xl font-black leading-[1.15] text-white sm:text-5xl lg:text-6xl">
                {t.gameTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-8 text-slate-400 lg:mx-0">
                {isFa
                  ? 'بازی استنتاج و فریب سیاسی در آلمانِ ۱۹۳۲. لیبرال‌ها باید هیتلر را پیدا کنند؛ فاشیست‌ها باید پنهان بمانند.'
                  : 'A game of hidden roles and political deception in 1932 Germany. Liberals must find Hitler; fascists must stay hidden.'}
              </p>
              <ul className="mx-auto mt-7 hidden max-w-md grid-cols-1 gap-3 text-sm text-slate-300 sm:grid lg:mx-0">
                {[
                  { icon: <Users className="h-4 w-4" />, a: isFa ? 'اتاق آنلاین با لینک دعوت' : 'Online rooms with invite link' },
                  { icon: <Smartphone className="h-4 w-4" />, a: isFa ? 'حالت دورهمی با یک گوشی' : 'Pass & Play on a single phone' },
                  { icon: <ShieldCheck className="h-4 w-4" />, a: isFa ? 'قوانین رسمی، اطلاعات محرمانه امن' : 'Official rules, secrets kept server-side' },
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#d9b36a]">{f.icon}</span>
                    {f.a}
                  </li>
                ))}
              </ul>
            </section>

            {/* Entry card */}
            <section className="card-surface-strong animate-fadeIn p-5 sm:p-7">
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="pname" className="mb-1.5 block text-xs font-bold text-slate-400">{t.yourName}</label>
                  <input
                    id="pname"
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder={t.enterYourName}
                    maxLength={18}
                    autoComplete="nickname"
                    className="field"
                  />
                </div>

                <div>
                  <label htmlFor="rcode" className="mb-1.5 block text-xs font-bold text-slate-400">{t.roomCode}</label>
                  <input
                    id="rcode"
                    type="text"
                    dir="ltr"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="• • • • •"
                    maxLength={5}
                    autoCapitalize="characters"
                    className="field text-center text-lg font-extrabold uppercase tracking-[0.5em] text-[#ecd08f]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleJoinRoom} className="btn-primary">
                    <LogIn className="h-4 w-4" />
                    <span>{t.joinRoom}</span>
                  </button>
                  <button onClick={handleCreateRoom} className="btn-ghost">
                    <UserPlus className="h-4 w-4" />
                    <span>{t.createRoom}</span>
                  </button>
                </div>

                <div className="relative my-1 flex items-center">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="px-3 text-[11px] font-semibold text-slate-500">{isFa ? 'یا' : 'or'}</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <button
                  onClick={() => {
                    sound.playStampThump();
                    setIsPassAndPlayMode(true);
                  }}
                  className="group flex items-center gap-4 rounded-2xl border border-[#d9b36a]/25 bg-gradient-to-br from-[#d9b36a]/[0.12] to-transparent p-4 text-start transition-all hover:border-[#d9b36a]/50 hover:from-[#d9b36a]/[0.2] active:scale-[0.98]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d9b36a]/15 text-[#ecd08f]">
                    <Smartphone className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold text-white">
                      {isFa ? 'بازی دورهمی با یک گوشی' : 'Play with one phone'}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {isFa ? 'آفلاین · بدون نیاز به اینترنت' : 'Offline · Pass & Play'}
                    </span>
                  </span>
                  <ChevronLeft className={`h-5 w-5 text-[#d9b36a] transition-transform group-hover:-translate-x-1 ${isFa ? '' : 'rotate-180'}`} />
                </button>

                <button
                  onClick={() => setShowHowToPlay(true)}
                  className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-[#ecd08f]"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{t.howToPlay}</span>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* SCREEN 2: LOBBY */}
        {publicState && phase === 'LOBBY' && (
          <div className="card-surface-strong my-auto w-full max-w-xl animate-fadeIn p-5 sm:p-7">
            <div className="text-center">
              <div className="eyebrow mb-2">{isFa ? 'اتاق انتظار' : 'Game lobby'}</div>
              <button
                onClick={handleCopyLink}
                className="group inline-flex items-center gap-3 rounded-2xl border border-dashed border-[#d9b36a]/50 bg-black/30 px-6 py-3 transition-all hover:border-[#d9b36a] hover:bg-[#d9b36a]/10 active:scale-95"
                title={t.copyLink}
              >
                <bdi dir="ltr" className="text-3xl font-black tracking-[0.35em] text-[#ecd08f]">{publicState.roomId}</bdi>
                <span className="chip border-[#d9b36a]/30 text-[#ecd08f]">
                  <Copy className="h-3.5 w-3.5" />
                  {t.copyLink}
                </span>
              </button>
            </div>

            {/* Player slots */}
            <div className="mt-7">
              <SectionTitle
                icon={<Users className="h-4 w-4 text-[#d9b36a]" />}
                right={
                  <span dir="ltr" className="text-xs font-bold tabular-nums text-slate-400">
                    {publicState.players.length} / 10
                  </span>
                }
              >
                {t.playersInLobby}
              </SectionTitle>

              {/* min-players progress */}
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${publicState.players.length >= 5 ? 'bg-emerald-400' : 'bg-[#d9b36a]'}`}
                  style={{ width: `${Math.min(100, (publicState.players.length / 5) * 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {publicState.players.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5">
                    <Avatar name={p.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-bold text-white"><bdi>{p.name}</bdi></span>
                        {p.id === playerId && (
                          <span className="rounded-md bg-[#d9b36a] px-1.5 text-[10px] font-extrabold text-[#1b1407]">{isFa ? 'شما' : 'You'}</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500" dir="ltr">#{idx + 1}</span>
                    </div>
                    {p.isHost && <Crown className="h-4 w-4 shrink-0 text-[#d9b36a]" aria-label={t.host} />}
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 5 - publicState.players.length) }).map((_, i) => (
                  <div key={`empty_${i}`} className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 p-2.5 text-xs text-slate-600">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-white/10">
                      <UserPlus className="h-4 w-4" />
                    </span>
                    {isFa ? 'صندلی خالی…' : 'Open seat…'}
                  </div>
                ))}
              </div>
            </div>

            {/* Host controls / waiting */}
            {isHost ? (
              <div className="mt-6 flex flex-col gap-3">
                <p className={`rounded-xl border px-4 py-3 text-center text-xs leading-6 ${
                  publicState.players.length < 5
                    ? 'border-[#d9b36a]/30 bg-[#d9b36a]/[0.08] text-[#ecd08f]'
                    : 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200'
                }`}>
                  {publicState.players.length < 5
                    ? isFa
                      ? `برای شروع حداقل ۵ بازیکن لازم است (اکنون ${publicState.players.length} نفر). لینک دعوت را بفرستید یا ربات اضافه کنید.`
                      : `At least 5 players needed (${publicState.players.length} now). Share the link or add bots.`
                    : isFa
                    ? `همه‌چیز آماده است (${publicState.players.length} نفر). می‌توانید بازی را شروع کنید.`
                    : `Ready with ${publicState.players.length} players. You can start the game.`}
                </p>

                <button
                  disabled={publicState.players.length < 5 || publicState.players.length > 10}
                  onClick={handleStartGame}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  <Play className="h-4 w-4" />
                  <span>{t.startGame}</span>
                </button>

                {publicState.players.length < 10 && (
                  <button onClick={handleAddBot} className="btn-ghost w-full text-xs">
                    <Bot className="h-4 w-4 text-[#d9b36a]" />
                    <span>{t.addBot}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-center text-xs leading-6 text-slate-400">
                <div className="mb-1 flex items-center justify-center gap-1.5 font-bold text-[#ecd08f]">
                  <Crown className="h-4 w-4" />
                  {isFa ? `میزبان: ${hostPlayer?.name || 'میزبان'}` : `Host: ${hostPlayer?.name || 'Host'}`}
                </div>
                {publicState.players.length >= 5
                  ? isFa ? 'در انتظار شروع بازی توسط میزبان…' : 'Waiting for the host to start…'
                  : isFa ? `در انتظار تکمیل بازیکنان (${publicState.players.length} از ۵)…` : `Waiting for players (${publicState.players.length}/5)…`}
              </div>
            )}

            <button onClick={handleExitRoom} className="mx-auto mt-5 block text-xs font-semibold text-slate-500 transition-colors hover:text-slate-200">
              {isFa ? '→' : '←'} {t.exitToMenu}
            </button>
          </div>
        )}

        {/* SCREEN 3: ROLE REVEAL */}
        {publicState && phase === 'ROLE_REVEAL' && myPlayer && (
          <RoleRevealCard player={myPlayer} lang={lang} canAdvance={isHost} onAcknowledge={handleFinishRoleReveal} />
        )}

        {/* SCREEN 4: GAME TABLE */}
        {publicState && phase !== 'LOBBY' && phase !== 'ROLE_REVEAL' && (
          <div className="grid w-full animate-fadeIn gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
            {/* ---- Sidebar: government + current action (first on mobile) ---- */}
            <aside className="flex flex-col gap-4 lg:sticky lg:top-[72px] lg:order-2">
              <GovernmentPlacards
                presidentName={nameOf(publicState.presidentId) || null}
                chancellorName={nameOf(publicState.chancellorId || publicState.nominatedChancellorId) || null}
                isNominated={phase === 'ELECTION_NOMINATION' || phase === 'ELECTION_VOTING'}
                termLimitInfo={{
                  lastPresidentName: publicState.lastElectedPresidentId ? nameOf(publicState.lastElectedPresidentId) : null,
                  lastChancellorName: publicState.lastElectedChancellorId ? nameOf(publicState.lastElectedChancellorId) : null,
                }}
                failedElectionCount={publicState.failedElectionCount}
                lang={lang}
              />

              <GuideBanner
                phase={phase!}
                lang={lang}
                isPresident={publicState.presidentId === playerId}
                isChancellor={publicState.chancellorId === playerId}
                hasVoted={publicState.votedPlayerIds.includes(playerId)}
                isAlive={myPlayer?.isAlive ?? true}
                vetoUnlocked={publicState.vetoUnlocked}
                power={publicState.pendingExecutivePower}
                presidentName={nameOf(publicState.presidentId)}
                chancellorName={nameOf(publicState.chancellorId || publicState.nominatedChancellorId)}
                role={myPlayer?.role as any}
              />

              {/* 1. NOMINATION */}
              {phase === 'ELECTION_NOMINATION' && (
                <div className="card-surface p-4 sm:p-5">
                  <div className="eyebrow mb-1">{t.nominationPhase}</div>
                  {publicState.presidentId === playerId ? (
                    <>
                      <h3 className="mb-1 text-base font-extrabold text-white">{t.nominatePrompt}</h3>
                      <p className="mb-3 text-xs text-slate-400">
                        {isFa ? 'یک بازیکن را از میز یا فهرست زیر انتخاب کنید.' : 'Pick a player from the table or the list below.'}
                      </p>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {publicState.players.filter((p) => p.isAlive && canNominate(p.id)).map((p) => {
                          const active = nominatedTargetId === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => setNominatedTargetId(p.id)}
                              aria-pressed={active}
                              className={`flex items-center gap-2 rounded-full border py-1 pe-3 ps-1 text-xs font-bold transition-all active:scale-95 ${
                                active
                                  ? 'border-[#d9b36a] bg-[#d9b36a]/20 text-[#ecd08f] shadow-[0_0_0_3px_rgba(217,179,106,.15)]'
                                  : 'border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.09]'
                              }`}
                            >
                              <Avatar name={p.name} size="sm" />
                              <bdi>{p.name}</bdi>
                            </button>
                          );
                        })}
                      </div>
                      <button
                        disabled={!nominatedTargetId}
                        onClick={() => {
                          if (nominatedTargetId) {
                            sound.playStampThump();
                            emitAction({ type: 'NOMINATE_CHANCELLOR', chancellorId: nominatedTargetId });
                            setNominatedTargetId(null);
                          }
                        }}
                        className="btn-primary w-full"
                      >
                        {t.nominateButton}
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 py-1 text-sm text-slate-300">
                      <Hourglass className="h-5 w-5 shrink-0 animate-pulse text-[#d9b36a]" />
                      <span>
                        {isFa
                          ? `رئیس‌جمهور (${nameOf(publicState.presidentId)}) در حال انتخاب صدراعظم است…`
                          : `President (${nameOf(publicState.presidentId)}) is nominating a Chancellor…`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 2. VOTING */}
              {phase === 'ELECTION_VOTING' && (
                <VotingModal
                  presidentName={nameOf(publicState.presidentId) || 'President'}
                  chancellorName={nameOf(publicState.nominatedChancellorId) || 'Chancellor'}
                  hasVoted={publicState.votedPlayerIds.includes(playerId)}
                  onCastVote={(vote: VoteChoice) => emitAction({ type: 'CAST_VOTE', vote })}
                  lastElection={publicState.lastElection}
                  phase={phase}
                  votedPlayerCount={publicState.votedPlayerIds.length}
                  totalLivingPlayers={aliveCount}
                  players={publicState.players}
                  lang={lang}
                />
              )}

              {/* 3. LEGISLATIVE */}
              {(phase === 'LEGISLATIVE_PRESIDENT' || phase === 'LEGISLATIVE_CHANCELLOR' || phase === 'LEGISLATIVE_VETO_OFFERED') && (
                <LegislativeModal
                  phase={phase}
                  isPresident={publicState.presidentId === playerId}
                  isChancellor={publicState.chancellorId === playerId}
                  drawnPolicies={gameState.drawnPolicies}
                  vetoUnlocked={publicState.vetoUnlocked}
                  onPresidentDiscard={(cardIndex) => emitAction({ type: 'PRESIDENT_DISCARD', cardIndex })}
                  onChancellorDiscard={(cardIndex) => emitAction({ type: 'CHANCELLOR_DISCARD', cardIndex })}
                  onRequestVeto={() => emitAction({ type: 'REQUEST_VETO' })}
                  onRespondVeto={(agree) => emitAction({ type: 'RESPOND_VETO', agree })}
                  lang={lang}
                />
              )}

              {/* 4. EXECUTIVE POWER */}
              {phase === 'EXECUTIVE_POWER' && publicState.pendingExecutivePower && (
                <ExecutivePowerModal
                  power={publicState.pendingExecutivePower}
                  isPresident={publicState.presidentId === playerId}
                  presidentName={nameOf(publicState.presidentId) || 'President'}
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

              <DeckPiles drawPileCount={publicState.drawPileCount} discardPileCount={publicState.discardPileCount} lang={lang} />

              {publicState.logs && publicState.logs.length > 0 && (
                <div className="card-surface flex items-start gap-3 p-3.5">
                  <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-500">{isFa ? 'آخرین رویداد' : 'Latest event'}</div>
                    <div className="line-clamp-2 text-xs leading-6 text-slate-300">
                      {publicState.logs[publicState.logs.length - 1].message}
                    </div>
                  </div>
                </div>
              )}
            </aside>

            {/* ---- Main: boards + seats ---- */}
            <div className="flex min-w-0 flex-col gap-5 lg:order-1">
              <BoardTracks
                liberalPoliciesEnacted={publicState.liberalPoliciesEnacted}
                fascistPoliciesEnacted={publicState.fascistPoliciesEnacted}
                failedElectionCount={publicState.failedElectionCount}
                playerCount={publicState.players.length}
                lang={lang}
              />

              <SeatingTable
                players={publicState.players}
                seatingOrder={publicState.seatingOrder}
                presidentId={publicState.presidentId}
                chancellorId={publicState.chancellorId}
                nominatedChancellorId={publicState.nominatedChancellorId}
                lastElectedPresidentId={publicState.lastElectedPresidentId}
                lastElectedChancellorId={publicState.lastElectedChancellorId}
                myPlayerId={playerId}
                votedPlayerIds={publicState.votedPlayerIds}
                lang={lang}
                selectedPlayerId={nominatedTargetId}
                onSelectPlayer={(id) => setNominatedTargetId(id)}
                isSelectable={(id) =>
                  phase === 'ELECTION_NOMINATION' && publicState.presidentId === playerId ? canNominate(id) : false
                }
              />
            </div>
          </div>
        )}

        {/* SCREEN 5: VICTORY */}
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

      {/* --- DOSSIER PEEK MODAL --- */}
      {showDossierModal && myPlayer && (
        <div className={modalShell} onClick={() => setShowDossierModal(false)}>
          <div className="card-surface-strong relative w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowDossierModal(false)} className="icon-btn absolute end-3 top-3 z-10 !h-8 !w-8" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            <RoleRevealCard player={myPlayer} lang={lang} canAdvance={false} onAcknowledge={() => setShowDossierModal(false)} />
          </div>
        </div>
      )}

      {/* --- HOW TO PLAY --- */}
      {showHowToPlay && (
        <div className={modalShell} onClick={() => setShowHowToPlay(false)}>
          <div className="card-surface-strong max-h-[85vh] w-full max-w-lg overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-extrabold text-white">{t.howToPlay}</h3>
              <button onClick={() => setShowHowToPlay(false)} className="icon-btn !h-8 !w-8" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <p>
                <strong className="text-[#6fc0e0]">{isFa ? 'هدف لیبرال‌ها: ' : 'Liberal goal: '}</strong>
                {isFa ? 'تصویب ۵ قانون لیبرال یا شناسایی و اعدام هیتلر.' : 'Enact 5 Liberal policies or assassinate Hitler.'}
              </p>
              <p>
                <strong className="text-[#f0807a]">{isFa ? 'هدف فاشیست‌ها: ' : 'Fascist goal: '}</strong>
                {isFa
                  ? 'تصویب ۶ قانون فاشیست یا انتخاب هیتلر به عنوان صدراعظم پس از تصویب حداقل ۳ قانون فاشیستی.'
                  : 'Enact 6 Fascist policies or elect Hitler Chancellor after 3 Fascist policies are enacted.'}
              </p>
              <p>
                <strong className="text-[#ecd08f]">{isFa ? 'مراحل هر دور: ' : 'Each round: '}</strong>
                {isFa
                  ? '۱) رئیس‌جمهور یک صدراعظم نامزد می‌کند. ۲) همه رأی Ja یا Nein می‌دهند. ۳) در صورت رأی اعتماد، رئیس‌جمهور ۳ کارت کشیده و یکی را می‌سوزاند. ۴) صدراعظم از ۲ کارت باقیمانده، یکی را تصویب می‌کند.'
                  : '1) President nominates a Chancellor. 2) Everyone votes Ja or Nein. 3) If elected, President draws 3 policies and discards 1. 4) Chancellor enacts 1 of the remaining 2.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <RulesAssistantModal phase={phase || 'LOBBY'} isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} lang={lang} />

      <footer className="py-4 text-center text-[11px] text-slate-600">Secret Hitler · Digital Edition</footer>
    </div>
  );
};
