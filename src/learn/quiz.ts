// Hand-written concept questions from the study guide, tagged by chapter.

export interface QuizItem { ch: number; q: string; options: string[]; answer: string; why: string }

export const CONCEPT_QUIZ: QuizItem[] = [
  // 1. Foundations
  {
    ch: 1, q: 'You called a big river bet with a hand that had 15% equity against villain\'s range and the pot odds required 33%. Villain was bluffing and you won. How do you grade the call?',
    options: ['Good call: it won', 'Bad call: it was −EV', 'Neutral: results even out'], answer: 'Bad call: it was −EV',
    why: 'Judge the decision by its EV with the information you had. Winning a bad call teaches the wrong lesson.',
  },
  {
    ch: 1, q: 'What is the EV of folding, from this point in the hand forward?',
    options: ['Zero', 'Minus what you already put in', 'Depends on the pot'], answer: 'Zero',
    why: 'Money already in the pot is gone. Folding is the 0 baseline you compare calls and raises against.',
  },
  {
    ch: 1, q: 'You get all-in on the flop with 70% equity in a 200bb pot and lose. What did you earn in "Sklansky Bucks"?',
    options: ['140bb', '0bb', '−100bb'], answer: '140bb',
    why: 'Your expected share is equity × pot = 0.7 × 200 = 140bb, whoever wins. All-in EV shows how much of a session was luck.',
  },
  {
    ch: 1, q: 'By the Fundamental Theorem, when do you gain?',
    options: ['When villain plays differently than they would if they could see your cards', 'When you win the pot', 'When you play more hands'],
    answer: 'When villain plays differently than they would if they could see your cards',
    why: 'Every time they play differently from how they would seeing your cards, you gain. Hand reading and deception both come from this.',
  },
  // 2. Math (non-numeric)
  {
    ch: 2, q: 'When does the "outs × 4" rule apply?',
    options: ['Only when you will see both the turn and river, e.g. all-in on the flop', 'Any time you are on the flop', 'Only on the turn'],
    answer: 'Only when you will see both the turn and river, e.g. all-in on the flop',
    why: 'If you might face another bet on the turn, price only the next card: outs × 2.',
  },
  {
    ch: 2, q: 'Which hand has the worst reverse implied odds in a deep, multiway pot?',
    options: ['A low flush draw', 'A set', 'The nut flush draw'], answer: 'A low flush draw',
    why: 'When a low flush gets there it can lose a huge pot to a bigger flush. Non-nut draws, dominated aces and weak kickers win small pots and lose big ones.',
  },
  {
    ch: 2, q: 'Villain raises to 3bb. Using the 5/10 rule, how deep should you and villain be to set mine with 44?',
    options: ['At least 10× the raise (30bb+), ideally 15–20×', '5× the raise is enough', 'Any depth'], answer: 'At least 10× the raise (30bb+), ideally 15–20×',
    why: 'You flop a set about 1 in 8.5 times, so you need to win a lot when you hit. 5× is too little.',
  },
  // 3. Equity
  {
    ch: 3, q: 'In the big blind vs a button open, 87s and K4o have similar raw equity. Which should you defend?',
    options: ['87s', 'K4o', 'Both equally'], answer: '87s',
    why: 'Equity realization: suited, connected hands play well and realize more of their equity out of position. K4o gets dominated and bluffed off.',
  },
  {
    ch: 3, q: 'Which spot is worst for a semi-bluff?',
    options: ['A weak draw into a calling station, multiway', 'A flush draw in position vs a player who folds a lot', 'A combo draw as the preflop raiser'],
    answer: 'A weak draw into a calling station, multiway',
    why: 'Semi-bluffs need fold equity. Stations and multiway pots remove it, and weak draws lack the backup equity.',
  },
  {
    ch: 3, q: 'You bet an overpair on J-T-8 two-tone mainly so draws fold. What kind of bet is it?',
    options: ['Protection / denial', 'Pure bluff', 'Semi-bluff'], answer: 'Protection / denial',
    why: 'You are ahead but vulnerable, so you charge or fold out the equity draws would realize.',
  },
  // 4. Ranges
  {
    ch: 4, q: 'A passive player who never check-raises suddenly check-raises the turn. Their range is…',
    options: ['Close to the nuts', 'Polarized with many bluffs', 'Capped'], answer: 'Close to the nuts',
    why: 'Passive players who suddenly raise usually have it. Fold medium hands to sudden aggression.',
  },
  {
    ch: 4, q: 'Villain just flat-calls your 3-bet preflop. What does that do to their range?',
    options: ['Caps it: AA and KK are less likely', 'Makes it polarized', 'Nothing'], answer: 'Caps it: AA and KK are less likely',
    why: 'Calling ranges are capped. Most players 4-bet the very top.',
  },
  {
    ch: 4, q: 'A large river overbet usually represents which range shape?',
    options: ['Polarized: nuts or bluffs', 'Merged: strong and medium hands', 'Capped'], answer: 'Polarized: nuts or bluffs',
    why: 'Big sizes are polarized. Respond with bluff-catchers per MDF, and remember the population underbluffs big river bets.',
  },
  {
    ch: 4, q: 'On a three-spade river, which bluff is best?',
    options: ['A hand with the A♠ that cannot win at showdown', 'Second pair with no spade', 'A hand that blocks the hands you want to fold'],
    answer: 'A hand with the A♠ that cannot win at showdown',
    why: 'Holding the A♠ means villain cannot have the nut flush. Pick bluffs that block their strong hands and have no showdown value.',
  },
  {
    ch: 4, q: 'Who usually has the nut advantage on 7-6-5?',
    options: ['The big blind caller', 'The preflop raiser', 'Neither'], answer: 'The big blind caller',
    why: 'Low connected boards hit the caller\'s range (sets, two pair, straights). High dry boards favor the raiser.',
  },
  // 5. Position
  {
    ch: 5, q: 'By the gap concept, which needs a stronger hand?',
    options: ['Calling an open-raise', 'Opening the pot yourself', 'They are the same'], answer: 'Calling an open-raise',
    why: 'A raiser has a strong range and you lose the fold equity of being first in. Open wider than you call.',
  },
  {
    ch: 5, q: 'Facing a UTG open from the small blind with KJo, the usual play is…',
    options: ['Fold', 'Flat call', 'Min-raise'], answer: 'Fold',
    why: 'KJo is often dominated by a UTG range and plays badly out of position. Out of position, 3-bet or fold more and flat less.',
  },
  {
    ch: 5, q: 'Why does a bet beat a call with the same hand so often?',
    options: ['A bet can win right away or at showdown; a call only at showdown', 'Bets are always bigger', 'Calls give away position'],
    answer: 'A bet can win right away or at showdown; a call only at showdown',
    why: 'Aggression gives two ways to win. It also builds pots with strong hands and denies equity to draws.',
  },
  // 6. Preflop
  {
    ch: 6, q: 'Two players limp in front of you on the button. A typical isolation raise is…',
    options: ['About 6bb (4bb + 1bb per limper)', '2.5bb', 'Over-limp'], answer: 'About 6bb (4bb + 1bb per limper)',
    why: 'Isolate weak limpers at about 4bb plus 1bb per limper to play heads up in position.',
  },
  {
    ch: 6, q: 'Which hand makes the best 3-bet bluff against a cutoff open?',
    options: ['A5s', 'KJo', '22'], answer: 'A5s',
    why: 'Suited wheel aces block AA/AK and play well when called. KJo is dominated; small pairs prefer to flat for set value.',
  },
  {
    ch: 6, q: 'You 3-bet a 2.5bb open while out of position. A standard size is…',
    options: ['About 10bb (4×)', 'About 7.5bb (3×)', 'About 5bb'], answer: 'About 10bb (4×)',
    why: '3-bet about 3× the open in position and 4× out of position.',
  },
  {
    ch: 6, q: 'First in on the button with Q7o and no limpers, what is wrong with limping?',
    options: ['It gives up fold equity and the initiative', 'Nothing, limping is cheap', 'It reveals a strong hand'], answer: 'It gives up fold equity and the initiative',
    why: 'Raise or fold first in. Open-limping is one of the master-list mistakes.',
  },
  // 7. SPR
  {
    ch: 7, q: 'You hold AA preflop. Which plan fits SPR theory best?',
    options: ['3-bet to create a low SPR', 'Flat to keep the SPR high', 'Limp'], answer: '3-bet to create a low SPR',
    why: 'Strong one-pair hands want a low SPR so top pair or an overpair can comfortably get all-in.',
  },
  {
    ch: 7, q: 'You have put a third of your stack into the pot. What does that usually mean?',
    options: ['You are committed: do not fold later', 'You can still fold freely', 'You should slow down'], answer: 'You are committed: do not fold later',
    why: 'Once about a third is in, folding gives up too much pot equity. Don\'t put in a third and then fold.',
  },
  {
    ch: 7, q: 'At 250bb deep, AA faces a big turn check-raise from a passive player on a wet board. The deep-stack lesson is…',
    options: ['One pair loses value deep; avoid a 300bb pot with it', 'Aces are always good', 'Raise again'], answer: 'One pair loses value deep; avoid a 300bb pot with it',
    why: 'Small pot with a small hand, big pot with a big hand. Deep stacks favor nut hands and draws to the nuts.',
  },
  // 8. Postflop
  {
    ch: 8, q: 'A bet that does not get called by worse, does not fold out better and denies no equity should…',
    options: ['Be a check', 'Be made bigger', 'Be made smaller'], answer: 'Be a check',
    why: 'Know why you are betting: value, bluff or denial. If none, check.',
  },
  {
    ch: 8, q: 'Against a calling station on the river with second pair, the guide says…',
    options: ['Bet thin for value', 'Check, they might have better', 'Bluff-raise'], answer: 'Bet thin for value',
    why: 'Thin value against stations is the single biggest source of profit.',
  },
  {
    ch: 8, q: 'You float the flop in position. When do you usually take the pot?',
    options: ['When villain checks the turn', 'On the flop by raising', 'Only if you hit'], answer: 'When villain checks the turn',
    why: 'Floats work against players who c-bet often and give up on the turn.',
  },
  {
    ch: 8, q: 'When is slowplaying right?',
    options: ['Very strong hand, dry board, villain unlikely to improve, a bet folds everything', 'Any time you flop a set', 'On wet boards'],
    answer: 'Very strong hand, dry board, villain unlikely to improve, a bet folds everything',
    why: 'Otherwise bet: slowplaying on wet boards gives free cards.',
  },
  {
    ch: 8, q: 'What sizing fits a polarized river range with the nut advantage?',
    options: ['Pot or overbet', '25–40% pot', 'Min-bet'], answer: 'Pot or overbet',
    why: 'Large sizes maximize value from strong hands and pressure bluff-catchers.',
  },
  // 9. Game theory
  {
    ch: 9, q: 'A nit who has not bluffed in 2,000 hands bets pot on the river. You hold a bluff-catcher. MDF says defend 50%. What do you do?',
    options: ['Fold more than MDF', 'Defend 50%', 'Raise'], answer: 'Fold more than MDF',
    why: 'MDF defends against balanced or bluff-heavy players. Against players who never bluff big, deviate and fold.',
  },
  {
    ch: 9, q: 'What does the indifference principle say a balanced bluffing frequency does?',
    options: ['Makes villain\'s bluff-catchers break even between calling and folding', 'Makes every bluff win', 'Maximizes fold equity'],
    answer: 'Makes villain\'s bluff-catchers break even between calling and folding',
    why: 'In equilibrium you mix only when both actions have the same EV.',
  },
  {
    ch: 9, q: 'Why can you bluff more on the flop than the river bluff ratio suggests?',
    options: ['Semi-bluffs have equity and you can give up later', 'Pots are smaller', 'Players fold more on the flop'], answer: 'Semi-bluffs have equity and you can give up later',
    why: 'The river ratio assumes bluffs have no equity. Earlier streets add drawing equity and future decisions.',
  },
  // 10. Opponents
  {
    ch: 10, q: 'An opponent folds to c-bets 70% of the time. Your adjustment?',
    options: ['C-bet them often', 'Only bet for value', 'Check-raise them'], answer: 'C-bet them often',
    why: 'Over 60% fold to c-bet means bet often; under 35% means only bet for value.',
  },
  {
    ch: 10, q: 'Which matters more for reading hands?',
    options: ['Betting patterns', 'Physical tells', 'Table talk'], answer: 'Betting patterns',
    why: 'The books agree betting patterns matter far more than physical tells. Learn a player\'s baseline first.',
  },
  {
    ch: 10, q: 'Where should you sit relative to a loose-aggressive player?',
    options: ['To their left, acting after them', 'To their right', 'Directly across'], answer: 'To their left, acting after them',
    why: 'Acting after aggressive players lets you see their action before you decide.',
  },
  {
    ch: 10, q: 'After you show down two bluffs in a row, what should you do more of?',
    options: ['Value bet', 'Bluff', 'Limp'], answer: 'Value bet',
    why: 'Your image changes how opponents respond. After showing bluffs, they call more, so value bet more.',
  },
  // 11. Tournaments
  {
    ch: 11, q: 'On the bubble, which stack should tighten its calling range the most?',
    options: ['The medium stack', 'The big stack', 'The short stack'], answer: 'The medium stack',
    why: 'Medium stacks have the most to lose to a big stack. Big stacks attack, short stacks shove wider.',
  },
  {
    ch: 11, q: 'With 8bb from the cutoff you pick up A9o. What is the push/fold play?',
    options: ['Shove', 'Min-raise and fold to a shove', 'Limp'], answer: 'Shove',
    why: 'At 15bb and below, go all-in or fold. Min-raise-folding with 8bb wastes chips.',
  },
  {
    ch: 11, q: 'Compared with your shoving range, your range for calling a shove should be…',
    options: ['About half as wide', 'The same', 'Wider'], answer: 'About half as wide',
    why: 'You have no fold equity when calling, so the gap concept says call much tighter than you shove.',
  },
  {
    ch: 11, q: 'In a winner-take-all tournament, how much does ICM matter?',
    options: ['Very little: play for chips', 'A lot', 'Only at the final table'], answer: 'Very little: play for chips',
    why: 'ICM pressure comes from pay jumps. Without them, chip EV is prize EV.',
  },
  // 12. Bankroll and mental game
  {
    ch: 12, q: 'A 5 bb/100 winner is down over 10,000 hands. What does that say about their skill?',
    options: ['Very little: the sample is too small', 'They are a losing player', 'They should move down for good'], answer: 'Very little: the sample is too small',
    why: 'Standard deviation over 10,000 hands is about 1,000bb vs an expected +500bb. You need 50,000+ hands.',
  },
  {
    ch: 12, q: 'Which is a sign of tilt?',
    options: ['Calling to "see if he has it"', 'Folding a marginal hand', 'Taking a break'], answer: 'Calling to "see if he has it"',
    why: 'Other signs: playing hands you normally fold, bluffing stations, raising stakes to win it back.',
  },
  {
    ch: 12, q: 'How many buy-ins does the guide suggest for large-field tournaments?',
    options: ['100–200', '30–50', '10–20'], answer: '100–200',
    why: 'Most tournament value is in rare deep runs, so variance is huge. Cash games: 30–50.',
  },
];

/** Numbers from the cheat sheet and probability tables, as flashcards. */
export const CHEAT_SHEET: QuizItem[] = [
  { ch: 13, q: 'Flush draw on the flop: chance to hit by the river?', options: ['35%', '19.6%', '45%', '31.5%'], answer: '35%', why: '9 outs, two cards: 35.0%. One card: 19.6%.' },
  { ch: 13, q: 'Open-ended straight draw on the flop: chance by the river?', options: ['31.5%', '17.4%', '35%', '24.1%'], answer: '31.5%', why: '8 outs: 31.5% with two cards, 17.4% with one.' },
  { ch: 13, q: 'Gutshot, one card to come?', options: ['8.7%', '16.5%', '4.3%', '13%'], answer: '8.7%', why: '4 outs of 46: 8.7%. Two cards: 16.5%.' },
  { ch: 13, q: 'Combo draw (15 outs) from the flop by the river?', options: ['54.1%', '60%', '45%', '32.6%'], answer: '54.1%', why: 'The ×4 rule overstates above 8 outs: 15 × 4 − 7 = 53, exact 54.1%.' },
  { ch: 13, q: 'Pocket pair flops a set or better?', options: ['11.8% (1 in 8.5)', '5.9%', '19.6%', '32.4%'], answer: '11.8% (1 in 8.5)', why: 'About 1 in 8.5, which is why set mining needs deep stacks.' },
  { ch: 13, q: 'Unpaired hand flops at least a pair?', options: ['32.4%', '11.8%', '50%', '20%'], answer: '32.4%', why: 'About 1 in 3.' },
  { ch: 13, q: 'Chance of being dealt any pocket pair?', options: ['5.9% (1 in 17)', '0.45%', '11.8%', '2%'], answer: '5.9% (1 in 17)', why: 'A specific pair like AA is 0.45%, 1 in 221.' },
  { ch: 13, q: 'Suited hand makes a flush by the river?', options: ['6.4%', '11.8%', '19.6%', '2%'], answer: '6.4%', why: 'Suitedness adds only a few percent; it flops a flush draw or better 11.8%.' },
  { ch: 13, q: 'Pair vs two overcards, e.g. 77 vs AK?', options: ['55% vs 45%', '80% vs 20%', '70% vs 30%', '50% vs 50%'], answer: '55% vs 45%', why: 'The classic coinflip.' },
  { ch: 13, q: 'Dominated hand, AK vs AQ?', options: ['74% vs 26%', '60% vs 40%', '81% vs 19%', '55% vs 45%'], answer: '74% vs 26%', why: 'Shared ace, better kicker.' },
  { ch: 13, q: 'Bigger pair vs smaller pair?', options: ['81% vs 19%', '74% vs 26%', '65% vs 35%', '90% vs 10%'], answer: '81% vs 19%', why: 'About 4 to 1.' },
  { ch: 13, q: 'Two overs vs two unders, AK vs 87s?', options: ['60% vs 40%', '74% vs 26%', '50% vs 50%', '81% vs 19%'], answer: '60% vs 40%', why: 'Suited connectors stay live against big cards.' },
  { ch: 13, q: 'Equity needed to call a half-pot bet?', options: ['25%', '33%', '20%', '29%'], answer: '25%', why: 'Call ÷ (pot + call) = 0.5 ÷ 2 = 25%.' },
  { ch: 13, q: 'Equity needed to call a pot-size bet?', options: ['33%', '50%', '25%', '40%'], answer: '33%', why: '1 ÷ 3.' },
  { ch: 13, q: 'Equity needed to call a 2/3-pot bet?', options: ['28.6%', '33%', '40%', '25%'], answer: '28.6%', why: '0.667 ÷ 2.333.' },
  { ch: 13, q: 'A pot-size bluff must work how often?', options: ['50%', '33%', '67%', '40%'], answer: '50%', why: 'Bet ÷ (pot + bet) = 1 ÷ 2.' },
  { ch: 13, q: 'MDF against a half-pot bet?', options: ['67%', '50%', '75%', '33%'], answer: '67%', why: 'Pot ÷ (pot + bet) = 1 ÷ 1.5.' },
  { ch: 13, q: 'Bluff share of a balanced pot-size river bet?', options: ['33%', '50%', '25%', '40%'], answer: '33%', why: 'Bet ÷ (pot + 2 × bet) = 1 ÷ 3, a 2 : 1 value-to-bluff ratio.' },
  { ch: 13, q: 'Combos of an unpaired hand like AK?', options: ['16', '12', '6', '4'], answer: '16', why: '4 suited + 12 offsuit. A pair has 6, a set of a board card 3.' },
  { ch: 13, q: 'Set mining needs how much behind?', options: ['15–20× the call', '5× the call', '3× the call', '50× the call'], answer: '15–20× the call', why: 'You flop a set 1 in 8.5 and won\'t always get paid.' },
  { ch: 13, q: 'Below what SPR can you commit with top pair good kicker?', options: ['4', '10', '1', '15'], answer: '4', why: 'Under 4 commit top pair; 4–10 need two pair; over 10 need the nuts or near.' },
  { ch: 13, q: 'At what stack do you switch to push/fold in tournaments?', options: ['15bb or less', '30bb', '5bb', '50bb'], answer: '15bb or less', why: 'Call ranges are about half as wide as shove ranges.' },
  { ch: 13, q: 'Minimum bankroll for full-stack cash games?', options: ['30+ buy-ins', '10 buy-ins', '100 buy-ins', '5 buy-ins'], answer: '30+ buy-ins', why: '100+ for tournaments. RoR = e^(−2WB/σ²).' },
];
