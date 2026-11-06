import React from 'react';

interface BrandEmblemProps {
  variant?: 'dark' | 'gold';
  className?: string;
}

export const BrandEmblem: React.FC<BrandEmblemProps> = ({
  variant = 'dark',
  className = 'w-11 h-11',
}) => {
  const fill = variant === 'gold' ? '#DFB75E' : '#1E241E';
  const accent = variant === 'gold' ? '#1B3B22' : '#C89B3C';

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Proud Kadaknath Rooster Crest Silhouette */}
      <path
        d="M35.5 9.5C37.2 7.2 39.8 7.5 40.5 9.8C42.2 8.2 44.6 9.3 44.3 11.7C46.2 11.2 47.7 13.1 46.5 14.9C47.8 15.8 47.4 17.8 45.6 18.2L49.2 19.6L45.4 21.4C46.1 23.1 45.2 25.2 43.2 25.5C41.8 25.7 40.8 24.7 40.4 23.6C38.6 25.8 39.2 29.8 42.1 33.4C45.3 37.4 45.8 43.6 41.2 47.8C37.4 51.3 31.6 51.6 26.8 49.4L24.5 55.2H29.2V57.2H19.4V55.2H22.1L24.2 48.2C20.2 46.2 17.5 42.8 16.4 39.4C13.1 41.2 10.6 44.2 9.2 47.5C8.4 42.5 10.2 37.2 14.5 34.4C10.8 35.1 7.6 37.1 5.5 40.2C5.8 34.6 9.5 29.8 15.6 28.4C11.9 28.2 8.6 29.3 6.2 31.4C7.9 25.9 13.4 22.8 20.4 23.6C24.8 24.1 28.4 26.4 31.6 26.1C34.9 25.8 35.6 21.6 34.5 17.8C33.7 15.1 34.1 11.5 35.5 9.5Z"
        fill={fill}
      />
      {/* Eye detail */}
      <circle cx="42.4" cy="17.2" r="1.35" fill={accent} />
      {/* Secondary leg & spur */}
      <path
        d="M32.4 49.8L34.6 55.2H38.2V57.2H30.2V55.2H32.2L30.2 50.1"
        fill={fill}
      />
    </svg>
  );
};

interface BotanicalSprigProps {
  className?: string;
  flip?: boolean;
}

export const BotanicalSprig: React.FC<BotanicalSprigProps> = ({
  className = 'w-28 h-28',
  flip = false,
}) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={flip ? { transform: 'scale(-1, -1)' } : undefined}
      aria-hidden="true"
    >
      <path
        d="M8 10C34 22 62 46 88 86"
        stroke="#355E34"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M24 20C14 34 15 50 28 56C35 43 34 29 24 20Z"
        fill="#4A7C3F"
        fillOpacity="0.88"
      />
      <path
        d="M36 28C52 21 66 26 70 39C55 43 42 39 36 28Z"
        fill="#5C8D47"
        fillOpacity="0.85"
      />
      <path
        d="M52 44C40 58 42 75 55 81C63 67 62 52 52 44Z"
        fill="#3E6B35"
        fillOpacity="0.9"
      />
      <path
        d="M65 56C82 49 97 55 101 68C85 72 72 67 65 56Z"
        fill="#6B9B4E"
        fillOpacity="0.85"
      />
      <path
        d="M84 82C96 84 106 94 108 106C94 104 85 95 84 82Z"
        fill="#4A7C3F"
        fillOpacity="0.85"
      />
    </svg>
  );
};
