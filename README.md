# Poker Trainer

No-Limit Hold'em practice app. Runs as a website and installs on a phone from the browser
("Add to Home Screen"). Cash games first, tournaments included.

## What's in it

- **Preflop drills**: 6-max 100bb open raises, big blind defense vs a button open, and
  tournament push/fold at 10bb and 15bb. After each answer you see the full chart.
- **Poker math**: pot odds, outs to equity, and call-or-fold decisions with draws.
- **Equity**: guess preflop all-in equity, plus a calculator for hand vs hand or range.
- **Hand review**: paste or open PokerStars / GGPoker hand histories, replay each hand,
  see pot odds at every call, and get flagged when a first-in preflop decision is off-chart.
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
