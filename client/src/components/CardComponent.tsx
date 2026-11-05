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
  // Card proportions: standard playing card 2.5 : 3.5 ratio (5:7)
  const sizeClasses = {
    sm: 'w-16 h-[88px] sm:w-20 sm:h-28',
    md: 'w-24 h-[134px] sm:w-28 sm:h-40',
    lg: 'w-32 h-[180px] sm:w-36 sm:h-52',
    xl: 'w-44 h-[246px] sm:w-48 sm:h-68',
  }[size];

  // Asset mapping
  const getAssetSrc = () => {
    switch (variant) {
      case 'ROLE_LIBERAL':
        return '/cards/role_liberal.png';
      case 'ROLE_FASCIST':
        return '/cards/role_fascist.png';
      case 'ROLE_HITLER':
        return '/cards/role_hitler.png';
      case 'MEMBERSHIP_LIBERAL':
        return '/cards/membership_liberal.svg';
      case 'MEMBERSHIP_FASCIST':
        return '/cards/membership_fascist.svg';
      case 'POLICY_LIBERAL':
        return '/cards/policy_liberal.svg';
      case 'POLICY_FASCIST':
        return '/cards/policy_fascist.svg';
      case 'BALLOT_JA':
        return '/cards/ballot_ja.svg';
      case 'BALLOT_NEIN':
        return '/cards/ballot_nein.svg';
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
        return 'Ja! Ballot';
      case 'BALLOT_NEIN':
        return 'Nein! Ballot';
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
        className="w-full h-full object-cover rounded-xl pointer-events-none"
        loading="lazy"
      />
    </div>
  );
};
