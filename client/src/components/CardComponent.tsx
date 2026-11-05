import React from 'react';

export type CardVariant =
  | 'ROLE_LIBERAL'
  | 'ROLE_FASCIST'
  | 'ROLE_HITLER'
  | 'MEMBERSHIP_LIBERAL'
  | 'MEMBERSHIP_FASCIST'
  | 'POLICY_LIBERAL'
  | 'POLICY_FASCIST'
  | 'BALLOT_JA'
  | 'BALLOT_NEIN'
  | 'CARD_BACK';

interface CardProps {
  variant: CardVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CardComponent: React.FC<CardProps> = ({
  variant,
  size = 'md',
  isSelected = false,
  onClick,
  className = '',
}) => {
  const isBallot = variant === 'BALLOT_JA' || variant === 'BALLOT_NEIN';

  // Ballots are landscape (730:539, ~4:3), while role and policy cards are standard portrait (5:7)
  const sizeClasses = isBallot
    ? {
        sm: 'w-20 h-15 sm:w-24 sm:h-18',
        md: 'w-28 h-21 sm:w-36 sm:h-27',
        lg: 'w-36 h-27 sm:w-44 sm:h-33',
        xl: 'w-48 h-36 sm:w-56 sm:h-42',
      }[size]
    : {
        sm: 'w-16 h-[88px] sm:w-20 sm:h-28',
        md: 'w-24 h-[134px] sm:w-28 sm:h-40',
        lg: 'w-32 h-[180px] sm:w-36 sm:h-52',
        xl: 'w-44 h-[246px] sm:w-48 sm:h-68',
      }[size];

  // Asset mapping - using authentic official tabletop assets with vector fallbacks
  const getAssetSrc = () => {
    switch (variant) {
      case 'ROLE_LIBERAL':
        return '/cards/role_liberal.png';
      case 'ROLE_FASCIST':
        return '/cards/role_fascist.png';
      case 'ROLE_HITLER':
        return '/cards/role_hitler.png';
      case 'MEMBERSHIP_LIBERAL':
        return '/cards/official/party-membership-liberal.png';
      case 'MEMBERSHIP_FASCIST':
        return '/cards/official/party-membership-fascist.png';
      case 'POLICY_LIBERAL':
        return '/cards/official/policy-liberal.png';
      case 'POLICY_FASCIST':
        return '/cards/official/policy-fascist.png';
      case 'BALLOT_JA':
        return '/cards/official/vote-yes.png';
      case 'BALLOT_NEIN':
        return '/cards/official/vote-no.png';
      case 'CARD_BACK':
      default:
        return '/cards/card_back.svg';
    }
  };

  const getAltText = () => {
    switch (variant) {
      case 'ROLE_LIBERAL':
        return 'Liberal Role Card (Churchill)';
      case 'ROLE_FASCIST':
        return 'Fascist Role Card';
      case 'ROLE_HITLER':
        return 'Hitler Role Card';
      case 'MEMBERSHIP_LIBERAL':
        return 'Liberal Party Membership';
      case 'MEMBERSHIP_FASCIST':
        return 'Fascist Party Membership';
      case 'POLICY_LIBERAL':
        return 'Liberal Article Policy Card';
      case 'POLICY_FASCIST':
        return 'Fascist Article Policy Card';
      case 'BALLOT_JA':
        return 'Ja! Ballot Card';
      case 'BALLOT_NEIN':
        return 'Nein! Ballot Card';
      default:
        return 'Card Back';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative ${sizeClasses} rounded-xl overflow-hidden cursor-pointer select-none transition-all duration-200 ${
        isSelected
          ? 'scale-105 -translate-y-2 ring-4 ring-amber-400/80 shadow-[0_15px_30px_rgba(0,0,0,0.6)]'
          : 'hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)] shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
      } ${className}`}
    >
      <img
        src={getAssetSrc()}
        alt={getAltText()}
        className={`w-full h-full rounded-xl ${isBallot ? 'object-contain bg-[#1c120a]' : 'object-cover'}`}
        loading="lazy"
        draggable={false}
      />
      {/* Subtle physical card edge highlight */}
      <div className="absolute inset-0 rounded-xl border border-white/10 pointer-events-none" />
    </div>
  );
};
