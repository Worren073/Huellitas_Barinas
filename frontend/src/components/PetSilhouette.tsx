interface PetSilhouetteProps {
  species?: string;
  className?: string;
}

export default function PetSilhouette({ species, className = 'w-full h-full' }: PetSilhouetteProps) {
  const isDog = species === 'dog';

  return (
    <div className={`${className} bg-surface-container-high flex items-center justify-center`}>
      <svg viewBox="0 0 200 200" className="w-24 h-24 text-outline opacity-40" fill="currentColor">
        {isDog ? (
          <g>
            <ellipse cx="100" cy="130" rx="60" ry="45" />
            <circle cx="100" cy="75" r="32" />
            <ellipse cx="55" cy="110" rx="20" ry="10" transform="rotate(-20 55 110)" />
            <ellipse cx="145" cy="110" rx="20" ry="10" transform="rotate(20 145 110)" />
            <ellipse cx="68" cy="170" rx="12" ry="18" />
            <ellipse cx="132" cy="170" rx="12" ry="18" />
            <ellipse cx="88" cy="68" rx="5" ry="8" />
            <ellipse cx="112" cy="68" rx="5" ry="8" />
            <circle cx="88" cy="66" r="2.5" />
            <circle cx="112" cy="66" r="2.5" />
            <ellipse cx="100" cy="82" rx="4" ry="3" />
            <path d="M85 95 Q92 100 100 95 Q108 100 115 95" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M108 55 Q115 40 130 35 Q120 45 115 55" />
            <path d="M92 55 Q85 40 70 35 Q80 45 85 55" />
          </g>
        ) : (
          <g>
            <ellipse cx="100" cy="120" rx="45" ry="38" />
            <circle cx="100" cy="72" r="30" />
            <path d="M75 60 L68 40 L82 52 Z" />
            <path d="M125 60 L132 40 L118 52 Z" />
            <ellipse cx="100" cy="155" rx="35" ry="25" />
            <ellipse cx="82" cy="155" rx="10" ry="15" />
            <ellipse cx="118" cy="155" rx="10" ry="15" />
            <ellipse cx="90" cy="66" rx="5" ry="7" />
            <ellipse cx="110" cy="66" rx="5" ry="7" />
            <circle cx="90" cy="64" r="2.5" />
            <circle cx="110" cy="64" r="2.5" />
            <ellipse cx="100" cy="78" rx="3" ry="2" />
            <path d="M90 88 Q95 92 100 88 Q105 92 110 88" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="100" y1="30" x2="95" y2="10" strokeWidth="1.5" />
            <line x1="100" y1="30" x2="105" y2="10" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
