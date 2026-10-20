import { Card } from '../poker/cards';

const SYMBOL: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };

export function PlayingCard({ card, small }: { card: Card; small?: boolean }) {
  const rank = card[0] === 'T' ? '10' : card[0];
  return (
    <span className={`pcard suit-${card[1]}${small ? ' small' : ''}`} aria-label={card}>
      <span className="pcard-rank">{rank}</span>
      <span className="pcard-suit">{SYMBOL[card[1]]}</span>
    </span>
  );
}

export function Cards({ cards, small }: { cards: Card[]; small?: boolean }) {
  return (
    <span className="cards">
      {cards.map((c) => (
        <PlayingCard key={c} card={c} small={small} />
      ))}
    </span>
  );
}
