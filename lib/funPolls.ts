export type PollKind = "fun" | "insight";

export interface Poll {
  id: string;
  kind: PollKind;
  emoji: string;
  question: string;
  options: { label: string; base: number }[]; // base = seeded vote count
}

/** Back-compat alias. */
export type FunPoll = Poll;

/** Lighthearted soccer-parent polls. `base` seeds the result bars so they look
 *  alive before the visitor votes. */
const FUN_RAW: Omit<Poll, "kind">[] = [
  {
    id: "saturday-7am",
    emoji: "⏰",
    question: "It's 7:00 AM on a Saturday for an away game. You are…",
    options: [
      { label: "Coffee IV drip, let's go", base: 412 },
      { label: "Already at the field (early = parking)", base: 188 },
      { label: "Who scheduled this?!", base: 264 },
      { label: "Frantically finding shin guards", base: 301 },
    ],
  },
  {
    id: "sideline-setup",
    emoji: "🪑",
    question: "Your sideline setup says…",
    options: [
      { label: "Full canopy + cooler command center", base: 233 },
      { label: "Basic folding chair, no frills", base: 389 },
      { label: "I stand and pace the whole game", base: 271 },
      { label: "Tailgate out of the trunk", base: 142 },
    ],
  },
  {
    id: "team-snack",
    emoji: "🍊",
    question: "The ultimate team snack is…",
    options: [
      { label: "Orange slices (classic)", base: 356 },
      { label: "Goldfish by the gallon", base: 298 },
      { label: "Gatorade & gummies", base: 241 },
      { label: "Donut holes (don't judge)", base: 177 },
    ],
  },
  {
    id: "kid-scores",
    emoji: "⚽",
    question: "Your kid just scored. Your reaction:",
    options: [
      { label: "Calm, dignified clap 👏", base: 198 },
      { label: "Completely lose my mind", base: 377 },
      { label: "Filming it, missed it live", base: 286 },
      { label: "Tearing up a little", base: 164 },
    ],
  },
  {
    id: "ref-policy",
    emoji: "🟨",
    question: "Your referee-interaction policy:",
    options: [
      { label: "Total silence, I behave", base: 254 },
      { label: "Encouraging comments only", base: 312 },
      { label: "…I've been spoken to before", base: 209 },
      { label: "I am a ref, please be nice", base: 121 },
    ],
  },
  {
    id: "drive-to-practice",
    emoji: "🚗",
    question: "Your drive to practice is…",
    options: [
      { label: "Under 10 min (bliss)", base: 231 },
      { label: "30 min each way grind", base: 344 },
      { label: "An hour+, I'm a warrior", base: 188 },
      { label: "Carpool hero / villain", base: 197 },
    ],
  },
  {
    id: "rainout",
    emoji: "🌧️",
    question: "Rain in the forecast. You're…",
    options: [
      { label: "Play anyway, we're tough", base: 276 },
      { label: "Praying for a text", base: 233 },
      { label: "EZ-up already packed", base: 184 },
      { label: "Secretly relieved", base: 312 },
    ],
  },
  {
    id: "group-chat",
    emoji: "📱",
    question: "Your team group chat status:",
    options: [
      { label: "Muted (sorry, coach)", base: 358 },
      { label: "200 unread, send help", base: 287 },
      { label: "I'm the organizer 💪", base: 156 },
      { label: "What group chat?", base: 121 },
    ],
  },
  {
    id: "postgame-meal",
    emoji: "🍔",
    question: "Post-game meal of choice:",
    options: [
      { label: "Chick-fil-A, obviously", base: 401 },
      { label: "Whatever's fast & open", base: 268 },
      { label: "Home cooking", base: 174 },
      { label: "Ice cream (we won!)", base: 233 },
    ],
  },
  {
    id: "cleats-budget",
    emoji: "👟",
    question: "Cleats budget reality:",
    options: [
      { label: "They grow out of them instantly", base: 389 },
      { label: "Hand-me-downs all the way", base: 201 },
      { label: "Whatever's on sale", base: 277 },
      { label: "Please don't ask", base: 218 },
    ],
  },
  {
    id: "tournament-weekend",
    emoji: "🏨",
    question: "Tournament-weekend energy:",
    options: [
      { label: "Hotel waffle-maker MVP", base: 264 },
      { label: "Granola bar in the car", base: 233 },
      { label: "Living for the team dinner", base: 312 },
      { label: "Just want my own bed", base: 198 },
    ],
  },
  {
    id: "most-used-phrase",
    emoji: "📣",
    question: "Your most-shouted sideline phrase:",
    options: [
      { label: "“Use your left!”", base: 287 },
      { label: "“Spread out!”", base: 244 },
      { label: "“Great hustle!”", base: 326 },
      { label: "…anxious silence", base: 173 },
    ],
  },
  {
    id: "soccer-parent-uniform",
    emoji: "🧥",
    question: "Your soccer-parent uniform is…",
    options: [
      { label: "Team hoodie, every game", base: 312 },
      { label: "Club polo, business casual", base: 167 },
      { label: "Whatever was clean", base: 358 },
      { label: "Full fan kit, scarf included", base: 143 },
    ],
  },
  {
    id: "coach-subs-kid",
    emoji: "🔄",
    question: "Coach subs your kid out. You're…",
    options: [
      { label: "Trust the process 🧘", base: 224 },
      { label: "Internal screaming", base: 341 },
      { label: "Checking the clock", base: 268 },
      { label: "Texting the other parents", base: 159 },
    ],
  },
  {
    id: "camp-chair-cupholder",
    emoji: "🥤",
    question: "Your camp-chair cup holder is holding…",
    options: [
      { label: "Coffee, always", base: 372 },
      { label: "It's 5 o'clock somewhere 🍷", base: 211 },
      { label: "Water, like an adult", base: 248 },
      { label: "Empty — it's chaos", base: 166 },
    ],
  },
  {
    id: "snack-parent-week",
    emoji: "🛒",
    question: "It's your snack-parent week. Energy?",
    options: [
      { label: "Costco run champion", base: 289 },
      { label: "Forgot until 6 AM", base: 301 },
      { label: "Massively over-bought", base: 224 },
      { label: "Delegated to my spouse", base: 178 },
    ],
  },
  {
    id: "tryout-season",
    emoji: "😬",
    question: "Tryout season makes you feel…",
    options: [
      { label: "Excited for them", base: 246 },
      { label: "Quietly anxious", base: 332 },
      { label: "So over it", base: 211 },
      { label: "Negotiating minutes in my head", base: 168 },
    ],
  },
  {
    id: "carpool-dj",
    emoji: "🎵",
    question: "Carpool DJ situation:",
    options: [
      { label: "Kid's playlist (no choice)", base: 318 },
      { label: "My playlist (rare win)", base: 167 },
      { label: "Silence is golden", base: 209 },
      { label: "Podcast parent", base: 188 },
    ],
  },
  {
    id: "banquet",
    emoji: "🏆",
    question: "End-of-season banquet vibes:",
    options: [
      { label: "Love it, bring the tears", base: 233 },
      { label: "Tolerate it for the kids", base: 277 },
      { label: "Trophy logistics stress", base: 142 },
      { label: "Already planning next year", base: 251 },
    ],
  },
];

export const FUN_POLLS: Poll[] = FUN_RAW.map((p) => ({ ...p, kind: "fun" }));

/** Serious "insight" polls — these reveal what Florida soccer parents actually
 *  value, fear and spend. Aggregated results are useful data for the newsletter,
 *  social posts and editorial. `base` seeds the bars so they look alive. */
const INSIGHT_RAW: Omit<Poll, "kind">[] = [
  {
    id: "choosing-a-club",
    emoji: "🧭",
    question: "What matters most when choosing a club?",
    options: [
      { label: "Coaching quality", base: 412 },
      { label: "Player-development pathway", base: 268 },
      { label: "Cost & value", base: 188 },
      { label: "Location & travel time", base: 141 },
    ],
  },
  {
    id: "why-they-play",
    emoji: "❤️",
    question: "Your child's #1 reason for playing soccer is…",
    options: [
      { label: "Pure love of the game", base: 356 },
      { label: "Friendships & belonging", base: 241 },
      { label: "Competing & winning", base: 197 },
      { label: "A path to college/pro", base: 168 },
    ],
  },
  {
    id: "biggest-stress",
    emoji: "😮‍💨",
    question: "Your family's biggest source of soccer stress?",
    options: [
      { label: "The cost", base: 298 },
      { label: "Time & travel", base: 312 },
      { label: "Playing time", base: 264 },
      { label: "Politics & favoritism", base: 233 },
    ],
  },
  {
    id: "annual-spend",
    emoji: "💸",
    question: "Honestly, how much do you spend on soccer per year?",
    options: [
      { label: "Under $1,000", base: 188 },
      { label: "$1,000–$3,000", base: 341 },
      { label: "$3,000–$6,000", base: 247 },
      { label: "$6,000+", base: 132 },
    ],
  },
  {
    id: "would-switch",
    emoji: "🔁",
    question: "What would actually make you switch clubs?",
    options: [
      { label: "Poor coaching", base: 287 },
      { label: "Lack of playing time", base: 224 },
      { label: "A big cost increase", base: 176 },
      { label: "A better opportunity elsewhere", base: 312 },
    ],
  },
  {
    id: "real-goal",
    emoji: "🎯",
    question: "Your honest goal for your kid's soccer?",
    options: [
      { label: "A college scholarship", base: 248 },
      { label: "Pro / national team", base: 121 },
      { label: "Stay active & have fun", base: 389 },
      { label: "Life skills & teamwork", base: 301 },
    ],
  },
  {
    id: "drive-distance",
    emoji: "🛣️",
    question: "How far will you drive for the right club?",
    options: [
      { label: "15 minutes, max", base: 167 },
      { label: "Up to 30 minutes", base: 312 },
      { label: "Up to an hour", base: 241 },
      { label: "Whatever it takes", base: 198 },
    ],
  },
  {
    id: "wish-club-communicated",
    emoji: "📨",
    question: "What do you wish your club communicated better?",
    options: [
      { label: "Playing-time decisions", base: 326 },
      { label: "Costs & fees upfront", base: 287 },
      { label: "The development plan", base: 211 },
      { label: "Schedule changes", base: 178 },
    ],
  },
  {
    id: "best-coach-quality",
    emoji: "🧑‍🏫",
    question: "The most important quality in a coach?",
    options: [
      { label: "Develops players", base: 358 },
      { label: "Communicates with parents", base: 224 },
      { label: "Wins games", base: 121 },
      { label: "Builds character", base: 312 },
    ],
  },
  {
    id: "how-you-find-clubs",
    emoji: "🔎",
    question: "How do you find new clubs & coaches?",
    options: [
      { label: "Word of mouth", base: 341 },
      { label: "Online reviews", base: 268 },
      { label: "Tryouts & showcases", base: 224 },
      { label: "Social media", base: 167 },
    ],
  },
  {
    id: "worth-the-cost",
    emoji: "⚖️",
    question: "Is competitive club soccer worth the cost?",
    options: [
      { label: "Absolutely", base: 287 },
      { label: "Mostly yes", base: 312 },
      { label: "On the fence", base: 198 },
      { label: "Not sure it is", base: 121 },
    ],
  },
  {
    id: "single-vs-multi-sport",
    emoji: "🤹",
    question: "Single-sport or multi-sport household?",
    options: [
      { label: "Soccer only", base: 264 },
      { label: "Soccer + one other", base: 312 },
      { label: "True multi-sport", base: 241 },
      { label: "Whatever they want", base: 198 },
    ],
  },
];

export const INSIGHT_POLLS: Poll[] = INSIGHT_RAW.map((p) => ({ ...p, kind: "insight" }));

/** One unified deck: ~2 fun polls, then 1 insight poll, repeating. Once the
 *  insight polls run out, the remaining fun polls fill in. Deterministic order. */
function buildDeck(fun: Poll[], insight: Poll[]): Poll[] {
  const out: Poll[] = [];
  let fi = 0;
  let ii = 0;
  while (fi < fun.length || ii < insight.length) {
    for (let k = 0; k < 2 && fi < fun.length; k++) out.push(fun[fi++]);
    if (ii < insight.length) out.push(insight[ii++]);
  }
  return out;
}

export const POLLS: Poll[] = buildDeck(FUN_POLLS, INSIGHT_POLLS);

/** Deterministic "poll of the day" index (changes daily, same for everyone). */
export function pollOfTheDayIndex(): number {
  const day = Math.floor(Date.now() / 86400000);
  return day % POLLS.length;
}

/** Deterministic "poll of the week" index — used in the weekly newsletter. */
export function pollOfTheWeekIndex(): number {
  const week = Math.floor(Date.now() / (7 * 86400000));
  return week % POLLS.length;
}

/** Deterministic "insight of the week" — cycles the serious polls for the
 *  newsletter's Parent Pulse section. */
export function insightOfTheWeekIndex(): number {
  const week = Math.floor(Date.now() / (7 * 86400000));
  return week % INSIGHT_POLLS.length;
}
