import React from 'react';

interface CharacterCardProps {
  name: string;
  className: string;
  integrity: number;
  maxIntegrity: number;
  color?: string; // e.g. 'green', 'blue', 'red'
  subsystems?: string[];
  status?: string[];
  isPlayer?: boolean;
  highlight?: boolean;
  currentTurn?: boolean;
  isTargeted?: boolean;
}

export default function CharacterCard({
  name,
  className,
  integrity,
  maxIntegrity,
  color = 'green',
  subsystems = [],
  status = [],
  isPlayer = false,
  highlight = false,
  currentTurn = false,
  isTargeted = false,
}: CharacterCardProps) {
  const barColor =
    color === 'red'
      ? 'bg-red-500'
      : color === 'slate'
      ? 'bg-blue-800'
      : 'bg-green-500';
  const borderColor =
    color === 'red'
      ? 'border-red-500'
      : color === 'slate'
      ? 'border-blue-500'
      : 'border-green-500';
  const cardBg =
    color === 'bg-nb'
      ? 'bg-nb-200'
      : 'bg-nb-300';

  // Special border styles for active and targeted characters
  const borderStyle = currentTurn 
    ? 'border-2 border-yellow-400' 
    : isTargeted 
    ? 'border-2 border-dashed border-yellow-400' 
    : `border ${borderColor}`;

  return (
    <div
      className={`rounded-lg p-3 mb-2 shadow-sm ${cardBg} ${borderStyle} ${highlight ? 'ring-2 ring-yellow-100-opacity-10' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs uppercase text-nb-text flex items-center gap-2">
          {name} {isPlayer && <span className="text-xs text-nb-text">(you)</span>}
          {currentTurn && (
            <span title="Current turn" className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          )}
          {!currentTurn && isTargeted && (
            <span title="Targeted by current actor" className="inline-block align-middle">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="7" stroke="#facc15" strokeWidth="2" />
                <line x1="10" y1="3" x2="10" y2="0" stroke="#facc15" strokeWidth="2" />
                <line x1="10" y1="17" x2="10" y2="20" stroke="#facc15" strokeWidth="2" />
                <line x1="3" y1="10" x2="0" y2="10" stroke="#facc15" strokeWidth="2" />
                <line x1="17" y1="10" x2="20" y2="10" stroke="#facc15" strokeWidth="2" />
              </svg>
            </span>
          )}
        </span>
        <span className="text-xs text-nb-subtext">{className}</span>
      </div>
      <div className="flex items-center space-x-2 mb-1">
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${(integrity / maxIntegrity) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-300">{integrity}%</span>
      </div>
      {subsystems.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {subsystems.map((ss) => (
            <span key={ss} className="text-xs px-2 py-0.5 bg-nb-500 text-nb-subtext rounded font-mono uppercase border border-nb-border">
              {ss}
            </span>
          ))}
        </div>
      )}
      {status.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {status.map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 bg-red-900 text-red-300 rounded font-mono uppercase">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 