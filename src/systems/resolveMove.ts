export function resolveMove(player, move, target) {
  const isWeak = target.weaknesses?.includes(move);
  const roll = Math.random();
  const logicBonus = player?.stats?.logic * 0.05 || 0;
  const successChance = isWeak ? 0.9 : 0.5 + logicBonus;
  return roll < successChance;
}
