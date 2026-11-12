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
  | 'CARD_BACK'
  | 'ROLE_BACK'
  | 'BALLOT_BACK'
  | 'MEMBERSHIP_BACK';

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
  // All Asset Kit v1 cards are standard 600:940 aspect ratio (~5:7)
  const sizeClasses = {
    sm: 'w-16 h-[100px] sm:w-20 sm:h-32',
    md: 'w-24 h-[150px] sm:w-28 sm:h-44',
    lg: 'w-32 h-[200px] sm:w-36 sm:h-56',
    xl: 'w-48 h-[300px] sm:w-56 sm:h-[352px]',
  }[size];

  // Asset mapping to the approved Tabletop Asset Kit v1
  const getAssetSrc = () => {
    switch (variant) {
      case 'ROLE_LIBERAL':
        return '/game-assets/role/liberal_role.webp';
      case 'ROLE_FASCIST':
        return '/game-assets/role/fascist_role.webp';
      case 'ROLE_HITLER':
        return '/game-assets/role/hitler_role.webp';
      case 'MEMBERSHIP_LIBERAL':
        return '/game-assets/membership/liberal_membership.webp';
      case 'MEMBERSHIP_FASCIST':
        return '/game-assets/membership/fascist_membership.webp';
      case 'POLICY_LIBERAL':
        return '/game-assets/policy/liberal_policy.webp';
      case 'POLICY_FASCIST':
        return '/game-assets/policy/fascist_policy.webp';
      case 'BALLOT_JA':
        return '/game-assets/vote/ja.webp';
      case 'BALLOT_NEIN':
        return '/game-assets/vote/nein.webp';
      case 'ROLE_BACK':
        return '/game-assets/backs/role_back.webp';
      case 'BALLOT_BACK':
        return '/game-assets/backs/ballot_back.webp';
      case 'MEMBERSHIP_BACK':
        return '/game-assets/backs/membership_back.webp';
      case 'CARD_BACK':
      default:
        return '/game-assets/backs/policy_back.webp';
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
        return 'JA! Approve Ballot';
      case 'BALLOT_NEIN':
        return 'NEIN! Reject Ballot';
      case 'ROLE_BACK':
        return 'Classified Role Dossier Back';
      case 'BALLOT_BACK':
        return 'Ballot Back';
      case 'MEMBERSHIP_BACK':
        return 'Party Membership Back';
      default:
        return 'Policy Card Back';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative ${sizeClasses} rounded-[4.5%/2.9%] overflow-hidden cursor-pointer select-none transition-all duration-200 ${
        isSelected
          ? 'scale-105 -translate-y-2 ring-4 ring-amber-400/80 shadow-[0_15px_30px_rgba(0,0,0,0.6)]'
          : 'hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)] shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
      } ${className}`}
    >
      <img
        src={getAssetSrc()}
        alt={getAltText()}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      {/* Physical card edge highlight */}
      
    </div>
  );
};
