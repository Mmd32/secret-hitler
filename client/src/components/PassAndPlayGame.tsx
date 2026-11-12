import React, { useState, useEffect, useRef } from 'react';
import { SecretHitlerGame } from '../../../server/src/engine/SecretHitlerGame.js';
import {
  ClientGameState,
  ExecutivePower,
  PartyMembership,
  PlayerPublicView,
  PolicyType,
  VoteChoice,
} from '../../../server/src/engine/types.js';
import { BoardTracks } from './BoardTracks.js';
import { GovernmentPlacards } from './GovernmentPlacards.js';
import { SeatingTable } from './SeatingTable.js';
import { CardComponent } from './CardComponent.js';
import { VictoryScreen } from './VictoryScreen.js';
import { sound } from '../audio/SoundEffects.js';
import {
  Users,
  Lock,
  ArrowRight,
  Crown,
  CheckCircle2,
  XCircle,
  Play,
  UserPlus,
  Trash2,
} from 'lucide-react';

interface PassAndPlayGameProps {
  onExit: () => void;
  lang: 'fa' | 'en';
}

type PassStep =
  | 'SETUP'
  | 'ROLE_ENVELOPE'
  | 'ROLE_VIEW'
  | 'BOARD_NOMINATION'
  | 'VOTE_MODE_SELECT'
  | 'VOTE_ENVELOPE'
  | 'VOTE_CAST'
  | 'VOTE_RESULTS'
  | 'LEGISLATIVE_PRES_ENVELOPE'
  | 'LEGISLATIVE_PRES_DISCARD'
  | 'LEGISLATIVE_CHAN_ENVELOPE'
  | 'LEGISLATIVE_CHAN_DISCARD'
  | 'EXECUTIVE_ENVELOPE'
  | 'EXECUTIVE_ACTION'
  | 'EXECUTIVE_PEEK_VIEW'
  | 'EXECUTIVE_INVESTIGATE_VIEW'
  | 'VICTORY';

export const PassAndPlayGame: React.FC<PassAndPlayGameProps> = ({ onExit, lang }) => {
  const isFa = lang === 'fa';

  // Setup state
  const [playerNames, setPlayerNames] = useState<string[]>([
    'علی',
    'سارا',
    'رضا',
    'مریم',
    'امیر',
  ]);
  const [customNameInput, setCustomNameInput] = useState('');

  // Game instance ref
  const gameRef = useRef<SecretHitlerGame | null>(null);
  const [currentStep, setCurrentStep] = useState<PassStep>('SETUP');

  // Turn tracking within Pass & Play
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [activePlayerId, setActivePlayerId] = useState<string>('');
  const [envelopeHoldProgress, setEnvelopeHoldProgress] = useState(0);
  const holdTimerRef = useRef<any>(null);

  // Voting temporary store
  const [secretVotes, setSecretVotes] = useState<Record<string, VoteChoice>>({});
  const [selectedBallot, setSelectedBallot] = useState<VoteChoice | null>(null);

  // Legislative temporary store
  const [selectedDiscardIndex, setSelectedDiscardIndex] = useState<number | null>(null);

  // Executive temporary store
  const [executiveTargetId, setExecutiveTargetId] = useState<string | null>(null);
  const [investigationCard, setInvestigationCard] = useState<PartyMembership | null>(null);
  const [peekCards, setPeekCards] = useState<PolicyType[] | null>(null);

  // Reactive state synced from game instance
  const [publicState, setPublicState] = useState<any>(null);
  const [clientState, setClientState] = useState<ClientGameState | null>(null);

  // Force re-render helper
  const syncState = (targetPlayerId?: string) => {
    if (!gameRef.current) return;
    const pState = gameRef.current.getPublicState();
    setPublicState(pState);

    const pid = targetPlayerId || activePlayerId || gameRef.current.seatingOrder[0];
    if (pid) {
      const cState = gameRef.current.getClientState(pid);
      setClientState(cState);
    }
  };

  // Sound triggers on victory
  useEffect(() => {
    if (publicState?.winner) {
      sound.playVictory(publicState.winner === 'LIBERAL');
      setCurrentStep('VICTORY');
    }
  }, [publicState?.winner]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, []);

  // -------------------------------------------------------------
  // SETUP ACTIONS
  // -------------------------------------------------------------
  const handleAddPlayer = () => {
    const name = customNameInput.trim();
    if (!name) return;
    if (playerNames.length >= 10) return;
    setPlayerNames([...playerNames, name]);
    setCustomNameInput('');
    sound.playCardFlip();
  };

  const handleRemovePlayer = (index: number) => {
    if (playerNames.length <= 5) return;
    const updated = playerNames.filter((_, i) => i !== index);
    setPlayerNames(updated);
    sound.playCardFlip();
  };

  const handleStartPassAndPlay = () => {
    if (playerNames.length < 5 || playerNames.length > 10) return;
    sound.playStampThump();

    const game = new SecretHitlerGame('OFFLINE_PASS_AND_PLAY');
    playerNames.forEach((name, idx) => {
      game.addPlayer(`p_${idx}`, name, idx === 0);
    });

    game.startGame();
    gameRef.current = game;

    setActivePlayerIndex(0);
    const firstPlayerId = game.seatingOrder[0];
    setActivePlayerId(firstPlayerId);

    const cState = game.getClientState(firstPlayerId);
    setClientState(cState);
    setPublicState(game.getPublicState());

    setCurrentStep('ROLE_ENVELOPE');
  };

  // -------------------------------------------------------------
  // CONFIDENTIAL ENVELOPE HOLD HANDLERS
  // -------------------------------------------------------------
  const startEnvelopeHold = () => {
    sound.playCardFlip();
    const startTime = Date.now();
    const duration = 280; // ms to break wax seal

    if (holdTimerRef.current) clearInterval(holdTimerRef.current);

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setEnvelopeHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdTimerRef.current);
        if (navigator.vibrate) navigator.vibrate(50);
        setCurrentStep('ROLE_VIEW');
      }
    }, 16);
  };

  const endEnvelopeHold = () => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    setEnvelopeHoldProgress(0);
  };

  // -------------------------------------------------------------
  // ROLE REVEAL CYCLE
  // -------------------------------------------------------------
  const handleNextRoleReveal = () => {
    if (!gameRef.current) return;
    sound.playCardFlip();
    setEnvelopeHoldProgress(0);

    const nextIdx = activePlayerIndex + 1;
    if (nextIdx < gameRef.current.seatingOrder.length) {
      setActivePlayerIndex(nextIdx);
      const nextId = gameRef.current.seatingOrder[nextIdx];
      setActivePlayerId(nextId);
      setClientState(gameRef.current.getClientState(nextId));
      setCurrentStep('ROLE_ENVELOPE');
    } else {
      // All players acknowledged their role
      gameRef.current.finishRoleReveal();
      const currentPresId = gameRef.current.presidentId!;
      setActivePlayerId(currentPresId);
      syncState(currentPresId);
      sound.playGavel();
      setCurrentStep('BOARD_NOMINATION');
    }
  };

  // -------------------------------------------------------------
  // NOMINATION
  // -------------------------------------------------------------
  const handleNominateChancellor = (targetChancellorId: string) => {
    if (!gameRef.current || !gameRef.current.presidentId) return;
    sound.playStampThump();
    gameRef.current.nominateChancellor(gameRef.current.presidentId, targetChancellorId);
    syncState();
    setCurrentStep('VOTE_MODE_SELECT');
  };

  // -------------------------------------------------------------
  // VOTING MODES (SECRET PASS OR MANUAL SHOW-OF-HANDS)
  // -------------------------------------------------------------
  const handleStartSecretVoting = () => {
    if (!gameRef.current) return;
    setSecretVotes({});
    setSelectedBallot(null);
    setActivePlayerIndex(0);
    const living = gameRef.current.livingPlayers;
    setActivePlayerId(living[0].id);
    setCurrentStep('VOTE_ENVELOPE');
  };

  const handleCastSecretVote = (choice: VoteChoice) => {
    if (!gameRef.current) return;
    sound.playVoteClick();
    setSelectedBallot(choice);

    const updated = { ...secretVotes, [activePlayerId]: choice };
    setSecretVotes(updated);

    const living = gameRef.current.livingPlayers;
    const nextIdx = activePlayerIndex + 1;

    setTimeout(() => {
      setSelectedBallot(null);
      setEnvelopeHoldProgress(0);

      if (nextIdx < living.length) {
        setActivePlayerIndex(nextIdx);
        setActivePlayerId(living[nextIdx].id);
        setCurrentStep('VOTE_ENVELOPE');
      } else {
        // All living players voted! Submit to engine
        Object.entries(updated).forEach(([pId, vChoice]) => {
          gameRef.current?.castVote(pId, vChoice);
        });
        syncState();
        setCurrentStep('VOTE_RESULTS');
      }
    }, 400);
  };

  const handleManualVoteResolution = (passed: boolean) => {
    if (!gameRef.current) return;
    sound.playVoteClick();
    const living = gameRef.current.livingPlayers;
    const majority = Math.floor(living.length / 2) + 1;

    living.forEach((p, idx) => {
      const voteChoice: VoteChoice = passed
        ? 'JA'
        : idx < majority
        ? 'NEIN'
        : 'JA';
      gameRef.current?.castVote(p.id, voteChoice);
    });

    syncState();
    setCurrentStep('VOTE_RESULTS');
  };

  const handleAcknowledgeVoteResults = () => {
    if (!gameRef.current) return;
    sound.playCardFlip();
    syncState();

    if (gameRef.current.phase === 'GAME_OVER') {
      setCurrentStep('VICTORY');
      return;
    }

    if (gameRef.current.phase === 'LEGISLATIVE_PRESIDENT') {
      // Vote passed! Hand to President
      setActivePlayerId(gameRef.current.presidentId!);
      setSelectedDiscardIndex(null);
      setCurrentStep('LEGISLATIVE_PRES_ENVELOPE');
    } else {
      // Vote failed, moved to next nomination
      setActivePlayerId(gameRef.current.presidentId!);
      setCurrentStep('BOARD_NOMINATION');
    }
  };

  // -------------------------------------------------------------
  // LEGISLATIVE FLOW
  // -------------------------------------------------------------
  const handlePresidentDiscard = (cardIndex: number) => {
    if (!gameRef.current || !gameRef.current.presidentId) return;
    sound.playStampThump();
    gameRef.current.presidentDiscard(gameRef.current.presidentId, cardIndex);
    syncState();

    // Pass to Chancellor
    setActivePlayerId(gameRef.current.chancellorId!);
    setSelectedDiscardIndex(null);
    setCurrentStep('LEGISLATIVE_CHAN_ENVELOPE');
  };

  const handleChancellorDiscard = (cardIndex: number) => {
    if (!gameRef.current || !gameRef.current.chancellorId) return;
    sound.playGavel();
    gameRef.current.chancellorDiscard(gameRef.current.chancellorId, cardIndex);
    syncState();

    if (gameRef.current.phase === 'GAME_OVER') {
      setCurrentStep('VICTORY');
      return;
    }

    if (gameRef.current.phase === 'EXECUTIVE_POWER') {
      setActivePlayerId(gameRef.current.presidentId!);
      setExecutiveTargetId(null);
      setCurrentStep('EXECUTIVE_ENVELOPE');
    } else {
      // Returned to nomination phase for next president
      setActivePlayerId(gameRef.current.presidentId!);
      setCurrentStep('BOARD_NOMINATION');
    }
  };

  // -------------------------------------------------------------
  // EXECUTIVE POWERS
  // -------------------------------------------------------------
  const handleExecutePower = (power: ExecutivePower, targetId?: string) => {
    if (!gameRef.current || !gameRef.current.presidentId) return;
    sound.playStampThump();

    if (power === 'POLICY_PEEK') {
      const top3 = gameRef.current.drawPile.slice(0, 3);
      setPeekCards(top3);
      gameRef.current.useExecutivePower(gameRef.current.presidentId, power);
      syncState();
      setCurrentStep('EXECUTIVE_PEEK_VIEW');
    } else if (power === 'INVESTIGATE_LOYALTY' && targetId) {
      const targetPlayer = gameRef.current.players.get(targetId);
      if (targetPlayer) {
        setInvestigationCard(targetPlayer.membership || null);
        gameRef.current.useExecutivePower(gameRef.current.presidentId, power, targetId);
        syncState();
        setCurrentStep('EXECUTIVE_INVESTIGATE_VIEW');
      }
    } else {
      // EXECUTION or SPECIAL_ELECTION
      gameRef.current.useExecutivePower(gameRef.current.presidentId, power, targetId);
      syncState();
      if (gameRef.current.phase === 'GAME_OVER') {
        setCurrentStep('VICTORY');
      } else {
        setActivePlayerId(gameRef.current.presidentId!);
        setCurrentStep('BOARD_NOMINATION');
      }
    }
  };

  // Current active player object
  const activePlayer = gameRef.current?.players.get(activePlayerId) || null;
  const presidentPlayer = gameRef.current?.presidentId
    ? gameRef.current.players.get(gameRef.current.presidentId)
    : null;
  const chancellorPlayer = gameRef.current?.chancellorId
    ? gameRef.current.players.get(gameRef.current.chancellorId)
    : gameRef.current?.nominatedChancellorId
    ? gameRef.current.players.get(gameRef.current.nominatedChancellorId)
    : null;

  // -------------------------------------------------------------
  // RENDER: SETUP SCREEN
  // -------------------------------------------------------------
  if (currentStep === 'SETUP') {
    return (
      <div className="w-full max-w-lg mx-auto p-4 sm:p-6 rounded-3xl bg-[#141923] border-2 border-[#2c3548] shadow-2xl flex flex-col items-center select-none animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-[#232b3b] border border-[#8a6f3d] flex items-center justify-center mb-3 shadow">
          <Users className="w-6 h-6 text-[#ecd08f]" />
        </div>

        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d9b36a] mb-1">
          {isFa ? 'بازی دورهمی با یک گوشی' : 'PASS & PLAY TABLETOP MODE'}
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-black text-[#eef1f6] text-center mb-2">
          {isFa ? 'تنظیم بازیکنان دور میز' : 'Setup Seat Assignments'}
        </h2>
        <p className="text-xs text-[#97a3b8] text-center mb-5 max-w-sm">
          {isFa
            ? 'نام ۵ تا ۱۰ بازیکن را وارد کنید. بازی به نوبت گوشی را بین بازیکنان دست‌به‌دست می‌کند.'
            : 'Enter 5 to 10 player names. The phone will be passed secretly between turns.'}
        </p>

        {/* Player Name Input */}
        <div className="w-full flex gap-2 mb-4">
          <input
            type="text"
            value={customNameInput}
            onChange={(e) => setCustomNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            placeholder={isFa ? 'نام بازیکن جدید...' : 'Enter player name...'}
            maxLength={18}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#26170f] border border-[#37425a] text-[#eef1f6] text-sm placeholder:text-[#6e4e34] focus:outline-none focus:border-[#d9b36a]"
          />
          <button
            onClick={handleAddPlayer}
            disabled={playerNames.length >= 10 || !customNameInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#8c5828] hover:bg-[#a66a32] text-[#eef1f6] font-serif font-bold text-xs uppercase disabled:opacity-40 transition-all flex items-center gap-1.5 shadow"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isFa ? 'افزودن' : 'Add'}</span>
          </button>
        </div>

        {/* Players List */}
        <div className="w-full flex flex-col gap-2 mb-5">
          <div className="flex justify-between items-center text-xs font-serif font-bold text-[#d9b36a] px-1">
            <span>
              {isFa ? 'ترتیب نشستن دور میز' : 'Seating Order'} ({playerNames.length}/10)
            </span>
            <span className="font-mono text-[11px] text-[#7d8aa0]">
              {playerNames.length < 5
                ? isFa
                  ? 'حداقل ۵ نفر لازم است'
                  : '5 minimum'
                : isFa
                ? 'آماده شروع'
                : 'Ready'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {playerNames.map((name, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b2230] border border-[#2c3548] text-xs font-serif shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1b100a] text-[#d9b36a] font-mono flex items-center justify-center text-[10px] font-bold border border-[#4a2e1b]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-[#eef1f6]">{name}</span>
                </div>
                {playerNames.length > 5 && (
                  <button
                    onClick={() => handleRemovePlayer(idx)}
                    className="text-[#96634a] hover:text-red-400 p-1"
                    title={isFa ? 'حذف' : 'Remove'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={handleStartPassAndPlay}
            disabled={playerNames.length < 5 || playerNames.length > 10}
            className={`w-full py-3.5 rounded-xl font-serif font-black text-sm uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 ${
              playerNames.length >= 5 && playerNames.length <= 10
                ? 'bg-[#d9b36a] hover:bg-[#e6bf78] text-[#1c100a] active:scale-98 ring-4 ring-[#d9b36a]/30'
                : 'bg-[#1b2230] text-[#566178] cursor-not-allowed border border-[#262e3f]'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {isFa ? 'آغاز بازی دورهمی' : 'Start Pass & Play'} ({playerNames.length} نفر)
            </span>
          </button>

          <button
            onClick={onExit}
            className="w-full py-2.5 rounded-xl text-xs font-serif text-[#7d8aa0] hover:text-[#d9beaa]"
          >
            ← {isFa ? 'بازگشت به منوی اصلی' : 'Back to Main Menu'}
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // REUSABLE CONFIDENTIAL TRANSITION ENVELOPE COMPONENT
  // -------------------------------------------------------------
  const renderConfidentialEnvelope = (
    recipientName: string,
    actionPrompt: string,
    onOpen: () => void,
    isHeldToView = false
  ) => (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 rounded-3xl bg-[#1e110a] border-2 border-[#2c3548] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center select-none text-center animate-fadeIn">
      {/* Archival Wax Seal Graphic */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-[#7a1818] border-4 border-[#9c2424] shadow-[0_8px_25px_rgba(156,36,36,0.6)] flex flex-col items-center justify-center text-amber-200">
          <Lock className="w-7 h-7 text-amber-300 mb-0.5" />
          <span className="font-mono text-[9px] uppercase tracking-widest font-black text-amber-200">
            STRENG
          </span>
          <span className="font-mono text-[8px] uppercase tracking-widest text-amber-300">
            GEHEIM
          </span>
        </div>
      </div>

      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d9b36a] mb-1">
        {isFa ? 'پاکت اسناد محرمانه کشور' : 'CONFIDENTIAL DIPLOMATIC POUCH'}
      </span>

      <h3 className="text-xl sm:text-2xl font-serif font-black text-[#eef1f6] mt-1 mb-2">
        {isFa ? `گوشی را به «${recipientName}» تحویل دهید` : `Pass Phone to "${recipientName}"`}
      </h3>

      <p className="text-xs text-[#97a3b8] mb-6 max-w-xs leading-relaxed">{actionPrompt}</p>

      {/* Touchable Action Button */}
      {isHeldToView ? (
        <div
          onMouseDown={startEnvelopeHold}
          onMouseUp={endEnvelopeHold}
          onMouseLeave={endEnvelopeHold}
          onTouchStart={startEnvelopeHold}
          onTouchEnd={endEnvelopeHold}
          className="relative w-full py-4 rounded-2xl bg-[#232b3b] border-2 border-[#8a6f3d] text-[#eef1f6] font-serif font-bold text-sm cursor-pointer shadow-lg active:scale-98 overflow-hidden"
        >
          {/* Progress bar */}
          <div
            className="absolute inset-y-0 start-0 bg-[#d9b36a]/30 transition-all duration-75 pointer-events-none"
            style={{ width: `${envelopeHoldProgress}%` }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-[#ecd08f]" />
            <span>
              {isFa
                ? 'برای باز کردن پاکت لمس کنید و نگه دارید'
                : 'Touch and hold to inspect pouch'}
            </span>
          </span>
        </div>
      ) : (
        <button
          onClick={onOpen}
          className="w-full py-3.5 rounded-2xl bg-[#d9b36a] hover:bg-[#e6bf78] text-[#1c100a] font-serif font-black text-sm uppercase tracking-wider shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{isFa ? 'آماده‌ام — باز کردن صفحه' : 'Ready — Open Document'}</span>
        </button>
      )}
    </div>
  );

  // -------------------------------------------------------------
  // RENDER: ROLE ENVELOPE & ROLE VIEW
  // -------------------------------------------------------------
  if (currentStep === 'ROLE_ENVELOPE') {
    return renderConfidentialEnvelope(
      activePlayer?.name || '',
      isFa
        ? 'نقش و وابستگی حزبی شما کاملاً محرمانه است. اطمینان حاصل کنید که شخص دیگری صفحه نمایش را نمی‌بیند.'
        : 'Your secret role is confidential. Ensure other players cannot see the screen.',
      () => setCurrentStep('ROLE_VIEW'),
      true
    );
  }

  if (currentStep === 'ROLE_VIEW') {
    const pView = clientState?.myPlayer;
    if (!pView) return null;

    const isHitler = pView.role === 'HITLER';

    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-6 rounded-3xl bg-[#141923] border-2 border-[#2c3548] shadow-2xl flex flex-col items-center select-none text-center animate-fadeIn">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d9b36a] mb-1">
          {isFa ? `پرونده محرمانه: ${pView.name}` : `CONFIDENTIAL DOSSIER: ${pView.name}`}
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-black text-[#eef1f6] mb-4">
          {pView.role === 'LIBERAL'
            ? isFa
              ? 'شما لیبرال هستید'
              : 'YOU ARE LIBERAL'
            : pView.role === 'FASCIST'
            ? isFa
              ? 'شما فاشیست هستید'
              : 'YOU ARE FASCIST'
            : isFa
            ? 'شما هیتلر هستید'
            : 'YOU ARE HITLER'}
        </h2>

        {/* Display Role Card & Membership Card Side-by-Side */}
        <div className="flex gap-4 justify-center items-center my-2">
          <CardComponent
            variant={
              pView.role === 'LIBERAL'
                ? 'ROLE_LIBERAL'
                : pView.role === 'FASCIST'
                ? 'ROLE_FASCIST'
                : 'ROLE_HITLER'
            }
            size="lg"
          />
          <CardComponent
            variant={
              pView.membership === 'LIBERAL' ? 'MEMBERSHIP_LIBERAL' : 'MEMBERSHIP_FASCIST'
            }
            size="lg"
          />
        </div>

        {/* Knowledge Table (Who are the other fascists/hitler) */}
        {pView.knownTeam && (
          <div className="w-full p-3 rounded-xl bg-[#1d2433] border border-[#37425a] my-3 text-start text-xs font-serif">
            <span className="text-[11px] font-mono text-red-300 font-bold block mb-1">
              👁️ {isFa ? 'اطلاعات محرمانه حزب:' : 'Party Intel:'}
            </span>
            {pView.knownTeam.allies?.map((ally) => (
              <div key={ally.id} className="text-[#eef1f6]">
                • <span className="font-bold">{ally.name}</span>: {isFa ? 'فاشیست' : 'Fascist'}
              </div>
            ))}
            {pView.knownTeam.hitler && (
              <div className="text-amber-300 font-bold">
                • <span>{pView.knownTeam.hitler.name}</span>: {isFa ? 'هیتلر' : 'Hitler'}
              </div>
            )}
          </div>
        )}

        {isHitler && !pView.knownTeam?.allies?.length && (
          <div className="w-full p-3 rounded-xl bg-[#1d2433] border border-[#37425a] my-3 text-center text-xs font-serif text-[#eef1f6]">
            {isFa
              ? 'در بازی‌های ۷ نفره به بالا، شما هویت فاشیست‌ها را نمی‌دانید؛ اما آنها شما را می‌شناسند!'
              : 'In 7+ player games, you do not know who your fellow Fascists are, but they know you!'}
          </div>
        )}

        <button
          onClick={handleNextRoleReveal}
          className="w-full mt-4 py-3.5 rounded-2xl bg-[#d9b36a] hover:bg-[#e6bf78] text-[#1c100a] font-serif font-black text-sm uppercase tracking-wider shadow-xl active:scale-95 transition-all"
        >
          {activePlayerIndex + 1 < (gameRef.current?.seatingOrder.length || 0)
            ? isFa
              ? 'متوجه شدم — تحویل به نفر بعدی'
              : 'Understood — Pass to Next Player'
            : isFa
            ? 'همه دیدند — آغاز بازی!'
            : 'All Done — Start the Game!'}
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SHARED HEADER FOR MAIN PLAYING PHASES
  // -------------------------------------------------------------
  const renderGameHeader = () => (
    <>
      <GovernmentPlacards
        presidentName={presidentPlayer?.name || null}
        chancellorName={chancellorPlayer?.name || null}
        isNominated={currentStep === 'BOARD_NOMINATION' || currentStep === 'VOTE_MODE_SELECT'}
        termLimitInfo={{
          lastPresidentName: publicState?.lastElectedPresidentId
            ? gameRef.current?.players.get(publicState.lastElectedPresidentId)?.name
            : null,
          lastChancellorName: publicState?.lastElectedChancellorId
            ? gameRef.current?.players.get(publicState.lastElectedChancellorId)?.name
            : null,
        }}
        lang={lang}
      />

      <BoardTracks
        liberalPoliciesEnacted={publicState?.liberalPoliciesEnacted || 0}
        fascistPoliciesEnacted={publicState?.fascistPoliciesEnacted || 0}
        failedElectionCount={publicState?.failedElectionCount || 0}
        playerCount={publicState?.players?.length || 5}
        lang={lang}
      />

      <SeatingTable
        players={publicState?.players || []}
        seatingOrder={publicState?.seatingOrder || []}
        presidentId={publicState?.presidentId || null}
        chancellorId={publicState?.chancellorId || null}
        nominatedChancellorId={publicState?.nominatedChancellorId || null}
        lastElectedPresidentId={publicState?.lastElectedPresidentId || null}
        lastElectedChancellorId={publicState?.lastElectedChancellorId || null}
        myPlayerId={null}
        lang={lang}
      />
    </>
  );

  // -------------------------------------------------------------
  // RENDER: BOARD NOMINATION PHASE
  // -------------------------------------------------------------
  if (currentStep === 'BOARD_NOMINATION') {
    const eligiblePlayers =
      publicState?.players?.filter((p: PlayerPublicView) => {
        if (!p.isAlive) return false;
        if (p.id === publicState.presidentId) return false;
        if (p.id === publicState.lastElectedChancellorId) return false;
        const livingCount = publicState.players.filter((pl: any) => pl.isAlive).length;
        if (livingCount > 5 && p.id === publicState.lastElectedPresidentId) return false;
        return true;
      }) || [];

    return (
      <div className="w-full flex flex-col gap-4 select-none animate-fadeIn">
        {renderGameHeader()}

        <div className="w-full p-4 sm:p-5 rounded-2xl bg-[#1a202c] border-2 border-[#37425a] shadow-xl text-center flex flex-col items-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d9b36a] mb-1">
            {isFa ? 'مرحله اول: نامزدی صدراعظم' : 'PHASE 1: CHANCELLOR NOMINATION'}
          </span>
          <h3 className="text-base sm:text-lg font-serif font-black text-[#eef1f6] mb-1">
            {isFa
              ? `رئیس‌جمهور «${presidentPlayer?.name}» باید صدراعظم پیشنهادی خود را انتخاب کند`
              : `President "${presidentPlayer?.name}" must nominate a Chancellor`}
          </h3>
          <p className="text-xs text-[#97a3b8] mb-4">
            {isFa
              ? 'بازیکنان دارای محدودیت دور قبل نمی‌توانند انتخاب شوند.'
              : 'Term-limited players cannot be nominated.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-md">
            {eligiblePlayers.map((p: PlayerPublicView) => (
              <button
                key={p.id}
                onClick={() => handleNominateChancellor(p.id)}
                className="py-3 px-2 rounded-xl bg-[#232b3b] hover:bg-[#2c3548] border border-[#7a4c2b] text-[#eef1f6] font-serif font-bold text-xs uppercase shadow transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 text-[#ecd08f]" />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: VOTE MODE SELECT (SECRET OR SHOW OF HANDS)
  // -------------------------------------------------------------
  if (currentStep === 'VOTE_MODE_SELECT') {
    return (
      <div className="w-full flex flex-col gap-4 select-none animate-fadeIn">
        {renderGameHeader()}

        <div className="w-full max-w-md mx-auto p-5 rounded-2xl bg-[#1a202c] border-2 border-[#37425a] shadow-xl text-center flex flex-col items-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d9b36a] mb-1">
            {isFa ? 'مرحله دوم: رأی اعتماد به دولت' : 'PHASE 2: CONFIDENCE VOTE'}
          </span>
          <h3 className="text-base sm:text-lg font-serif font-black text-[#eef1f6] mb-3">
            {isFa
              ? `دولت پیشنهادی: ${presidentPlayer?.name} و ${chancellorPlayer?.name}`
              : `Proposed Government: ${presidentPlayer?.name} & ${chancellorPlayer?.name}`}
          </h3>
          <p className="text-xs text-[#97a3b8] mb-5">
            {isFa
              ? 'چگونه می‌خواهید رأی‌گیری را انجام دهید؟'
              : 'How would you like to conduct the vote?'}
          </p>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleStartSecretVoting}
              className="w-full py-3.5 rounded-xl bg-[#d9b36a] hover:bg-[#e6bf78] text-[#1c100a] font-serif font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isFa
                  ? 'رأی‌گیری محرمانه با گوشی (دست‌به‌دست)'
                  : 'Pass the Phone (Secret Digital Ballots)'}
              </span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#2c3548]"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono text-[#7d8aa0] uppercase">
                {isFa ? 'یا رأی‌گیری حضوری' : 'or Show of Hands'}
              </span>
              <div className="flex-grow border-t border-[#2c3548]"></div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => handleManualVoteResolution(true)}
                className="flex-1 py-3 rounded-xl bg-[#1d3d2c] hover:bg-[#28573f] border border-[#3b7857] text-[#c7ecd6] font-serif font-bold text-xs uppercase shadow transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'تصویب شد (Ja)' : 'Vote Passed (Ja)'}</span>
              </button>
              <button
                onClick={() => handleManualVoteResolution(false)}
                className="flex-1 py-3 rounded-xl bg-[#3d1917] hover:bg-[#572421] border border-[#783733] text-[#ecd0cf] font-serif font-bold text-xs uppercase shadow transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                <span>{isFa ? 'رد شد (Nein)' : 'Vote Rejected (Nein)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: SECRET VOTING ENVELOPE & CAST
  // -------------------------------------------------------------
  if (currentStep === 'VOTE_ENVELOPE') {
    return renderConfidentialEnvelope(
      activePlayer?.name || '',
      isFa
        ? 'کارت رأی خود را مخفیانه ثبت کنید. تمام آرا پس از اتمام نوبت همه بازیکنان به یکباره خوانده خواهند شد.'
        : 'Cast your confidential ballot. All votes will be revealed simultaneously at the end.',
      () => setCurrentStep('VOTE_CAST')
    );
  }

  if (currentStep === 'VOTE_CAST') {
    return (
      <div className="w-full max-w-md mx-auto p-5 rounded-3xl bg-[#141923] border-2 border-[#2c3548] shadow-2xl flex flex-col items-center select-none text-center animate-fadeIn">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d9b36a] mb-1">
          {isFa ? `برگه رأی: ${activePlayer?.name}` : `BALLOT: ${activePlayer?.name}`}
        </span>
        <h3 className="text-lg font-serif font-black text-[#eef1f6] mb-1">
          {isFa
            ? `آیا به دولت ${presidentPlayer?.name} و ${chancellorPlayer?.name} رأی می‌دهید؟`
            : `Confirm Government: ${presidentPlayer?.name} & ${chancellorPlayer?.name}?`}
        </h3>
        <p className="text-xs text-[#97a3b8] mb-5">
          {isFa
            ? 'روی کارت موافق (JA) یا مخالف (NEIN) ضربه بزنید:'
            : 'Tap Ja! or Nein! ballot to cast:'}
        </p>

        <div className="flex gap-4 sm:gap-6 justify-center items-center my-3">
          <CardComponent
            variant="BALLOT_JA"
            size="lg"
            isSelected={selectedBallot === 'JA'}
            onClick={() => handleCastSecretVote('JA')}
            className="cursor-pointer active:scale-95"
          />
          <CardComponent
            variant="BALLOT_NEIN"
            size="lg"
            isSelected={selectedBallot === 'NEIN'}
            onClick={() => handleCastSecretVote('NEIN')}
            className="cursor-pointer active:scale-95"
          />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: VOTE RESULTS (REVEAL ALL BALLOTS)
  // -------------------------------------------------------------
  if (currentStep === 'VOTE_RESULTS') {
    const lastRec = publicState?.lastElection;
    const passed = lastRec?.passed || false;

    return (
      <div className="w-full flex flex-col gap-4 select-none animate-fadeIn">
        {renderGameHeader()}

        <div className="w-full max-w-lg mx-auto p-5 rounded-3xl bg-[#141923] border-2 border-[#2c3548] shadow-2xl flex flex-col items-center text-center">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-lg border-2 ${
              passed
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-red-950 border-red-500 text-red-300'
            }`}
          >
            {passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>

          <h3 className="text-xl font-serif font-black text-[#eef1f6] mb-1">
            {passed
              ? isFa
                ? 'رأی اعتماد تصویب شد!'
                : 'Government Elected!'
              : isFa
              ? 'رأی اعتماد رد شد!'
              : 'Election Failed!'}
          </h3>

          <div className="text-xs font-mono font-bold text-[#d9b36a] mb-4 bg-[#10141c] px-3 py-1 rounded-full border border-[#262e3f]">
            {lastRec?.jaCount || 0} JA — {lastRec?.neinCount || 0} NEIN
          </div>

          {/* Reveal each player's ballot */}
          <div className="w-full grid grid-cols-2 gap-2 my-2">
            {Object.entries(lastRec?.votes || {}).map(([pId, vChoice]) => {
              const p = gameRef.current?.players.get(pId);
              return (
                <div
                  key={pId}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs font-serif ${
                    vChoice === 'JA'
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                      : 'bg-red-950/60 border-red-800 text-red-200'
                  }`}
                >
                  <span className="font-bold truncate">{p?.name || pId}</span>
                  <span className="font-mono font-black">{String(vChoice)}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleAcknowledgeVoteResults}
            className="w-full mt-4 py-3.5 rounded-2xl bg-[#d9b36a] hover:bg-[#e6bf78] text-[#1c100a] font-serif font-black text-xs uppercase tracking-wider shadow-xl active:scale-95 transition-all"
          >
            {isFa ? 'ادامه بازی' : 'Proceed'}
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: LEGISLATIVE SESSIONS (PRESIDENT & CHANCELLOR)
  // -------------------------------------------------------------
  if (currentStep === 'LEGISLATIVE_PRES_ENVELOPE') {
    return renderConfidentialEnvelope(
      presidentPlayer?.name || '',
      isFa
        ? '۳ کارت قانون از دسته کشیده شده است. شما باید ۱ کارت را مخفیانه بسوزانید و ۲ کارت باقی‌مانده را به صدراعظم تحویل دهید.'
        : '3 policies drawn. Choose 1 policy to discard secretly; the remaining 2 will pass to the Chancellor.',
      () => setCurrentStep('LEGISLATIVE_PRES_DISCARD')
    );
  }

  if (currentStep === 'LEGISLATIVE_PRES_DISCARD') {
    const drawn = gameRef.current?.presidentDrawnPolicies || [];

    return (
      <div className="w-full max-w-lg mx-auto p-5 rounded-3xl bg-[#141923] border-2 border-[#2c3548] shadow-2xl flex flex-col items-center select-none text-center animate-fadeIn">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d9b36a] mb-1">
          {isFa ? 'جلسه قانون‌گذاری — رئیس‌جمهور' : 'LEGISLATIVE SESSION — PRESIDENT'}
        </span>
        <h3 className="text-lg font-serif font-black text-[#eef1f6] mb-1">
          {isFa ? 'یک کارت را برای سوزاندن انتخاب کنید' : 'Select 1 Policy to Discard'}
        </h3>
        <p className="text-xs text-[#97a3b8] mb-4">
          {isFa
            ? 'کارت انتخاب‌شده دور انداخته می‌شود و دو کارت دیگر به صدراعظم داده خواهد شد.'
            : 'The chosen policy will be discarded; the other two pass to the Chancellor.'}
        </p>

        <div className="flex gap-3 justify-center items-center my-4">
          {drawn.map((policy, idx) => (
            <CardComponent
              key={idx}
              variant={policy === 'LIBERAL' ? 'POLICY_LIBERAL' : 'POLICY_FASCIST'}
              size="md"
              isSelected={selectedDiscardIndex === idx}
              onClick={() => {
                setSelectedDiscardIndex(idx);
                sound.playCardFlip();
              }}
              className="cursor-pointer"
            />
          ))}
        </div>

        <button
          disabled={selectedDiscardIndex === null}
          onClick={() => {
            if (selectedDiscardIndex !== null) {
              handlePresidentDiscard(selectedDiscardIndex);
            }
          }}
          className={`w-full py-3.5 rounded-2xl font-serif font-black text-xs uppercase tracking-wider transition-all shadow-xl ${
            selectedDiscardIndex !== null
              ? 'bg-[#d9b36a] hover:bg-[#e6bf78] text-[#1c100a] active:scale-95'
              : 'bg-[#1b2230] text-[#566178] cursor-not-allowed border border-[#262e3f]'
          }`}
        >
          {isFa ? 'تأیید سوزاندن کارت و ارسال به صدراعظم' : 'Confirm Discard & Pass to Chancellor'}
        </button>
      </div>
    );
  }

  if (currentStep === 'LEGISLATIVE_CHAN_ENVELOPE') {
    return renderConfidentialEnvelope(
      chancellorPlayer?.name || '',
      isFa
        ? 'رئیس‌جمهور ۲ کارت به شما تحویل داده است. شما باید ۱ کارت را تصویب کرده و کارت دیگر را بسوزانید.'
        : 'President has passed 2 policies. Choose 1 policy to enact; the other will be discarded.',
      () => setCurrentStep('LEGISLATIVE_CHAN_DISCARD')
    );
  }

  if (currentStep === 'LEGISLATIVE_CHAN_DISCARD') {
    const drawn = gameRef.current?.chancellorDrawnPolicies || [];

    return (
      <div className="w-full max-w-lg mx-auto p-5 rounded-3xl bg-[#141923] border-2 border-[#2c3548] shadow-2xl flex flex-col items-center select-none text-center animate-fadeIn">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d9b36a] mb-1">
          {isFa ? 'جلسه قانون‌گذاری — صدراعظم' : 'LEGISLATIVE SESSION — CHANCELLOR'}
        </span>
        <h3 className="text-lg font-serif font-black text-[#eef1f6] mb-1">
          {isFa ? 'یک کارت را برای سوزاندن انتخاب کنید' : 'Select 1 Policy to Discard'}
        </h3>
        <p className="text-xs text-[#97a3b8] mb-4">
          {isFa
            ? 'کارت انتخاب‌نشده تصویب خواهد شد و بر روی لوح بازی قرار می‌گیرد!'
            : 'The other policy will be officially enacted onto the board!'}
        </p>

        <div className="flex gap-4 justify-center items-center my-4">
          {drawn.map((policy, idx) => (
            <CardComponent
              key={idx}
              variant={policy === 'LIBERAL' ? 'POLICY_LIBERAL' : 'POLICY_FASCIST'}
              size="md"
              isSelected={selectedDiscardIndex === idx}
              onClick={() => {
                setSelectedDiscardIndex(idx);
                sound.playCardFlip();
              }}
              className="cursor-pointer"
            />
          ))}
        </div>

        <button
          disabled={selectedDiscardIndex === null}
          onClick={() => {
            if (selectedDiscardIndex !== null) {
              handleChancellorDiscard(selectedDiscardIndex);
            }
          }}
          className={`w-full py-3.5 rounded-2xl font-serif font-black text-xs uppercase tracking-wider transition-all shadow-xl ${
            selectedDiscardIndex !== null
              ? 'bg-[#d9b36a] hover:bg-[#e6bf78] text-[#1c100a] active:scale-95'
              : 'bg-[#1b2230] text-[#566178] cursor-not-allowed border border-[#262e3f]'
          }`}
        >
          {isFa ? 'تصویب قانون نهایی' : 'Enact Final Policy'}
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: EXECUTIVE POWERS
  // -------------------------------------------------------------
  if (currentStep === 'EXECUTIVE_ENVELOPE') {
    return renderConfidentialEnvelope(
      presidentPlayer?.name || '',
      isFa
        ? 'با تصویب قانون فاشیستی، قدرت ریاست‌جمهوری فعال شده است. گوشی را به رئیس‌جمهور تحویل دهید.'
        : 'Fascist policy enacted an Executive Power. Pass phone to the President.',
      () => setCurrentStep('EXECUTIVE_ACTION')
    );
  }

  if (currentStep === 'EXECUTIVE_ACTION') {
    const power = publicState?.pendingExecutivePower as ExecutivePower;
    const livingTargets =
      publicState?.players?.filter(
        (p: PlayerPublicView) => p.isAlive && p.id !== publicState.presidentId
      ) || [];

    return (
      <div className="w-full max-w-lg mx-auto p-5 rounded-3xl bg-[#141923] border-2 border-[#2c3548] shadow-2xl flex flex-col items-center select-none text-center animate-fadeIn">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d9b36a] mb-1">
          {isFa ? 'اختیارات ویژه ریاست‌جمهوری' : 'EXECUTIVE ACTION'}
        </span>
        <h3 className="text-lg font-serif font-black text-[#eef1f6] mb-2">
          {power === 'POLICY_PEEK'
            ? isFa
              ? 'مشاهده ۳ کارت بعدی قوانین'
              : 'Policy Peek (Top 3 Policies)'
            : power === 'INVESTIGATE_LOYALTY'
            ? isFa
              ? 'بررسی وفاداری و کارت حزب یک بازیکن'
              : 'Investigate Party Membership'
            : power === 'SPECIAL_ELECTION'
            ? isFa
              ? 'انتخابات ویژه: تعیین رئیس‌جمهور دور بعد'
              : 'Special Election: Pick Next President'
            : isFa
            ? 'اعدام یک بازیکن'
            : 'Execution of a Player'}
        </h3>

        {power === 'POLICY_PEEK' ? (
          <button
            onClick={() => handleExecutePower('POLICY_PEEK')}
            className="w-full mt-4 py-3.5 rounded-2xl bg-[#d9b36a] hover:bg-[#e6bf78] text-[#1c100a] font-serif font-black text-xs uppercase shadow-xl"
          >
            {isFa ? 'مشاهده کارت‌ها' : 'Peek at Cards'}
          </button>
        ) : (
          <div className="w-full flex flex-col gap-3 my-3">
            <p className="text-xs text-[#97a3b8]">
              {isFa ? 'یک بازیکن هدف را انتخاب کنید:' : 'Select a target player:'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {livingTargets.map((p: PlayerPublicView) => (
                <button
                  key={p.id}
                  onClick={() => setExecutiveTargetId(p.id)}
                  className={`p-3 rounded-xl border text-xs font-serif font-bold transition-all ${
                    executiveTargetId === p.id
                      ? 'bg-[#d9b36a] text-[#1c100a] border-[#ecd08f] shadow-lg'
                      : 'bg-[#1b2230] text-[#eef1f6] border-[#2c3548] hover:bg-[#262e3f]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <button
              disabled={!executiveTargetId}
              onClick={() => {
                if (executiveTargetId) {
                  handleExecutePower(power, executiveTargetId);
                }
              }}
              className={`w-full mt-3 py-3.5 rounded-2xl font-serif font-black text-xs uppercase tracking-wider transition-all shadow-xl ${
                executiveTargetId
                  ? 'bg-red-700 hover:bg-red-600 text-white active:scale-95'
                  : 'bg-[#1b2230] text-[#566178] cursor-not-allowed border border-[#262e3f]'
              }`}
            >
              {isFa ? 'اعمال قدرت' : 'Execute Power'}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 'EXECUTIVE_PEEK_VIEW') {
    return (
      <div className="w-full max-w-lg mx-auto p-5 rounded-3xl bg-[#141923] border-2 border-[#2c3548] shadow-2xl flex flex-col items-center select-none text-center animate-fadeIn">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d9b36a] mb-1">
          {isFa ? 'نتیجه نگاه به قوانین' : 'POLICY PEEK RESULT'}
        </span>
        <h3 className="text-lg font-serif font-black text-[#eef1f6] mb-3">
          {isFa ? '۳ کارت بالای دسته به ترتیب:' : 'Top 3 cards in order:'}
        </h3>

        <div className="flex gap-3 justify-center items-center my-4">
          {(peekCards || []).map((policy, idx) => (
            <CardComponent
              key={idx}
              variant={policy === 'LIBERAL' ? 'POLICY_LIBERAL' : 'POLICY_FASCIST'}
              size="md"
            />
          ))}
        </div>

        <button
          onClick={() => {
            sound.playCardFlip();
            setActivePlayerId(gameRef.current?.presidentId!);
            setCurrentStep('BOARD_NOMINATION');
          }}
          className="w-full mt-4 py-3.5 rounded-2xl bg-[#d9b36a] hover:bg-[#e6bf78] text-[#1c100a] font-serif font-black text-xs uppercase shadow-xl"
        >
          {isFa ? 'پایان مشاهده و بازگشت به میز' : 'Done — Return to Table'}
        </button>
      </div>
    );
  }

  if (currentStep === 'EXECUTIVE_INVESTIGATE_VIEW') {
    const targetName = executiveTargetId
      ? gameRef.current?.players.get(executiveTargetId)?.name
      : '';

    return (
      <div className="w-full max-w-lg mx-auto p-5 rounded-3xl bg-[#141923] border-2 border-[#2c3548] shadow-2xl flex flex-col items-center select-none text-center animate-fadeIn">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d9b36a] mb-1">
          {isFa ? 'نتیجه بررسی وفاداری' : 'INVESTIGATION RESULT'}
        </span>
        <h3 className="text-lg font-serif font-black text-[#eef1f6] mb-2">
          {isFa ? `عضویت حزبی «${targetName}»:` : `Party Alignment of "${targetName}":`}
        </h3>

        <div className="my-4">
          <CardComponent
            variant={
              investigationCard === 'LIBERAL' ? 'MEMBERSHIP_LIBERAL' : 'MEMBERSHIP_FASCIST'
            }
            size="lg"
          />
        </div>

        <p className="text-xs text-[#97a3b8] mb-4 max-w-xs">
          {isFa
            ? 'توجه: این کارت فقط حزب (لیبرال یا فاشیست) را نشان می‌دهد و هویت ویژه هیتلر را فاش نمی‌کند.'
            : 'Note: This shows party membership only, not whether the player is Hitler.'}
        </p>

        <button
          onClick={() => {
            sound.playCardFlip();
            setActivePlayerId(gameRef.current?.presidentId!);
            setCurrentStep('BOARD_NOMINATION');
          }}
          className="w-full mt-2 py-3.5 rounded-2xl bg-[#d9b36a] hover:bg-[#e6bf78] text-[#1c100a] font-serif font-black text-xs uppercase shadow-xl"
        >
          {isFa ? 'پایان بررسی و بازگشت به میز' : 'Done — Return to Table'}
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: VICTORY SCREEN
  // -------------------------------------------------------------
  if (currentStep === 'VICTORY') {
    return (
      <VictoryScreen
        winner={publicState?.winner || 'LIBERAL'}
        winReason={publicState?.winReason || 'LIBERAL_5_POLICIES'}
        players={publicState?.players || []}
        isHost={true}
        onPlayAgain={handleStartPassAndPlay}
        onExit={onExit}
        lang={lang}
      />
    );
  }

  return null;
};
