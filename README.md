# Poker Trainer

No-Limit Hold'em practice app. Runs as a website and installs on a phone from the browser
("Add to Home Screen"). Cash games first, tournaments included.

## What's in it

- **Preflop drills**: 6-max 100bb open raises, big blind defense vs a button open, and
  tournament push/fold at 10bb and 15bb. After each answer you see the full chart.
- **Learn**: the 13-chapter No-Limit Hold'em study guide (EV, math, equity, ranges, position,
  preflop, SPR, postflop, game theory, opponents, tournaments, bankroll, cheat sheet), an
  8-week study plan, and links from every chapter to its drills (`src/learn/`).
- **Concept drills**: pot odds, outs, call-or-fold, EV of a call, implied odds, clean outs,
  combos, fold equity, bluff break-even, MDF, river bluff share, SPR and commitment, board
  texture, player types, M zones, ICM bubble calls, risk of ruin, plus a concept quiz per
  chapter and cheat-sheet flashcards (`src/poker/concepts.ts`, `src/learn/quiz.ts`).
- **Equity**: guess preflop all-in equity, plus a calculator for hand vs hand or range.
- **Hand review**: paste or open PokerStars / GGPoker hand histories, replay each hand,
  see pot odds at every call and the flop SPR, and get flagged when a first-in preflop decision is off-chart.
- **Progress**: accuracy by drill and your repeat mistakes.

Charts are simplified versions of standard solver-style charts (`src/poker/charts.ts`).
Practice results, goals and hands are stored in the browser on your device.

## Run it locally

```
npm install
npm run dev      # local site at http://localhost:5173
npm test         # poker math and hand-history tests
npm run build    # production build in dist/
```

## Put it online (free)

Push this folder to a GitHub repository, then import that repository on vercel.com.
Vercel detects Vite automatically; every push redeploys the site.
