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
}: CharacterCardProps) {
  const barColor =
    color === 'red'
      ? 'bg-red-500'
      : color === 'blue'
      ? 'bg-blue-500'
      : 'bg-green-500';
  const borderColor =
    color === 'red'
      ? 'border-red-500'
      : color === 'blue'
      ? 'border-blue-500'
      : 'border-green-500';
  return (
    <div
      className={`rounded-lg border p-3 mb-2 shadow-sm bg-gray-800 ${borderColor} ${highlight ? 'ring-2 ring-yellow-400' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-white">
          {name} {isPlayer && <span className="text-xs text-green-300">(you)</span>}
        </span>
        <span className="text-xs text-gray-400">{className}</span>
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
            <span key={ss} className="text-xs px-2 py-0.5 bg-gray-900 text-green-300 rounded font-mono uppercase">
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